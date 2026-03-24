// ignore_for_file: use_build_context_synchronously, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:tv_app/screens/player_screen.dart';
import 'package:tv_app/screens/youtube_player.dart';
import 'package:tv_app/services/functions.dart';
import 'package:tv_app/services/widgets.dart';
import '../providers/channel_provider.dart';
import '../models/channel.dart';
import '../services/database_helper.dart';
import 'search_screen.dart';
import 'playlist_screen.dart';

class IptvHomeScreen extends StatefulWidget {
  const IptvHomeScreen({super.key});

  @override
  State<IptvHomeScreen> createState() => _IptvHomeScreenState();
}

class _IptvHomeScreenState extends State<IptvHomeScreen> {
  final ScrollController _channelScrollController = ScrollController();
  final Map<String, FocusNode> _channelFocusNodes = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChannelProvider>().loadChannels();
    });
  }

  @override
  void dispose() {
    _channelScrollController.dispose();
    for (var focusNode in _channelFocusNodes.values) {
      focusNode.dispose();
    }
    super.dispose();
  }

  FocusNode _getFocusNode(String channelId) {
    if (!_channelFocusNodes.containsKey(channelId)) {
      _channelFocusNodes[channelId] = FocusNode();
    }
    return _channelFocusNodes[channelId]!;
  }

  void _scrollToFirstChannelAndFocus() {
    // Scroll to top
    if (_channelScrollController.hasClients) {
      _channelScrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }

    // Focus first channel
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ChannelProvider>();
      if (provider.displayedChannels.isNotEmpty) {
        final firstChannel = provider.displayedChannels.first;
        final focusNode = _getFocusNode(firstChannel.id.toString());
        focusNode.requestFocus();
      }
    });
  }

  void _showChannelMenu(BuildContext context, Channel channel, Offset position) async {
    final provider = context.read<ChannelProvider>();
    final channelIndex = provider.displayedChannels.indexWhere((c) => c.id == channel.id);
    final db = DatabaseHelper.instance;

    // Load playlists
    final playlistMaps = await db.getPlaylists();

    showMenu(
      context: context,
      position: RelativeRect.fromLTRB(
        position.dx,
        position.dy,
        position.dx + 1,
        position.dy + 1,
      ),
      items: [
        PopupMenuItem(
          child: Focus(
            autofocus: true,
            child: Row(
              children: [
                Icon(
                  channel.isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: Colors.red,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Text(
                  channel.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
          ),
          onTap: () {
            provider.toggleFavorite(channel);
          },
        ),
        if (playlistMaps.isNotEmpty)
          const PopupMenuItem(
            enabled: false,
            child: Text(
              'Add to Playlist',
              style: TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold),
            ),
          ),
        ...playlistMaps.map((playlistMap) {
          return PopupMenuItem(
            child: Focus(
              child: Row(
                children: [
                  const Icon(Icons.playlist_add, size: 20),
                  const SizedBox(width: 12),
                  Text(
                    playlistMap['name'] as String,
                    style: const TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
            onTap: () async {
              if (channel.id != null && playlistMap['id'] != null) {
                final isInPlaylist = await db.isChannelInPlaylist(
                  playlistMap['id'] as int,
                  channel.id!,
                );

                if (isInPlaylist) {
                  await db.removeChannelFromPlaylist(
                    playlistMap['id'] as int,
                    channel.id!,
                  );
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Removed from ${playlistMap['name']}'),
                        backgroundColor: Colors.orange,
                      ),
                    );
                  }
                } else {
                  await db.addChannelToPlaylist(
                    playlistMap['id'] as int,
                    channel.id!,
                  );
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Added to ${playlistMap['name']}'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                }
              }
            },
          );
        }),
        PopupMenuItem(
          child: const Focus(
            child: Row(
              children: [
                Icon(Icons.play_arrow, size: 20),
                SizedBox(width: 12),
                Text('Play Channel', style: TextStyle(fontSize: 16)),
              ],
            ),
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PlayerScreen(
                  channel: channel,
                  channelList: provider.displayedChannels,
                  currentIndex: channelIndex >= 0 ? channelIndex : 0,
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Row(
        children: [
          _buildSidebar(),
          Expanded(child: _buildChannelGrid()),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha:0.3),
            blurRadius: 10,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const Divider(color: Color(0xFF333333), height: 1),
          Expanded(child: _buildCategoryList()),
        ],
      ),
    );
  }

Widget _buildHeader() {
  return Container(
    padding: const EdgeInsets.all(24),
    child: Column(
      children: [
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            TvFocusButton(
              tooltip: 'Search',
              onPressed: () {
                print("object");
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const SearchScreen(),
                  ),
                );
              },
              child: const Icon(Icons.search),
            ),
            TvFocusButton(
              tooltip: 'Playlists',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const PlaylistScreen(),
                  ),
                );
              },
              child: const Icon(Icons.playlist_play),
            ),
            Consumer<ChannelProvider>(
              builder: (context, provider, _) {
                return TvFocusButton(
                  tooltip: 'Refresh',
                  onPressed: provider.isLoading
                      ? null
                      : () => provider.refreshChannels(),
                  child: provider.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.refresh),
                );
              },
            ),
          ],
        ),
      ],
    ),
  );
}
  Widget _buildCategoryList() {
    return Consumer<ChannelProvider>(
      builder: (context, provider, _) {
        if (provider.categories.isEmpty) {
          return const Center(
            child: Text(
              'No categories',
              style: TextStyle(color: Colors.grey),
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: provider.categories.length,
          itemBuilder: (context, index) {
            final category = provider.categories[index];
            final isSelected = category == provider.selectedCategory;

            return Focus(
              onKeyEvent: (node, event) {
                if (event is KeyDownEvent &&
                    (event.logicalKey == LogicalKeyboardKey.select ||
                        event.logicalKey == LogicalKeyboardKey.enter)) {
                  provider.selectCategory(category);
                  _scrollToFirstChannelAndFocus();
                  return KeyEventResult.handled;
                }
                return KeyEventResult.ignored;
              },
              child: Builder(
                builder: (context) {
                  final isFocused = Focus.of(context).hasFocus;

                  return InkWell(
                    onTap: () {
                      provider.selectCategory(category);
                      _scrollToFirstChannelAndFocus();
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFE50914) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: isFocused && !isSelected
                            ? Border.all(color: const Color(0xFF1E88E5), width: 2)
                            : null,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _getCategoryIcon(category),
                            color: isSelected || isFocused ? Colors.white : Colors.grey,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              category,
                              style: TextStyle(
                                color: isSelected || isFocused ? Colors.white : Colors.grey,
                                fontSize: 16,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }

  IconData _getCategoryIcon(String category) {
    if (category == 'All') return Icons.grid_view;
    if (category == 'Favorites') return Icons.favorite;
    if (category.toLowerCase().contains('sport')) return Icons.sports;
    if (category.toLowerCase().contains('news')) return Icons.newspaper;
    if (category.toLowerCase().contains('movie')) return Icons.movie;
    if (category.toLowerCase().contains('music')) return Icons.music_note;
    if (category.toLowerCase().contains('kids')) return Icons.child_care;
    return Icons.tv;
  }

  Widget _buildChannelGrid() {
    return Consumer<ChannelProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Center(
            child: SpinKitFadingCircle(color: Color(0xFFE50914), size: 60),
          );
        }

        if (provider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 60),
                const SizedBox(height: 16),
                Text(
                  'Error: ${provider.error}',
                  style: const TextStyle(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => provider.refreshChannels(),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE50914),
                  ),
                ),
              ],
            ),
          );
        }

        final channels = provider.displayedChannels;

        if (channels.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.tv_off, color: Colors.grey, size: 60),
                const SizedBox(height: 16),
                Text(
                  provider.selectedCategory == 'Favorites'
                      ? 'No favorite channels yet'
                      : 'No channels available',
                  style: const TextStyle(color: Colors.white70, fontSize: 18),
                ),
              ],
            ),
          );
        }

        return GridView.builder(
          controller: _channelScrollController,
          padding: const EdgeInsets.all(24),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            childAspectRatio: 1.2,
            crossAxisSpacing: 20,
            mainAxisSpacing: 20,
          ),
          itemCount: channels.length,
          itemBuilder: (context, index) {
            final channel = channels[index];
            return _buildChannelCard(channel);
          },
        );
      },
    );
  }

void _play(Channel channel) {
   final provider = context.read<ChannelProvider>();
     final channelIndex = provider.displayedChannels.indexWhere((c) => c.id == channel.id);
  if(isMissingHttpScheme(channel.url)){
       Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => YouTubeLivePlayer(ch:channel),
        ),
      );
return;
   }else{
      Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PlayerScreen(
                  channel: channel,
                  channelList: provider.displayedChannels,
                  currentIndex: channelIndex >= 0 ? channelIndex : 0,
                ),
              ),
            );
   }

}
  Widget _buildChannelCard(Channel channel) {
    final focusNode = _getFocusNode(channel.id.toString());

    return Focus(
      focusNode: focusNode,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent) {
          // Long press simulation with Menu button or Info button
          if (event.logicalKey == LogicalKeyboardKey.contextMenu ||
              event.logicalKey == LogicalKeyboardKey.info) {
            final RenderBox renderBox = context.findRenderObject() as RenderBox;
            final position = renderBox.localToGlobal(Offset.zero);
            _showChannelMenu(
              context,
              channel,
              Offset(position.dx + 100, position.dy + 100),
            );
            return KeyEventResult.handled;
          }
          // Play with select/enter
          else if (event.logicalKey == LogicalKeyboardKey.select ||
              event.logicalKey == LogicalKeyboardKey.enter) {
           _play(channel);
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;
          return GestureDetector(
            onTap: () {
              _play(channel);
            },
            onLongPressStart: (details) {
              _showChannelMenu(context, channel, details.globalPosition);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              transform: Matrix4.identity()..scale(isFocused ? 1.08 : 1.0),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(12),
                border: isFocused
                    ? Border.all(color: const Color(0xFFE50914), width: 3)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: isFocused
                        ? const Color(0xFFE50914).withValues(alpha:0.5)
                        : Colors.black.withValues(alpha:0.3),
                    blurRadius: isFocused ? 16 : 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Column(
                      children: [
                        Expanded(
                          child: channel.poster != null && channel.poster!.isNotEmpty
                              ? CachedNetworkImage(
                                  imageUrl: channel.poster!,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  placeholder: (context, url) => Container(
                                    color: const Color(0xFF2A2A2A),
                                    child: const Center(
                                      child: Icon(Icons.tv, color: Colors.grey, size: 40),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => Container(
                                    color: const Color(0xFF2A2A2A),
                                    child: const Center(
                                      child: Icon(Icons.tv, color: Colors.grey, size: 40),
                                    ),
                                  ),
                                )
                              : Container(
                                  color: const Color(0xFF2A2A2A),
                                  child: const Center(
                                    child: Icon(Icons.tv, color: Colors.grey, size: 40),
                                  ),
                                ),
                        ),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF1A1A1A), Color(0xFF0F0F0F)],
                            ),
                          ),
                          child: Text(
                            channel.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (channel.isFavorite)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.favorite,
                          color: Color(0xFFE50914),
                          size: 18,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

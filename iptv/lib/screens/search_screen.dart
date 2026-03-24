import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/channel_provider.dart';
import '../models/channel.dart';
import 'player_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Channel> _searchResults = [];
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch(String query, List<Channel> allChannels) {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    final lowerQuery = query.toLowerCase();
    final results = allChannels.where((channel) {
      return channel.name.toLowerCase().contains(lowerQuery) ||
          channel.category.toLowerCase().contains(lowerQuery);
    }).toList();

    setState(() {
      _searchResults = results;
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChannelProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Column(
        children: [
          // Search Header
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha:0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Focus(
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                    iconSize: 28,
                  ),
                ),
                const SizedBox(width: 16),
               Expanded(
  child: Focus(
    onKeyEvent: (node, event) {
      // If user presses Down arrow on remote, move focus to the first search result
      if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.arrowDown) {
        FocusScope.of(context).nextFocus();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored;
    },
    child: TextField(
                      controller: _searchController,autofocus: true,
                      style: const TextStyle(color: Colors.white, fontSize: 18),
                      decoration: InputDecoration(
                        hintText: 'Search channels...',
                        hintStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: const Color(0xFF2A2A2A),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE50914),
                            width: 2,
                          ),
                        ),
                        prefixIcon: const Icon(Icons.search, color: Colors.grey),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, color: Colors.grey),
                                onPressed: () {
                                  _searchController.clear();
                                  _performSearch('', provider.channels);
                                },
                              )
                            : null,
                      ),
                      onChanged: (value) {
                        _performSearch(value, provider.channels);
                      },
                    ),
  ),
),const SizedBox(width: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2A2A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_searchResults.length} results',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),

          // Search Results
          Expanded(
            child: _buildSearchResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    if (!_isSearching && _searchController.text.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.search, color: Colors.grey, size: 80),
            SizedBox(height: 16),
            Text(
              'Search for channels',
              style: TextStyle(color: Colors.white70, fontSize: 18),
            ),
            SizedBox(height: 8),
            Text(
              'Use the search bar above or voice input',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
      );
    }

    if (_searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, color: Colors.grey, size: 80),
            const SizedBox(height: 16),
            Text(
              'No results for "${_searchController.text}"',
              style: const TextStyle(color: Colors.white70, fontSize: 18),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        childAspectRatio: 1.0,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        final channel = _searchResults[index];
        return _buildChannelCard(channel, index);
      },
    );
  }

  Widget _buildChannelCard(Channel channel, int index) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PlayerScreen(
                channel: channel,
                channelList: _searchResults,
                currentIndex: index,
              ),
            ),
          );
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PlayerScreen(
                    channel: channel,
                    channelList: _searchResults,
                    currentIndex: index,
                  ),
                ),
              );
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              transform: Matrix4.identity()..scale(isFocused ? 1.1 : 1.0),
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
              child: ClipRRect(
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
                                  child: Icon(Icons.tv, color: Colors.grey, size: 30),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Center(
                                  child: Icon(Icons.tv, color: Colors.grey, size: 30),
                                ),
                              ),
                            )
                          : Container(
                              color: const Color(0xFF2A2A2A),
                              child: const Center(
                                child: Icon(Icons.tv, color: Colors.grey, size: 30),
                              ),
                            ),
                    ),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A1A1A),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            channel.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            channel.category,
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 10,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

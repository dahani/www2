import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/database_helper.dart';
import '../models/playlist.dart';
import '../models/channel.dart';
import 'player_screen.dart';

class PlaylistScreen extends StatefulWidget {
  const PlaylistScreen({super.key});

  @override
  State<PlaylistScreen> createState() => _PlaylistScreenState();
}

class _PlaylistScreenState extends State<PlaylistScreen> {
  final DatabaseHelper _db = DatabaseHelper.instance;
  List<Playlist> _playlists = [];
  Playlist? _selectedPlaylist;
  List<Channel> _playlistChannels = [];

  @override
  void initState() {
    super.initState();
    _loadPlaylists();
  }

  Future<void> _loadPlaylists() async {
    final playlistMaps = await _db.getPlaylists();
    setState(() {
      _playlists = playlistMaps.map((map) => Playlist.fromMap(map)).toList();
    });
  }

  Future<void> _loadPlaylistChannels(int playlistId) async {
    final channels = await _db.getPlaylistChannels(playlistId);
    setState(() {
      _playlistChannels = channels;
    });
  }

  // --- FULLY FOCUSABLE DIALOG ---
  Future<void> _createPlaylist() async {
    final controller = TextEditingController();

    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Create Playlist', style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Playlist name',
            hintStyle: const TextStyle(color: Colors.grey),
            filled: true,
            fillColor: const Color(0xFF2A2A2A),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE50914), width: 2),
            ),
          ),
          onSubmitted: (_) => FocusScope.of(context).nextFocus(), // Move focus to buttons
        ),
        actions: [
          _DialogButton(label: 'Cancel', onPressed: () => Navigator.pop(context)),
          _DialogButton(
            label: 'Create',
            isPrimary: true,
            onPressed: () => Navigator.pop(context, controller.text),
          ),
        ],
      ),
    );

    if (result != null && result.isNotEmpty) {
      await _db.createPlaylist(result);
      _loadPlaylists();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Row(
        children: [
          _buildPlaylistSidebar(),
          Expanded(child: _buildPlaylistContent()),
        ],
      ),
    );
  }

  Widget _buildPlaylistSidebar() {
    return Container(
      width: 280,
      color: const Color(0xFF1A1A1A),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Row(
                  children: [
                    _TVIconButton(icon: Icons.arrow_back, onPressed: () => Navigator.pop(context)),
                    const SizedBox(width: 8),
                    const Text('Playlists', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                _TVButton(label: 'New Playlist', icon: Icons.add, onPressed: _createPlaylist),
              ],
            ),
          ),
          const Divider(color: Color(0xFF333333), height: 1),
          Expanded(
            child: ListView.builder(
              itemCount: _playlists.length,
              itemBuilder: (context, index) {
                final playlist = _playlists[index];
                final isSelected = _selectedPlaylist?.id == playlist.id;

                return Focus(
                  onKeyEvent: (node, event) {
                    if (event is KeyDownEvent && (event.logicalKey == LogicalKeyboardKey.select || event.logicalKey == LogicalKeyboardKey.enter)) {
                      setState(() { _selectedPlaylist = playlist; });
                      if (playlist.id != null) _loadPlaylistChannels(playlist.id!);
                      return KeyEventResult.handled;
                    }
                    return KeyEventResult.ignored;
                  },
                  child: Builder(builder: (context) {
                    final isFocused = Focus.of(context).hasFocus;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: isFocused ? Colors.white : (isSelected ? const Color(0xFFE50914) : Colors.transparent),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ListTile(
                        title: Text(playlist.name, style: TextStyle(color: isFocused ? Colors.black : Colors.white)),
                        subtitle: Text('${playlist.channelCount} channels', style: TextStyle(color: isFocused ? Colors.black54 : Colors.white70)),
                        leading: Icon(Icons.playlist_play, color: isFocused ? Colors.black : Colors.white),
                        onTap: () {
                          setState(() { _selectedPlaylist = playlist; });
                          if (playlist.id != null) _loadPlaylistChannels(playlist.id!);
                        },
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaylistContent() {
    if (_selectedPlaylist == null) return const Center(child: Text('Select a playlist', style: TextStyle(color: Colors.white70)));

    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, childAspectRatio: 1.2, crossAxisSpacing: 20, mainAxisSpacing: 20),
      itemCount: _playlistChannels.length,
      itemBuilder: (context, index) {
        final channel = _playlistChannels[index];
        return Focus(
          onKeyEvent: (node, event) {
            if (event is KeyDownEvent && (event.logicalKey == LogicalKeyboardKey.select || event.logicalKey == LogicalKeyboardKey.enter)) {
              _openPlayer(channel, index);
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: Builder(builder: (context) {
            final isFocused = Focus.of(context).hasFocus;
            return GestureDetector(
              onTap: () => _openPlayer(channel, index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A1A),
                  borderRadius: BorderRadius.circular(12),
                  border: isFocused ? Border.all(color: const Color(0xFFE50914), width: 3) : null,
                //  scale: isFocused ? 1.05 : 1.0,
                ),
                child: Center(child: Text(channel.name, style: const TextStyle(color: Colors.white))),
              ),
            );
          }),
        );
      },
    );
  }

  void _openPlayer(Channel channel, int index) {
    Navigator.push(context, MaterialPageRoute(builder: (context) => PlayerScreen(channel: channel, channelList: _playlistChannels, currentIndex: index)));
  }
}

// --- HELPER TV WIDGETS ---

class _TVButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  const _TVButton({required this.label, required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && (event.logicalKey == LogicalKeyboardKey.select || event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (context) {
        final isFocused = Focus.of(context).hasFocus;
        return GestureDetector(
          onTap: onPressed,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(color: isFocused ? Colors.white : const Color(0xFFE50914), borderRadius: BorderRadius.circular(8)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: isFocused ? Colors.black : Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(label, style: TextStyle(color: isFocused ? Colors.black : Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      }),
    );
  }
}

class _TVIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _TVIconButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && (event.logicalKey == LogicalKeyboardKey.select || event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (context) {
        final isFocused = Focus.of(context).hasFocus;
        return IconButton(
          icon: Icon(icon, color: isFocused ? const Color(0xFFE50914) : Colors.white),
          onPressed: onPressed,
        );
      }),
    );
  }
}

class _DialogButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isPrimary;

  const _DialogButton({required this.label, required this.onPressed, this.isPrimary = false});

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && (event.logicalKey == LogicalKeyboardKey.select || event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (context) {
        final isFocused = Focus.of(context).hasFocus;
        return OutlinedButton(
          style: OutlinedButton.styleFrom(
            backgroundColor: isFocused ? Colors.white : (isPrimary ? const Color(0xFFE50914) : Colors.transparent),
            side: BorderSide(color: isFocused ? Colors.white : Colors.grey),
          ),
          onPressed: onPressed,
          child: Text(label, style: TextStyle(color: isFocused ? Colors.black : Colors.white)),
        );
      }),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class YouTubeLivePlayer extends StatefulWidget {
  const YouTubeLivePlayer({super.key});

  @override
  State<YouTubeLivePlayer> createState() => _YouTubeLivePlayerState();
}

class _YouTubeLivePlayerState extends State<YouTubeLivePlayer> {
  // Replace with the specific YouTube video ID or live stream ID
  final String videoId = 'xNYkxluuT1E';//

  late YoutubePlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = YoutubePlayerController(
      initialVideoId: videoId,
      flags: const YoutubePlayerFlags(controlsVisibleAtStart: true,
        autoPlay: true,
        mute: false,
        isLive: false, // Set to true for live streams
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return YoutubePlayerBuilder(
      player: YoutubePlayer(
        controller: _controller,
        aspectRatio: 16 / 9,
      ),
      builder: (context, player) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Live YouTube Stream'),
          ),
          body: Center(
            child: player, // Embeds the YouTube player widget
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

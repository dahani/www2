// ignore_for_file: public_member_api_docs, sort_constructors_first

import 'package:flutter/material.dart';
import 'package:tv_app/models/channel.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class YouTubeLivePlayer extends StatefulWidget {
  final Channel ch;
  const YouTubeLivePlayer({
    super.key,
    required this.ch,
  });

  @override
  State<YouTubeLivePlayer> createState() => _YouTubeLivePlayerState();
}

class _YouTubeLivePlayerState extends State<YouTubeLivePlayer> {
  // Replace with the specific YouTube video ID or live stream ID
  final String videoId = 'xNYkxluuT1E';//

  late YoutubePlayerController _controller;
String? getYoutubeVideoId(String url) {
  try {
    final uri = Uri.parse(url);

    // youtu.be/VIDEO_ID
    if (uri.host.contains('youtu.be')) {
      return uri.pathSegments.isNotEmpty ? uri.pathSegments.first : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (uri.queryParameters.containsKey('v')) {
      return uri.queryParameters['v'];
    }

    // youtube.com/embed/VIDEO_ID
    // youtube.com/shorts/VIDEO_ID
    // youtube.com/live/VIDEO_ID
    final segments = uri.pathSegments;

    for (int i = 0; i < segments.length; i++) {
      if (segments[i] == 'embed' ||
          segments[i] == 'shorts' ||
          segments[i] == 'live') {
        if (i + 1 < segments.length) {
          return segments[i + 1];
        }
      }
    }

    return null;
  } catch (_) {
    return null;
  }
}

  @override
  void initState() {
    super.initState();
    _controller = YoutubePlayerController(
      initialVideoId: widget.ch.url,
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
            title:  Text(widget.ch.name),
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

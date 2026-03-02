import 'package:flutter/material.dart';
import 'package:tha_player/tha_player.dart';

class ChannelPlayerWidget extends StatefulWidget {
  final String url;

  const ChannelPlayerWidget({
    super.key,
    required this.url,
  });

  @override
  State<ChannelPlayerWidget> createState() => _ChannelPlayerWidgetState();
}

class _ChannelPlayerWidgetState extends State<ChannelPlayerWidget> {
  late ThaNativePlayerController _controller;

  @override
  void initState() {
    super.initState();


    _controller = ThaNativePlayerController.single(
      ThaMediaSource(widget.url,isLive: true),
      autoPlay: true,
      playbackOptions: const ThaPlaybackOptions(
        maxRetryCount: 3,
        initialRetryDelay: Duration(milliseconds: 800),
      ),
      initialPreferences: const ThaPlayerPreferences(
        playbackSpeed: 1.0,
        dataSaver: false,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return  ThaModernPlayer(
                      controller: _controller,
                      doubleTapSeek: const Duration(seconds: 10),
                      longPressSeek: const Duration(seconds: 3),
                      autoHideAfter: const Duration(seconds: 3),
                      initialBoxFit: BoxFit.fill,autoFullscreen: false,
                      onErrorDetails: (err) {
                        if (err != null) {
                          debugPrint(
                              "Playback error: ${err.code} • ${err.message}");
                        }
                      },
                    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:better_player_plus/better_player_plus.dart';
import '../models/movie.dart';
import 'package:tv_app/services/functions.dart';

class BetterMoviePlayerScreen extends StatefulWidget {
  final List<MovieVideo> videos;
  final int currentVideoIndex;
  final String movieTitle;

  const BetterMoviePlayerScreen({
    super.key,
    required this.videos,
    this.currentVideoIndex = 0,
    required this.movieTitle,
  });

  @override
  State<BetterMoviePlayerScreen> createState() =>
      _BetterMoviePlayerScreenState();
}

class _BetterMoviePlayerScreenState
    extends State<BetterMoviePlayerScreen> {
  BetterPlayerController? _controller;

  late int _index;
  bool _isBuffering = false;


  /// FOCUS NODES
  final FocusNode _rootFocus = FocusNode();
  final FocusNode _playFocus = FocusNode();
  final FocusNode _rewindFocus = FocusNode();
  final FocusNode _forwardFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _index = widget.currentVideoIndex;
    _initPlayer();
  }

  Future<String> _buildUrl(String src) async {
    final videoId = getVideoId(src);
    final ip = await getLocalIp();
    return "http://$ip:8080/master.m3u8?id=$videoId";
  }

  Future<void> _initPlayer() async {
    final video = widget.videos[_index];
   // final url ="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; //
   final url=await _buildUrl(video.src);

    final dataSource = BetterPlayerDataSource(
      BetterPlayerDataSourceType.network,
      url,
    );

    _controller = BetterPlayerController(
      const BetterPlayerConfiguration(
        autoPlay: true,allowedScreenSleep: false,
        fullScreenByDefault: false,
        controlsConfiguration:
            BetterPlayerControlsConfiguration(
               enableMute: false,enableOverflowMenu: false,
            ),
      ),
      betterPlayerDataSource: dataSource,
    );


    setState(() {});
  }

  void _togglePlay() {
    if (_controller!.isPlaying() ?? false) {
      _controller!.pause();
    } else {
      _controller!.play();
    }
  }

  void _seek(int seconds) {
    final v = _controller!.videoPlayerController!.value;
    final newPos = v.position + Duration(seconds: seconds);

    _controller!.seekTo(
      newPos < Duration.zero
          ? Duration.zero
          : (v.duration != null && newPos > v.duration!
              ? v.duration!
              : newPos),
    );
  }



  @override
  void dispose() {
    _controller?.dispose();
    _rootFocus.dispose();
    _playFocus.dispose();
    _rewindFocus.dispose();
    _forwardFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: FocusScope(

        autofocus: true,
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            _controller!.setControlsVisibility(true);
              if (event.logicalKey == LogicalKeyboardKey.select ||
                  event.logicalKey ==
                      LogicalKeyboardKey.enter) {
                _togglePlay();
                return KeyEventResult.handled;
              }

              if (event.logicalKey ==
                  LogicalKeyboardKey.arrowRight) {
                _seek(60);
                return KeyEventResult.handled;
              }

              if (event.logicalKey ==
                  LogicalKeyboardKey.arrowLeft) {
                _seek(-60);
                return KeyEventResult.handled;
              }


              if (event.logicalKey ==
                  LogicalKeyboardKey.arrowUp) {
                _seek(-300);
                return KeyEventResult.handled;
              }

              if (event.logicalKey ==
                  LogicalKeyboardKey.arrowDown) {
                _seek(300);
                return KeyEventResult.handled;
              }

              return KeyEventResult.handled;
            }

          return KeyEventResult.ignored;
        },
        child: Stack(
          children: [
            Center(
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: BetterPlayer(controller: _controller!),
              ),
            ),

            if (_isBuffering)
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }


}
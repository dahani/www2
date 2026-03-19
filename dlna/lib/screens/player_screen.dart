// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:better_player_plus/better_player_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class PlayerScreen extends StatefulWidget {
  final String url;
  final String title;
  final bool isMovie;

  const PlayerScreen({
    super.key,
    required this.url,
    required this.title,
     this.isMovie=false,
  });

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late BetterPlayerController _controller;
   final GlobalKey _betterPlayerKey = GlobalKey();
void _onReceiveTaskData(Object data) {

  if(data=="btn_stop"){
    FlutterForegroundTask.stopService();
  }
  if(data=="btn_pause"){
    if(_controller.isPlaying()!){
      _controller.pause();
    }else{
      _controller.play();
    }

   // dlnaService.pause();
  }
    debugPrint('onReceiveTaskData: $data');
   //
  }
  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    setd();
     FlutterForegroundTask.addTaskDataCallback(_onReceiveTaskData);
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _controller.dispose();
    super.dispose();
  }

  void setd() {
    _controller = BetterPlayerController(
      BetterPlayerConfiguration(
        aspectRatio: 16 / 10.5,
        autoPlay: true,fullScreenByDefault: true,
        looping: false,
        allowedScreenSleep: false,
        autoDetectFullscreenDeviceOrientation: true,
        autoDetectFullscreenAspectRatio: true,
        placeholderOnTop: false,
        expandToFill: true,
        handleLifecycle: true,
        fit: BoxFit.fill,
        autoDispose: true,
        //eventListener: (event) { },
        controlsConfiguration: BetterPlayerControlsConfiguration(
          controlBarColor: Colors.black.withAlpha(150),
          enablePlayPause: false,
          enableMute: false,
          enableFullscreen: true,
          enablePip: true,
          enableAudioTracks: true,
          enableProgressBar: true,
          enableOverflowMenu: true,
          enablePlaybackSpeed: false,
          enableRetry: true,
          enableSubtitles: false,enableSkips: false,
        ),
      ),
      betterPlayerDataSource: BetterPlayerDataSource(
        BetterPlayerDataSourceType.network,
        widget.url,
        title: widget.title,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AspectRatio(
              aspectRatio: 16 / 11,
              child: BetterPlayer(key: _betterPlayerKey, controller: _controller),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            ElevatedButton(onPressed: () {
               _controller.enablePictureInPicture(_betterPlayerKey);
            }, child: Text("Full screen"))
          ],
        ),
      ),
    );
  }
}

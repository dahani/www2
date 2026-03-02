import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:better_player_plus/better_player_plus.dart';
import 'package:dlna/services/database_service.dart';

class HlsPlayerPagebetter extends StatefulWidget {
  final String url;
  final String title;
  final String categoryId;

  const HlsPlayerPagebetter({
    super.key,
    required this.url,
    required this.title,
    required this.categoryId,
  });

  @override
  State<HlsPlayerPagebetter> createState() => _HlsPlayerPagebetterState();
}

class _HlsPlayerPagebetterState extends State<HlsPlayerPagebetter> {
  List<Map<String, dynamic>> _channels = [];
  List<BetterPlayerDataSource> _playlist = [];
  late BetterPlayerController _controller;

  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    _loadChannels();
  }

  Future<void> _loadChannels() async {
    _channels = await DatabaseService.instance
        .getChannelsByCategory(int.parse(widget.categoryId));

    _playlist = [];

    for (var channel in _channels) {
      String? url = channel['url'];

      if (url == null && channel['resolutions'] != null) {
        final resolutions = jsonDecode(channel['resolutions']);
        url = resolutions.entries.first.value['url'];
      }

      if (url != null && url.isNotEmpty) {
        _playlist.add(BetterPlayerDataSource(
          BetterPlayerDataSourceType.network,
          url,
          liveStream: false,
        ));
      }
    }

    // Déterminer index initial
    _currentIndex = _channels.indexWhere((c) => c['url'] == widget.url);
    if (_currentIndex < 0) _currentIndex = 0;

    // Créer le controller
    _controller = BetterPlayerController(
      BetterPlayerConfiguration(
        aspectRatio: 16/9,
        autoPlay: true,
        looping: false,
        allowedScreenSleep: false,
        autoDetectFullscreenDeviceOrientation: true,
        autoDetectFullscreenAspectRatio: true,
        placeholderOnTop: false,expandToFill: true,
        fit: BoxFit.fill,
        controlsConfiguration: const BetterPlayerControlsConfiguration(
          enablePlayPause: true,
          enableMute: false,
          enableFullscreen: true,
          enablePip: true,enableAudioTracks: true,enableProgressBar: true,
          enableOverflowMenu: false,
          enablePlaybackSpeed: false,enableRetry: true,enableSubtitles: false,
        ),
      ),
      betterPlayerDataSource: _playlist[_currentIndex],
    );

    setState(() {});
  }

  void _playChannelById(dynamic channel) {
  String? url = channel['url'];

      if (url == null && channel['resolutions'] != null) {
        final resolutions = jsonDecode(channel['resolutions']);
        url = resolutions.entries.first.value['url'];
      }

      if (url != null && url.isNotEmpty) {
        _playlist.add(BetterPlayerDataSource(
          BetterPlayerDataSourceType.network,
          url,
          liveStream: false,
        ));
      }
final BetterPlayerDataSource dataSource = BetterPlayerDataSource(
      BetterPlayerDataSourceType.network,
      url??"",
    );
    _controller.setupDataSource(dataSource);



    Navigator.pop(context);
  }


  @override
  void dispose() {
    WakelockPlus.disable();
    _controller.dispose();
    super.dispose();
  }

void setd(){
 _controller = BetterPlayerController(
      BetterPlayerConfiguration(
        aspectRatio: 16/9,
        autoPlay: true,
        looping: false,
        allowedScreenSleep: false,
        autoDetectFullscreenDeviceOrientation: true,
        autoDetectFullscreenAspectRatio: true,
        placeholderOnTop: true,
        fit: BoxFit.fill,
        controlsConfiguration: const BetterPlayerControlsConfiguration(
          enablePlayPause: true,
          enableMute: false,
          enableFullscreen: true,
          enablePip: true,enableAudioTracks: true,enableProgressBar: true,
          enableOverflowMenu: true,
          enablePlaybackSpeed: false,enableRetry: true,enableSubtitles: false,
        ),
      ),
      betterPlayerDataSource: _playlist[_currentIndex],
    );
}
  @override
  Widget build(BuildContext context) {


    if (_playlist.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return SafeArea(
      child: Scaffold(
        drawer: Drawer(
          child: ListView.builder(
            itemCount: _channels.length,
            itemBuilder: (_, index) {
              final ch = _channels[index];
              return ListTile(
                leading: CachedNetworkImage(
                  imageUrl: ch['poster'] ?? "",
                  width: 50,
                  height: 50,
                  placeholder: (_, _) => const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator()),
                  errorWidget: (_, _, _) => const Icon(Icons.error),
                ),
                title: Text(ch['name']),
                selected: index == _currentIndex,
                onTap: () => _playChannelById(ch),
              );
            },
          ),
        ),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: BetterPlayer(key: GlobalKey(), controller: _controller),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                _channels[_currentIndex]['name']+"ddd",
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            ElevatedButton(onPressed: setd, child: Text("data"))
          ],
        ),
      ),
    );
  }
}

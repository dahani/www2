// ignore_for_file: use_build_context_synchronously

import 'dart:async';
import 'package:better_player_plus/better_player_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:dlna/models/models.dart';

class TvPlayerScreen extends StatefulWidget {
  final List<ChannelModel> channels;
  final int initialIndex;

  const TvPlayerScreen({
    super.key,
    required this.channels,
    required this.initialIndex,
  });

  @override
  State<TvPlayerScreen> createState() => _TvPlayerScreenState();
}

class _TvPlayerScreenState extends State<TvPlayerScreen> {
  late BetterPlayerController _controller;

  late int currentIndex;
  ChannelModel get current => widget.channels[currentIndex];

  final FocusNode _focusNode = FocusNode();

  bool showOverlay = true;
  Timer? _hideTimer;

  /// 🔥 Channel list overlay
  bool showChannelList = false;
  int listIndex = 0;

  @override
  void initState() {
    super.initState();

    currentIndex = widget.initialIndex;

    WakelockPlus.enable();
    _initPlayer();

    _startHideTimer();
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

  // =========================
  // 🎥 INIT PLAYER
  // =========================
  void _initPlayer() {
    _controller = BetterPlayerController(
      BetterPlayerConfiguration(
        autoPlay: true,
        fullScreenByDefault: true,
        fit: BoxFit.contain,
        handleLifecycle: true,
        allowedScreenSleep: false,
        controlsConfiguration: const BetterPlayerControlsConfiguration(
          enablePlayPause: false,
          enableProgressBar: false,
          enableFullscreen: false,
        ),
      ),
      betterPlayerDataSource: BetterPlayerDataSource(
        BetterPlayerDataSourceType.network,
        current.url,
        title: current.name,
      ),
    );
  }

  void _playChannel(ChannelModel ch) {
    _controller.setupDataSource(
      BetterPlayerDataSource(
        BetterPlayerDataSourceType.network,
        ch.url,
        title: ch.name,
      ),
    );

    setState(() {});
  }

  // =========================
  // ⬆️⬇️ CHANNEL SWITCH
  // =========================
  void _nextChannel() {
    currentIndex = (currentIndex + 1) % widget.channels.length;
    _playChannel(current);
  }

  void _prevChannel() {
    currentIndex =
        (currentIndex - 1 + widget.channels.length) %
        widget.channels.length;
    _playChannel(current);
  }

  // =========================
  // ⏩ SEEK
  // =========================
  void _seek(int ms) async {
    final pos = await _controller.videoPlayerController?.position;
    if (pos == null) return;

    _controller.seekTo(pos + Duration(milliseconds: ms));
  }

  void _togglePlayPause() {
    if (_controller.isPlaying() == true) {
      _controller.pause();
    } else {
      _controller.play();
    }
  }

  // =========================
  // 📺 CHANNEL LIST
  // =========================
  void _openChannelList() {
    setState(() {
      showChannelList = true;
      listIndex = currentIndex;
    });
  }

  void _closeChannelList() {
    setState(() {
      showChannelList = false;
    });
  }

  void _handleListNavigation(LogicalKeyboardKey key) {
    if (key == LogicalKeyboardKey.arrowDown) {
      setState(() {
        listIndex = (listIndex + 1) % widget.channels.length;
      });
    } else if (key == LogicalKeyboardKey.arrowUp) {
      setState(() {
        listIndex =
            (listIndex - 1 + widget.channels.length) %
            widget.channels.length;
      });
    } else if (key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.select) {
      currentIndex = listIndex;
      _playChannel(current);
      _closeChannelList();
    } else if (key == LogicalKeyboardKey.escape ||
        key == LogicalKeyboardKey.goBack) {
      _closeChannelList();
    }
  }

  // =========================
  // 🎮 REMOTE CONTROL
  // =========================
Timer? _okHoldTimer;

void _onKey(KeyEvent event) {
  final key = event.logicalKey;

  // 🔹 Key pressed
  if (event is KeyDownEvent) {
    // Show overlay on any key press
    _showOverlay();

    // 🔥 LONG PRESS OK → OPEN CHANNEL LIST
    if (key == LogicalKeyboardKey.select || key == LogicalKeyboardKey.enter) {
      _okHoldTimer?.cancel();
      _okHoldTimer = Timer(const Duration(milliseconds: 800), _openChannelList);
      return; // skip short-press actions for now
    }

    // Arrow navigation
    if (key == LogicalKeyboardKey.arrowRight) _seek(10000);
    if (key == LogicalKeyboardKey.arrowLeft) _seek(-10000);
    if (key == LogicalKeyboardKey.arrowUp) _prevChannel();
    if (key == LogicalKeyboardKey.arrowDown) _nextChannel();
    if (key == LogicalKeyboardKey.escape || key == LogicalKeyboardKey.goBack) {
      Navigator.pop(context);
    }

    // Navigate channel list if overlay is open
    if (showChannelList) {
      _handleListNavigation(key);
    }
  }

  // 🔹 Key released
  if (event is KeyUpEvent) {
    // Short press OK → toggle play/pause
    if (key == LogicalKeyboardKey.select || key == LogicalKeyboardKey.enter) {
      if (_okHoldTimer?.isActive ?? false) {
        _okHoldTimer?.cancel();
        _togglePlayPause();
      }
    }
  }
}
  // =========================
  // 🎬 OVERLAY
  // =========================
  void _showOverlay() {
    setState(() => showOverlay = true);
    _startHideTimer();
  }

  void _startHideTimer() {
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 4), () {
      if (!showChannelList) {
        setState(() => showOverlay = false);
      }
    });
  }

  // =========================
  // UI
  // =========================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardListener(
        focusNode: _focusNode..requestFocus(),
        onKeyEvent: _onKey,
        child: Stack(
          children: [
            Positioned.fill(
              child: BetterPlayer(controller: _controller),
            ),

            if (showOverlay) _overlay(),

            if (showChannelList) _channelListOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _overlay() {
    return Container(
      color: Colors.black.withOpacity(0.4),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          /// TOP
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                const Icon(Icons.live_tv, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    current.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          /// CENTER
          Center(
            child: Icon(
              _controller.isPlaying() == true
                  ? Icons.pause_circle
                  : Icons.play_circle,
              size: 90,
              color: Colors.white,
            ),
          ),

          /// BOTTOM
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              "CH ${currentIndex + 1}/${widget.channels.length}   ⬆⬇ Channel   ⬅➡ Seek   OK Play   Hold OK List",
              style: const TextStyle(color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }

  Widget _channelListOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.85),
      child: Row(
        children: [
          Container(
            width: 420,
            color: Colors.black87,
            child: ListView.builder(
              itemCount: widget.channels.length,
              itemBuilder: (_, index) {
                final ch = widget.channels[index];
                final selected = index == listIndex;

                return Container(
                  padding: const EdgeInsets.all(16),
                  color: selected ? Colors.red : Colors.transparent,
                  child: Text(
                    "${index + 1}. ${ch.name}",
                    style: TextStyle(
                      color: selected ? Colors.white : Colors.grey,
                      fontSize: 18,
                    ),
                  ),
                );
              },
            ),
          ),

          Expanded(
            child: Center(
              child: Text(
                widget.channels[listIndex].name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
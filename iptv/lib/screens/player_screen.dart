import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:better_player_plus/better_player_plus.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:provider/provider.dart';
import '../models/channel.dart';
import '../providers/channel_provider.dart';

class PlayerScreen extends StatefulWidget {
  final Channel channel;
  final List<Channel> channelList;
  final int currentIndex;

  const PlayerScreen({
    super.key,
    required this.channel,
    required this.channelList,
    required this.currentIndex,
  });

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> with SingleTickerProviderStateMixin {
  late BetterPlayerController _betterPlayerController;
  late int _currentIndex;
  late Channel _currentChannel;
  bool _showControls = true;
  bool _showChannelList = false;
  bool _isPlaying = false;
  bool _isBuffering = false;
  String? _errorMessage;
  Duration _currentPosition = Duration.zero;
  Duration _totalDuration = Duration.zero;
  final ScrollController _channelListScrollController = ScrollController();
  late AnimationController _sidebarAnimationController;
  late Animation<Offset> _sidebarSlideAnimation;
  bool _showFavoriteNotification = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.currentIndex;
    _currentChannel = widget.channel;
    WakelockPlus.enable();

    // Sidebar animation
    _sidebarAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _sidebarSlideAnimation = Tween<Offset>(
      begin: const Offset(1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _sidebarAnimationController,
      curve: Curves.easeOut,
    ));

    _initializePlayer();
     Future.delayed(const Duration(seconds: 5), () {
    if (mounted) {
      setState(() {
        _showControls = false;
      });
    }
  });

  }

  void _initializePlayer() {
    setState(() {
      _isBuffering = true;
      _errorMessage = null;
    });

    BetterPlayerDataSource betterPlayerDataSource = BetterPlayerDataSource(
      BetterPlayerDataSourceType.network,
      _currentChannel.url,
      notificationConfiguration: const BetterPlayerNotificationConfiguration(
        showNotification: false,
      ),
    );

    _betterPlayerController = BetterPlayerController(
      const BetterPlayerConfiguration(
        autoPlay: true,
        looping: false,
        controlsConfiguration: BetterPlayerControlsConfiguration(
          showControls: false,
          enablePlayPause: false,
          enableProgressBar: false,
          enableMute: false,
          enableFullscreen: true,
        ),
  fit: BoxFit.fill,
  autoDetectFullscreenAspectRatio: true,
      ),
      betterPlayerDataSource: betterPlayerDataSource,
    );

    _betterPlayerController.addEventsListener((event) {
      if (!mounted) return;

      if (event.betterPlayerEventType == BetterPlayerEventType.play) {
        setState(() {
          _isPlaying = true;
          _isBuffering = false;
        });
      } else if (event.betterPlayerEventType == BetterPlayerEventType.pause) {
        setState(() => _isPlaying = false);
      } else if (event.betterPlayerEventType == BetterPlayerEventType.bufferingStart) {
        setState(() => _isBuffering = true);
      } else if (event.betterPlayerEventType == BetterPlayerEventType.bufferingEnd) {
        setState(() => _isBuffering = false);
      } else if (event.betterPlayerEventType == BetterPlayerEventType.progress) {
        setState(() {
          _currentPosition = event.parameters?['progress'] as Duration? ?? Duration.zero;
          _totalDuration = event.parameters?['duration'] as Duration? ?? Duration.zero;
        });
      } else if (event.betterPlayerEventType == BetterPlayerEventType.exception) {
        setState(() {
          _errorMessage = 'Failed to load stream';
          _isBuffering = false;
        });
      }
    });

    _betterPlayerController.setVolume(1);
  }

  @override
  void dispose() {
    _betterPlayerController.dispose();
    _channelListScrollController.dispose();
    _sidebarAnimationController.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

void _toggleFavorite() {
  final provider = context.read<ChannelProvider>();
  provider.toggleFavorite(_currentChannel);
  Future.delayed(const Duration(seconds: 2), () {
    if (mounted) {
      setState(() {
        _showFavoriteNotification = false;
      });
    }
  });

    setState(()async {
    _currentChannel =await provider.toggleFavorite(_currentChannel);  // ← Get updated channel
    _showFavoriteNotification = true;
  });
}
  void _seekTo(Duration position) {
    if (_totalDuration.inSeconds > 0) {
      _betterPlayerController.seekTo(position);
      _showControlsTemporarily();
    }
  }

  void _seekForward() {
    final newPosition = _currentPosition + const Duration(seconds: 10);
    if (newPosition <= _totalDuration) {
      _seekTo(newPosition);
    }
  }

  void _seekBackward() {
    final newPosition = _currentPosition - const Duration(seconds: 10);
    if (newPosition >= Duration.zero) {
      _seekTo(newPosition);
    }
  }

  void _toggleChannelList() {
    setState(() {
      _showChannelList = !_showChannelList;
      if (_showChannelList) {
        _sidebarAnimationController.forward();
        _scrollToCurrentChannel();
         FocusScope.of(context).requestFocus(FocusNode());
      } else {
        _sidebarAnimationController.reverse();
      }
    });
  }

  void _scrollToCurrentChannel() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_channelListScrollController.hasClients) {
        const itemHeight = 80.0;
        final position = _currentIndex * itemHeight;
        _channelListScrollController.animateTo(
          position,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _changeChannel(int newIndex) {
    if (newIndex >= 0 && newIndex < widget.channelList.length) {
      setState(() {
        _currentIndex = newIndex;
        _currentChannel = widget.channelList[_currentIndex];
        _errorMessage = null;
        _showChannelList = false;
      });

      _sidebarAnimationController.reverse();

      _betterPlayerController.setupDataSource(
        BetterPlayerDataSource(
          BetterPlayerDataSourceType.network,
          _currentChannel.url,
        ),
      );

      _showControlsTemporarily();
    }
  }

  void _nextChannel() {
    if (_currentIndex < widget.channelList.length - 1) {
      _changeChannel(_currentIndex + 1);
    }
  }

  void _previousChannel() {
    if (_currentIndex > 0) {
      _changeChannel(_currentIndex - 1);
    }
  }

  void _togglePlayPause() {
    if (_betterPlayerController.isPlaying() ?? false) {
      _betterPlayerController.pause();
    } else {
      _betterPlayerController.play();
    }
    _showControlsTemporarily();
  }



  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });

  }

  void _showControlsTemporarily() {
    //setState(() => _showControls = true);
  }



  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}';
    }
    return '${twoDigits(minutes)}:${twoDigits(seconds)}';
  }

  bool get _hasPrevious => _currentIndex > 0;
  bool get _hasNext => _currentIndex < widget.channelList.length - 1;

  @override
  Widget build(BuildContext context) {
    final  media=MediaQuery.of(context).size;
    _betterPlayerController.setOverriddenAspectRatio(media.width/media.height);
    return PopScope(  canPop: false,
  onPopInvokedWithResult: (didPop, result) {
    if (didPop) return;

    if (_showChannelList) {
      _toggleChannelList();
    } else {
      Navigator.of(context).pop(false);
    }

  },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: FocusScope(
          autofocus: !_showChannelList,
          onKeyEvent: (node, event) {
            if (_showChannelList) {return KeyEventResult.ignored;  }
            if (event is! KeyDownEvent) return KeyEventResult.ignored;

            print(event.logicalKey.debugName);
            // Menu button - always handled
            if (event.logicalKey == LogicalKeyboardKey.contextMenu) {
              _toggleChannelList();
              return KeyEventResult.handled;
            }

            // Channel list is open - handle separately

           if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
              _toggleControls();
              return KeyEventResult.handled;
            }
             if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
              _toggleFavorite();
              return KeyEventResult.handled;
            }

            // CONTROLS HIDDEN - Use shortcuts for navigation
            if (!_showControls) {
              // Left/Right = Previous/Next channel (shortcuts)
              if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
                if (_hasPrevious) _previousChannel();
                return KeyEventResult.handled;
              }
              else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
                if (_hasNext) _nextChannel();
                return KeyEventResult.handled;
              }
              // Select/Enter/Space = Toggle play/pause
              else if (event.logicalKey == LogicalKeyboardKey.select ||
                  event.logicalKey == LogicalKeyboardKey.enter ||
                  event.logicalKey == LogicalKeyboardKey.space) {
                _togglePlayPause();
                return KeyEventResult.handled;
              }
              // Info = Show controls
              else if (event.logicalKey == LogicalKeyboardKey.info) {
                _showControlsTemporarily();
                return KeyEventResult.handled;
              }
              // Channel Up/Down
              else if (event.logicalKey == LogicalKeyboardKey.channelUp) {
                if (_hasNext) _nextChannel();
                return KeyEventResult.handled;
              }
              else if (event.logicalKey == LogicalKeyboardKey.channelDown) {
                if (_hasPrevious) _previousChannel();
                return KeyEventResult.handled;
              }

              // Fast forward / Rewind
              else if (event.logicalKey == LogicalKeyboardKey.mediaFastForward) {
                _seekForward();
                return KeyEventResult.handled;
              }
              else if (event.logicalKey == LogicalKeyboardKey.mediaRewind) {
                _seekBackward();
                return KeyEventResult.handled;
              }
              // Play/Pause media key
              else if (event.logicalKey == LogicalKeyboardKey.mediaPlayPause) {
                _togglePlayPause();
                return KeyEventResult.handled;
              }

              return KeyEventResult.ignored;
            }


            // Channel Up/Down keys (always work)
            else if (event.logicalKey == LogicalKeyboardKey.channelUp) {
              if (_hasNext) _nextChannel();
              return KeyEventResult.handled;
            }
            else if (event.logicalKey == LogicalKeyboardKey.channelDown) {
              if (_hasPrevious) _previousChannel();
              return KeyEventResult.handled;
            }
            // Info - show controls
            else if (event.logicalKey == LogicalKeyboardKey.info) {
               _toggleControls();
              return KeyEventResult.handled;
            }

            // Fast forward / Rewind media keys (always work)
            else if (event.logicalKey == LogicalKeyboardKey.mediaFastForward) {
              _seekForward();
              return KeyEventResult.handled;
            }
            else if (event.logicalKey == LogicalKeyboardKey.mediaRewind) {
              _seekBackward();
              return KeyEventResult.handled;
            }
            // Play/Pause media key
            else if (event.logicalKey == LogicalKeyboardKey.mediaPlayPause) {
              _togglePlayPause();
              return KeyEventResult.handled;
            }
            // Space key (when controls visible, let focus handle it)
            else if (event.logicalKey == LogicalKeyboardKey.space) {
              _togglePlayPause();
              return KeyEventResult.handled;
            }
                      return KeyEventResult.ignored;
          },
          child: GestureDetector(
            onTap: _toggleControls,
            child: Stack(
              children: [
                // Video Player
                Center(
                  child: AspectRatio(
                    aspectRatio:media.width/media.height,
                    child: BetterPlayer(
                      controller: _betterPlayerController,
                    ),
                  ),
                ),

                // Buffering Indicator
                if (_isBuffering)
                  const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFE50914),
                    ),
                  ),

                // Error Message
                if (_errorMessage != null)
                  _buildErrorMessage(),


                // Custom Controls Overlay
                if (_showControls && _errorMessage == null && !_showChannelList)
                  _buildCustomControls(),

                // Favorite Notification
                if (_showFavoriteNotification)
                  _buildFavoriteNotification(),

                // Channel List Sidebar
                if (_showChannelList)
                  _buildChannelListSidebar(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFavoriteNotification() {
    return Positioned(
      top: 100,
      left: 0,
      right: 0,
      child: Center(
        child: AnimatedOpacity(
          opacity: _showFavoriteNotification ? 1.0 : 0.0,
          duration: const Duration(milliseconds: 200),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFE50914).withOpacity(0.95),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE50914).withOpacity(0.5),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _currentChannel.isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  _currentChannel.isFavorite
                      ? 'Added to Favorites'
                      : 'Removed from Favorites',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 60,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChannelListSidebar() {
    return Stack(
      children: [
        GestureDetector(
          onTap: _toggleChannelList,
          child: Container(
            color: Colors.black.withOpacity(0.5),
          ),
        ),

        Align(
          alignment: Alignment.centerRight,
          child: SlideTransition(
            position: _sidebarSlideAnimation,
            child: Container(
              width: 400,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withOpacity(0.85),
                    Colors.black.withOpacity(0.95),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 20,
                    offset: const Offset(-5, 0),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE50914).withOpacity(0.2),
                      border: Border(
                        bottom: BorderSide(
                          color: const Color(0xFFE50914).withOpacity(0.5),
                          width: 2,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.list,
                          color: Color(0xFFE50914),
                          size: 28,
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Channels',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${widget.channelList.length}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      controller: _channelListScrollController,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: widget.channelList.length,
                      itemBuilder: (context, index) {
                        final channel = widget.channelList[index];
                        final isCurrentChannel = index == _currentIndex;

                        return _buildChannelListItem(
                          channel: channel,
                          index: index,
                          isCurrent: isCurrentChannel,
                        );
                      },
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      border: Border(
                        top: BorderSide(
                          color: Colors.white.withOpacity(0.1),
                          width: 1,
                        ),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.info_outline, color: Colors.white70, size: 16),
                        SizedBox(width: 8),
                        Text(
                          'Press MENU or BACK to close',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildChannelListItem({
    required Channel channel,
    required int index,
    required bool isCurrent,
  }) {
    return Focus(
      autofocus: isCurrent,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          _changeChannel(index);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;

          return GestureDetector(
            onTap: () => _changeChannel(index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isCurrent
                    ? const Color(0xFFE50914).withOpacity(0.3)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: isFocused
                    ? Border.all(color: const Color(0xFFE50914), width: 2)
                    : isCurrent
                        ? Border.all(color: const Color(0xFFE50914).withOpacity(0.5), width: 1)
                        : null,
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isCurrent
                          ? const Color(0xFFE50914)
                          : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          channel.name,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (channel.category.isNotEmpty)
                          Text(
                            channel.category,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  if (isCurrent)
                    const Icon(
                      Icons.play_circle_filled,
                      color: Color(0xFFE50914),
                      size: 24,
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCustomControls() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withOpacity(0.7),
            Colors.transparent,
            Colors.transparent,
            Colors.black.withOpacity(0.7),
          ],
          stops: const [0.0, 0.2, 0.8, 1.0],
        ),
      ),
      child: Column(
        children: [
          _buildTopBar(),const Spacer(),
          _buildCenterControls(),
          const SizedBox(height: 20),
         const  Spacer(),
            _buildProgressBar(),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        "${_currentChannel.name.toUpperCase()} - ${_currentChannel.category.toUpperCase()}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${_currentIndex + 1} / ${widget.channelList.length}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
           FocusableIconButton(
                    onPressed: _toggleFavorite,
                    icon: _currentChannel.isFavorite?Icons.favorite: Icons.favorite_border,
                    primaryColor: const Color(0xFFE50914),
                    tooltip: 'Next',
                  ),
               const   SizedBox(width: 20,),
                FocusableIconButton(
                    onPressed: _toggleChannelList,
                    icon: Icons.list,
                    primaryColor: const Color(0xFFE50914),
                    tooltip: 'Menu',
                  ),
     ],
      ),
    );
  }

  Widget _buildCenterControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        FocusableIconButton(
          onPressed: _seekBackward,
          icon: Icons.replay_10,
          size: 40,
          iconSize: 32,
          primaryColor: const Color(0xFFE50914),
          tooltip: 'Rewind 10s',
        ),const SizedBox(width: 40),
         FocusableIconButton(
          onPressed: _previousChannel,
          icon: Icons.skip_previous,
          size: 60,
          iconSize: 32,
          primaryColor: const Color(0xFFE50914),
          tooltip: 'Rewind 10s',
        ),

        const SizedBox(width: 40),
      AnimatedSwitcher(
  duration: const Duration(milliseconds: 200),
  child: _isBuffering
      ?  Container(
          width: 80,
          height: 80,
          decoration: const BoxDecoration(
            color: Color(0xFFE50914), // same red
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: const SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              strokeWidth: 5,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
        )
      : FocusableIconButton(
          key: const ValueKey('button'),
          onPressed: _togglePlayPause,
          icon: _isPlaying ? Icons.pause : Icons.play_arrow,
          size: 80,
          iconSize: 48,
          primaryColor: const Color(0xFFE50914),
          backgroundColor: const Color(0xFFE50914),
          tooltip: _isPlaying ? 'Pause' : 'Play',
          autofocus: true,
        ),
),
         const SizedBox(width: 40),
        FocusableIconButton(
          onPressed: _nextChannel,
          icon: Icons.skip_next,
          size: 60,
          iconSize: 32,
          primaryColor: const Color(0xFFE50914),
          tooltip: 'Forward 10s',
        ),
        const SizedBox(width: 40),
        FocusableIconButton(
          onPressed: _seekForward,
          icon: Icons.forward_10,
          size: 40,
          iconSize: 32,
          primaryColor: const Color(0xFFE50914),
          tooltip: 'Forward 10s',
        ),
      ],
    );
  }

  Widget _buildProgressBar() {
    final progress = _totalDuration.inMilliseconds > 0
        ? _currentPosition.inMilliseconds / _totalDuration.inMilliseconds
        : 0.0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                _formatDuration(_currentPosition),
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
              const Spacer(),
              Text(
                _formatDuration(_totalDuration),
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Focus(
            onKeyEvent: (node, event) {
              if (event is KeyDownEvent) {
                if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
                  _seekBackward();
                  return KeyEventResult.handled;
                } else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
                  _seekForward();
                  return KeyEventResult.handled;
                } else if (event.logicalKey == LogicalKeyboardKey.select ||
                    event.logicalKey == LogicalKeyboardKey.enter) {
                  _togglePlayPause();
                  return KeyEventResult.handled;
                }
              }
              return KeyEventResult.ignored;
            },
            child: Builder(
              builder: (context) {
                final isFocused = Focus.of(context).hasFocus;

                return GestureDetector(
                  onTapDown: (details) {
                    final box = context.findRenderObject() as RenderBox;
                    final position = details.localPosition.dx / box.size.width;
                    final newPosition = Duration(
                      milliseconds: (_totalDuration.inMilliseconds * position).round(),
                    );
                    _seekTo(newPosition);
                  },
                  child: Container(
                    height: 24,
                    decoration: BoxDecoration(
                      border: isFocused
                          ? Border.all(color: const Color(0xFFE50914), width: 2)
                          : null,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    alignment: Alignment.center,
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE50914)),
                      minHeight: isFocused ? 6 : 4,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

}

class FocusableIconButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final IconData icon;
  final String? tooltip;
  final Color primaryColor;
  final Color? backgroundColor;
  final bool autofocus;
  final bool enabled;
  final double size;
  final double iconSize;
  final double borderRadius;

  const FocusableIconButton({
    super.key,
    required this.onPressed,
    required this.icon,
    this.tooltip,
    this.primaryColor = const Color(0xFFE50914),
    this.backgroundColor,
    this.autofocus = false,
    this.enabled = true,
    this.size = 48.0,
    this.iconSize = 24,
    this.borderRadius = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    return Focus(
      autofocus: autofocus,
      onKeyEvent: (node, event) {
        if (!enabled || onPressed == null) return KeyEventResult.ignored;

        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed!();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;

          return Tooltip(
            message: tooltip ?? '',
            child: GestureDetector(
              onTap: enabled && onPressed != null ? onPressed : null,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: size,
                height: size,
                decoration: BoxDecoration(
                  color: backgroundColor ?? (enabled ? Colors.white.withOpacity(0.2) : Colors.grey.withOpacity(0.1)),
                  borderRadius: BorderRadius.circular(borderRadius),
                  border: isFocused
                      ? Border.all(color: primaryColor, width: 3)
                      : null,
                  boxShadow: isFocused
                      ? [
                          BoxShadow(
                            color: primaryColor.withOpacity(0.5),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  icon,
                  color: enabled ? Colors.white : Colors.grey,
                  size: iconSize,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

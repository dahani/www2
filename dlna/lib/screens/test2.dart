import 'dart:async';

import 'package:flutter/material.dart';
import 'package:media_cast_dlna_2/media_cast_dlna.dart';

class DlnaMediaCastDemo extends StatefulWidget {
  const DlnaMediaCastDemo({super.key});

  @override
  DlnaMediaCastDemoState createState() => DlnaMediaCastDemoState();
}

class DlnaMediaCastDemoState extends State<DlnaMediaCastDemo> {
  final _api = MediaCastDlnaApi();
  List<DlnaDevice> _devices = [];
  DlnaDevice? _selectedRenderer;
  bool _isDiscovering = false;
  TransportState _currentState = TransportState.stopped;
  int _currentPosition = 0;
  int _duration = 0;

  @override
  void initState() {
    super.initState();
    _initializePlugin();
  }

  Future<void> _initializePlugin() async {
    try {
      await _api.initializeUpnpService();
      debugPrint('✅ Media Cast DLNA initialized successfully');
    } catch (e) {
      debugPrint('❌ Initialization failed: $e');
    }
  }

  Future<void> _startDiscovery() async {
    setState(() => _isDiscovering = true);

    try {
      await _api.startDiscovery(
        DiscoveryOptions(
          timeout: DiscoveryTimeout(seconds: 15),
          searchTarget: SearchTarget(target: 'upnp:rootdevice'),
        ),
      );

      // Poll for devices
      Timer.periodic(Duration(seconds: 2), (timer) async {
        final devices = await _api.getDiscoveredDevices();
        setState(() => _devices = devices);

        if (timer.tick >= 10) {
          timer.cancel();
          await _api.stopDiscovery();
          setState(() => _isDiscovering = false);
        }
      });
    } catch (e) {
      setState(() => _isDiscovering = false);
      _showError('Discovery failed: $e');
    }
  }

  Future<void> _castSampleVideo() async {
    if (_selectedRenderer == null) {
      _showError('Please select a renderer device first');
      return;
    }

    const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    try {
      final metadata = VideoMetadata(
        title: 'Big Buck Bunny',
        duration: TimeDuration(seconds: 596),
        resolution: '1920x1080',
        genre: 'Animation',
        upnpClass: 'object.item.videoItem.movie',
      );

      await _api.setMediaUri(
        _selectedRenderer!.udn,
        Url(value: sampleUrl),
        metadata,
      );
      await _api.play(_selectedRenderer!.udn);

      _showSuccess('Video cast successfully!');
      _startStatusPolling();

    } catch (e) {
      _showError('Failed to cast video: $e');
    }
  }

  void _startStatusPolling() {
    Timer.periodic(Duration(seconds: 1), (timer) async {
      if (_selectedRenderer == null) {
        timer.cancel();
        return;
      }

      try {
        final state = await _api.getTransportState(_selectedRenderer!.udn);
        final position = await _api.getCurrentPosition(_selectedRenderer!.udn);
        final playbackInfo = await _api.getPlaybackInfo(_selectedRenderer!.udn);

        setState(() {
          _currentState = state;
          _currentPosition = position.seconds;
          _duration = playbackInfo.duration.seconds;
        });

        // Stop polling if not playing
        if (state == TransportState.stopped) {
          timer.cancel();
        }
      } catch (e) {
        debugPrint('Status update failed: $e');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Media Cast DLNA Demo'),
        backgroundColor: Colors.deepPurple,
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Discovery Section
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text('Device Discovery',
                         style: Theme.of(context).textTheme.titleLarge),
                    SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: _isDiscovering ? null : _startDiscovery,
                      child: Text(_isDiscovering ? 'Discovering...' : 'Start Discovery'),
                    ),
                    SizedBox(height: 8),
                    Text('Found ${_devices.length} devices'),
                  ],
                ),
              ),
            ),

            // Device List
            Expanded(
              child: Card(
                child: _devices.isEmpty
                    ? Center(child: Text('No devices found'))
                    : ListView.builder(
                        itemCount: _devices.length,
                        itemBuilder: (context, index) {
                          final device = _devices[index];
                          final isRenderer = device.deviceType.contains('MediaRenderer');
                          final isSelected = device.udn == _selectedRenderer?.udn;

                          return ListTile(
                            leading: Icon(
                              isRenderer ? Icons.tv : Icons.folder,
                              color: isRenderer ? Colors.blue : Colors.orange,
                            ),
                            title: Text(device.friendlyName),
                            subtitle: Text('${device.friendlyName} • ${device.ipAddress}'),
                            trailing: isRenderer
                                ? ElevatedButton(
                                    onPressed: () => setState(() => _selectedRenderer = device),
                                    child: Text(isSelected ? 'Selected' : 'Select'),
                                  )
                                : null,
                            selected: isSelected,
                          );
                        },
                      ),
              ),
            ),

            // Control Section
            if (_selectedRenderer != null) ...[
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Text('Casting to: ${_selectedRenderer!.friendlyName}',
                           style: Theme.of(context).textTheme.titleMedium),
                      SizedBox(height: 16),

                      // Cast button
                      ElevatedButton.icon(
                        onPressed: _castSampleVideo,
                        icon: Icon(Icons.cast),
                        label: Text('Cast Sample Video'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                      ),

                      SizedBox(height: 16),

                      // Playback controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          IconButton(
                            onPressed: () => _api.play(_selectedRenderer!.udn),
                            icon: Icon(Icons.play_arrow, color: Colors.green),
                          ),
                          IconButton(
                            onPressed: () => _api.pause(_selectedRenderer!.udn),
                            icon: Icon(Icons.pause, color: Colors.orange),
                          ),
                          IconButton(
                            onPressed: () => _api.stop(_selectedRenderer!.udn),
                            icon: Icon(Icons.stop, color: Colors.red),
                          ),
                        ],
                      ),

                      // Status
                      if (_currentState != TransportState.stopped) ...[
                        SizedBox(height: 8),
                        Text('Status: ${_currentState.toString().split('.').last}'),
                        Text('Position: ${_formatDuration(_currentPosition)} / ${_formatDuration(_duration)}'),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }
}
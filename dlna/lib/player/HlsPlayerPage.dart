import 'dart:convert';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:dlna/player/playerWidget.dart';
import 'package:flutter/material.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:dlna/services/database_service.dart';
class HlsPlayerPage extends StatefulWidget {
  final String url;
  final String title;
  final String categoryId;
  final int currentIndex;
  final List<Map<String, dynamic>> listChannels;

  const HlsPlayerPage({
    super.key,
    required this.url,
    required this.title,
    required this.categoryId, required this.currentIndex, required this.listChannels,
  });

  @override
  State<HlsPlayerPage> createState() => _HlsPlayerPageState();
}

class _HlsPlayerPageState extends State<HlsPlayerPage> {
  List<Map<String, dynamic>> _channels = [];
  dynamic selectedCahnel;
  String _currentUrl="";

  int _currentIndex = 0;
 Key _playerKey = UniqueKey();
  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
_currentIndex=widget.currentIndex;_currentUrl=widget.url;
_channels=widget.listChannels;
     _playerKey = UniqueKey();
  }


void _createController(int index) {
  final channel = _channels[index];
selectedCahnel=channel;_currentIndex=index;
  String? url = channel['url'];

  if (url == null && channel['resolutions'] != null) {
    final resolutions = jsonDecode(channel['resolutions']);
    url = resolutions.entries.first.value['url'];
  }

  if (url == null || url.isEmpty) return;

  setState(() {
    _currentIndex = index;
    _currentUrl = url!;
    _playerKey = UniqueKey();
  });
}


  @override
  void dispose() {
    WakelockPlus.disable();
    super.dispose();
  }

  void _playNext() {
    if (_currentIndex < _channels.length - 1) {
      setState(() {
        _currentIndex++;
        _createController(_currentIndex);
      });
    }
  }

  void _playPrevious() {
    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
        _createController(_currentIndex);
      });
    }
  }

  @override
  Widget build(BuildContext context) {

    return SafeArea(
      child: Scaffold(
        drawer: Drawer(
          child: ListView.builder(
                itemCount: _channels.length,
                itemBuilder: (_, index) {
                   final ch = _channels[index];
                  return ListTile(
                     trailing: IconButton(
                icon: Icon(
                  ch['is_fav'] == 1 ? Icons.favorite : Icons.favorite_border,
                  color: ch['is_fav'] == 1 ? Colors.red : null,
                ),
                onPressed: () async {
                  final newValue = ch['is_fav'] == 1 ? 0 : 1;

                  await DatabaseService.instance.setFavourite(ch['id'],newValue == 1,);

                  setState(() {
                  });
                },
              ),
                    leading: CachedNetworkImage(
              imageUrl: ch['poster'] ?? "",
              width: 50,
              height: 50,
              placeholder: (_, _) =>
                  const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator()),
              errorWidget: (_, _, _) =>
                  const Icon(Icons.error),
            ),
                    title: Text(ch['name'].toString()),
                    selected: index == _currentIndex,
                    onTap: () {
                       Navigator.pop(context);
                      _createController(index);
                    },
                  );
                },
              )
        ),
        body: Column(crossAxisAlignment: CrossAxisAlignment.center,mainAxisAlignment: MainAxisAlignment.center,
                children: [

                  AspectRatio(
              aspectRatio: 16 / 9,
              child: ChannelPlayerWidget(
                key: _playerKey, // 🔥 important
                url: _currentUrl
              ),
            ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Text(
                      selectedCahnel!=null?selectedCahnel['name']:widget.title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                   Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.skip_previous),
              onPressed: _playPrevious,
            ),
            IconButton(
              icon: const Icon(Icons.skip_next),
              onPressed: _playNext,
            ),

          ],
        ),
                ],
              ),
      ),
    );
  }
}

//https://stream-lb.livemediama.com/aflam/hls/master.m3u8
//https://stream-lb.livemediama.com/m24maroc/hls/master.m3u8"

//https://www.youtube.com/watch?v=qs8Wrk81wPo    quest

// ignore_for_file: use_build_context_synchronously

 import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/dio_service.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:url_launcher/url_launcher.dart';

Future<bool> isAndroidTv() async {
  DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
  AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;

  // Check for the "leanback" feature, indicating an Android TV device
  bool isTV = androidInfo.systemFeatures.contains('android.software.leanback') ||
              androidInfo.systemFeatures.contains('com.google.android.tv.installed');
  return isTV;
}
Future<void> openM3U(String url) async {
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      Fluttertoast.showToast(
        msg: "Aucune application capable d’ouvrir cette URL",
      );
    }
  }

class SleepTimerSheet extends StatelessWidget {

  final int? selectedMinutes;
  final ValueChanged<int> onSelectDuration;
  final VoidCallback onCancel;

  const SleepTimerSheet({
    super.key,
    required this.selectedMinutes,
    required this.onSelectDuration,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
      final durations = [10, 15, 30, 60, 90];
    return SafeArea(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Sleep Timer",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              ...durations.map(
                (minutes) => ListTile(
                  title: Text("$minutes minutes"),
                  trailing: selectedMinutes == minutes
                      ? const Icon(Icons.check)
                      : null,
                  onTap: () {
                    onSelectDuration(minutes);
                    Navigator.pop(context);
                  },
                ),
              ),

              const Divider(),

              ListTile(
                title: const Text("Cancel Timer"),
                onTap: () {
                  onCancel();
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
 void hideLoading(BuildContext context) {
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

void showLoading(String message,BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => PopScope(
        canPop: false,
        child: Dialog(
          backgroundColor: Colors.black87,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(width: 20),
                Expanded(
                  child: Text(
                    message,
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  Future<String> getLocalIp() async {
    final interfaces = await NetworkInterface.list();
    for (var i in interfaces) {
      for (var addr in i.addresses) {
        if (addr.type == InternetAddressType.IPv4 && !addr.address.startsWith("127")) {
          return addr.address;
        }
      }
    }
    return "127.0.0.1";
  }

  Future<String?> showInputDialog(BuildContext context) async {
  final TextEditingController controller = TextEditingController();

  return showDialog<String>(
    context: context,
    barrierDismissible: false, // prevents closing by tapping outside
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('Enter value'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Type something...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(null); // Cancel
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(controller.text); // Return value
            },
            child: const Text('OK'),
          ),
        ],
      );
    },
  );
}
String getVideoId(String src){
   final regex = RegExp(r'embed-([a-zA-Z0-9]+)\.html');
    final match = regex.firstMatch(src);
    if (match != null) {
    final extracted = match.group(1);
    return extracted??"";
    }
    return src;

}
  Future<String> resolveMovieM3u8(String id) async {
    final pageUrl = "https://egybestvid.com/$id.html";
    final res = await DioService.get(pageUrl, headers: egybestHeaders);
    final regex = RegExp(r'file\s*:\s*"([^"]+\.m3u8[^"]*)"');
    final match = regex.firstMatch(res.data.toString());
    if (match == null) throw Exception("M3U8 file not found in HTML");
    return match.group(1)!;
  }
String formatRuntime(int minutes) {
  final hours = minutes ~/ 60;
  final remainingMinutes = minutes % 60;

  return '${hours.toString().padLeft(2, '0')}:'
         '${remainingMinutes.toString().padLeft(2, '0')}';
}
  Widget buildslisTile({required ChannelModel ch,required VoidCallback onClick,required VoidCallback onLongPress,required  DlnaService dlnaService,required VoidCallback setFavourite }) {
    print( dlnaService.selectedChannel.id);
    return Container(
      color: dlnaService.selectedChannel.id == ch.id
          ? (dlnaService.isDarkMode ? Colors.black : Colors.lime)
          : null,
      child: ListTile(
        trailing: IconButton(
          icon: Icon(
            ch.isFav == 1 ? Icons.favorite : Icons.favorite_border,
            color: ch.isFav == 1 ? Colors.red : null,
          ),
          onPressed: setFavourite,
        ),

        leading: CachedNetworkImage(
          imageUrl: ch.poster,
          width: 50,
          height: 50,
          placeholder: (_, _) => const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(),
          ),
          errorWidget: (_, _, _) => const Icon(Icons.error),
        ),
        title: Text(ch.name),
        onTap:onClick,
        onLongPress: onLongPress,
      ),
    );
  }







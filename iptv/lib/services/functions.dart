import 'dart:io';

import 'package:tv_app/services/movie_api_service.dart';
String proxyUrl="";
bool isMissingHttpScheme(String url) {
  return !(url.startsWith('http://') || url.startsWith('https://'));
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
    final res = await MovieApiService().getDio().get(pageUrl);
    final regex = RegExp(r'file\s*:\s*"([^"]+\.m3u8[^"]*)"');
    final match = regex.firstMatch(res.data.toString());
    if (match == null) throw Exception("M3U8 file not found in HTML");
    return match.group(1)!;
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
import 'dart:io';
import 'package:dio/dio.dart' hide Response;
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/functions.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart'; // Add shelf_router to pubspec
import 'dio_service.dart';
import 'package:flutter/rendering.dart';
class HlsProxyServer {
  final String localIp;
  HttpServer? _server;

  HlsProxyServer({ required this.localIp});

  Future<void> start({int port = 8080}) async {
    final router = Router();

    // --- PROXY ROUTES ---

    // Master Entry: /master.m3u8?id=...
    router.get('/master.m3u8', (Request request) async {
      final id = request.url.queryParameters['id'];
      if (id == null) return Response.badRequest(body: 'Missing id');

      try {
        final realM3u8 = await resolveMovieM3u8(id);
        return await _proxyM3u8(realM3u8);
      } catch (e) {
        return Response.internalServerError(body: e.toString());
      }
    });

    // Segment & Sub-Playlist Proxy: /proxy/<encoded_url>
    router.get('/proxy/<url>', (Request request, String url) async {
      final realUrl = Uri.decodeComponent(url);
      if (realUrl.toLowerCase().contains('.m3u8')) {
        return await _proxyM3u8(realUrl);
      } else {
        return await _proxyBinary(realUrl);
      }
    });

    final handler = Pipeline().addMiddleware(logRequests()).addHandler(router.call);
    _server = await shelf_io.serve(handler, InternetAddress.anyIPv4, port);
    debugPrint("PROXY LIVE AT: http://$localIp:$port");
  }



  Future<Response> _proxyM3u8(String url) async {
    final res = await DioService.get(url, headers: egybestHeaders, responseType: ResponseType.plain);
    final body = res.data.toString();
    final baseUri = Uri.parse(url);

    String rewriteUrl(String raw) {
      Uri resolved = raw.startsWith('http') ? Uri.parse(raw) : baseUri.resolve(raw);
      return 'http://$localIp:${_server!.port}/proxy/${Uri.encodeComponent(resolved.toString())}';
    }

    final rewritten = body.split('\n').map((line) {
      line = line.trim();
      if (line.isEmpty) return line;
      if (line.startsWith('#')) {
        if (line.contains('URI="')) {
          return line.replaceAllMapped(RegExp(r'URI="([^"]+)"'), (m) => 'URI="${rewriteUrl(m.group(1)!)}"');
        }
        return line;
      }
      return rewriteUrl(line);
    }).join('\n');

    return Response.ok(rewritten, headers: {'Content-Type': 'application/vnd.apple.mpegurl'});
  }

  Future<Response> _proxyBinary(String url) async {
    final res = await DioService.get(url, headers: egybestHeaders, responseType: ResponseType.bytes);
    return Response.ok(res.data, headers: {'Content-Type': 'video/MP2T'});
  }

  Future<void> stop() async => await _server?.close();
}
import 'dart:io';
import 'package:dio/dio.dart' hide Response;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart'; // Add shelf_router to pubspec
import 'dio_service.dart';

class HlsProxyServer {
  final Map<String, String> headers;
  final String localIp;
  HttpServer? _server;

  HlsProxyServer({required this.headers, required this.localIp});

  Future<void> start({int port = 8080}) async {
    final router = Router();

    // --- PROXY ROUTES ---

    // Master Entry: /master.m3u8?id=...
    router.get('/master.m3u8', (Request request) async {
      final id = request.url.queryParameters['id'];
      if (id == null) return Response.badRequest(body: 'Missing id');

      try {
        final realM3u8 = await _resolveMovieM3u8(id);
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

    final handler = Pipeline().addMiddleware(logRequests()).addHandler(router);
    _server = await shelf_io.serve(handler, InternetAddress.anyIPv4, port);
    print("PROXY LIVE AT: http://$localIp:$port");
  }

  Future<String> _resolveMovieM3u8(String id) async {
    final pageUrl = "https://egybestvid.com/$id.html";
    final res = await DioService.get(pageUrl, headers: headers);
    final regex = RegExp(r'file\s*:\s*"([^"]+\.m3u8[^"]*)"');
    final match = regex.firstMatch(res.data.toString());
    if (match == null) throw Exception("M3U8 file not found in HTML");
    return match.group(1)!;
  }

  Future<Response> _proxyM3u8(String url) async {
    final res = await DioService.get(url, headers: headers, responseType: ResponseType.plain);
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
    final res = await DioService.get(url, headers: headers, responseType: ResponseType.bytes);
    return Response.ok(res.data, headers: {'Content-Type': 'video/MP2T'});
  }

  Future<void> stop() async => await _server?.close();
}
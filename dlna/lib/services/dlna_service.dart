// ignore_for_file: use_build_context_synchronously

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/services/functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:multicast_dns/multicast_dns.dart';
import 'package:xml/xml.dart';

// Chromecast Support
import 'package:dart_chromecast/casting/cast.dart';

class DlnaService {
  List<DlnaDevice> devices = [];
  DlnaDevice? selectedDevice;
  String statePlaying = "STOPPED";
  bool isConnected = false;
  bool isDarkMode = false;
  ChannelModel selectedChannel = ChannelModel(id: -1, name: "empty", poster: "", url: "", isFav: 0);
  ChannelModel lastSelectedChannel = ChannelModel(id: -1, name: "empty", poster: "", url: "", isFav: 0);
  String proxyUrl = "";
  int videoDuration = 0;
  bool isPlayingMovie = false;

  // Chromecast Controllers
  CastSender? _castSender;
  StreamSubscription? _statusSub;
  StreamSubscription? _sessionSub;

  final Dio _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5)));

  Future<void> playWithTitleChannel(ChannelModel ch) async {
    final tmp = selectedChannel;
    lastSelectedChannel = tmp;
    selectedChannel = ch;
    playWithTitle(ch.url, ch.name, isMovie: false);
  }

  Future<void> playWithTitleMovie(String url, String title) async {
    final ch = ChannelModel(id: -3, name: title, poster: "", url: url, isFav: 0);
    final tmp = selectedChannel;
    lastSelectedChannel = tmp;
    selectedChannel = ch;
    playWithTitle(ch.url, ch.name, isMovie: true);
  }

  void setChannel(ChannelModel ch) {
    final tmp = selectedChannel;
    lastSelectedChannel = tmp;
    selectedChannel = ch;
  }

  Future<void> disconnect() async {
    try {
      final state = await getTransportState();
      if (state == "PLAYING" || state == "PAUSED_PLAYBACK") {
        await stop();
      }
    } catch (_) {}

    // Chromecast Disconnect
    _statusSub?.cancel();
    _sessionSub?.cancel();
    _castSender?.disconnect();
    _castSender = null;

    selectedDevice = null;
    statePlaying = "STOPPED";
    isConnected = false;
  }

  Future<List<DlnaDevice>> discoverDevices() async {
    devices.clear();
    final Set<String> seen = {};
    await Future.wait([
      _discoverDLNA(devices, seen),
      _discoverChromecast(devices, seen),
    ]);
    return devices;
  }

  Future<void> _discoverDLNA(List<DlnaDevice> devices, Set<String> seen) async {
    const st = "urn:schemas-upnp-org:service:AVTransport:1";
    final request = 'M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: "ssdp:discover"\r\nMX: 3\r\nST: $st\r\n\r\n';
    final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
    socket.broadcastEnabled = true;
    socket.send(utf8.encode(request), InternetAddress("239.255.255.250"), 1900);

    socket.listen((event) async {
      if (event == RawSocketEvent.read) {
        final dg = socket.receive();
        if (dg == null) return;
        final response = utf8.decode(dg.data);
        final match = RegExp(r"LOCATION: (.*)", caseSensitive: false).firstMatch(response);
        if (match != null) {
          final location = match.group(1)!.trim();
          if (seen.contains(location)) return;
          seen.add(location);
          await _fetchDeviceDescription(location);
        }
      }
    });
    await Future.delayed(const Duration(seconds: 3));
    socket.close();
  }

  Future<void> _discoverChromecast(List<DlnaDevice> devices, Set<String> seen) async {
    const service = '_googlecast._tcp.local';
    final client = MDnsClient();
    await client.start();
    try {
      await for (final ptr in client.lookup<PtrResourceRecord>(ResourceRecordQuery.serverPointer(service))) {
        await for (final srv in client.lookup<SrvResourceRecord>(ResourceRecordQuery.service(ptr.domainName))) {
          InternetAddress? ip;
          await for (final addr in client.lookup<IPAddressResourceRecord>(ResourceRecordQuery.addressIPv4(srv.target))) {
            ip = addr.address;
            break;
          }
          if (ip == null) continue;
          final key = "${ip.address}:${srv.port}";
          if (seen.contains(key)) continue;
          seen.add(key);
          devices.add(DlnaDevice(
            name: ptr.domainName.split('.').first,
            controlUrl: key,
            renderingUrl: "http://$key",
            type: DeviceType.chromecast,
            icon: "https://www.gstatic.com/images/branding/product/2x/chromecast_96dp.png",
          ));
        }
      }
    } catch (_) {} finally { client.stop(); }
  }

  Future<void> _fetchDeviceDescription(String location) async {
    try {
      final response = await _dio.get(location);
      final xmlDoc = XmlDocument.parse(response.data.toString());
      final name = xmlDoc.findAllElements('friendlyName').first.innerText;
      final avService = xmlDoc.findAllElements('service').firstWhere((s) => s.innerText.contains('AVTransport'));
      final controlUrl = Uri.parse(location).resolve(avService.findElements('controlURL').first.innerText).toString();
      devices.add(DlnaDevice(name: name, controlUrl: controlUrl, renderingUrl: controlUrl, type: DeviceType.dlna));
    } catch (_) {}
  }

  Future<void> playWithTitle(String url, String title, {bool isMovie = false}) async {
    isPlayingMovie = isMovie;
    FlutterForegroundTask.updateService(
      notificationTitle: title,
      notificationText: proxyUrl,
      notificationButtons: [
        const NotificationButton(id: 'btn_pause', text: 'Play/Pause'),
        const NotificationButton(id: 'btn_stop', text: 'Stop Service'),
      ],
    );

    if (selectedDevice == null) return;

    if (selectedDevice!.type == DeviceType.chromecast) {
      final parts = selectedDevice!.controlUrl.split(':');
      final device = CastDevice(host: parts[0], port: int.parse(parts[1]), type: '_googlecast._tcp');
      _castSender = CastSender(device);
      _sessionSub = _castSender!.castSessionController.stream.listen((session) {
        if (session != null && session.isConnected) {
          _castSender!.load(CastMedia(
            title: title,
            contentId: url,
            contentType: url.contains("m3u8") ? 'application/x-mpegurl' : 'video/mp4',
          ));
          statePlaying = "PLAYING";
        }
      });
      bool connected = await _castSender!.connect();
      if (connected) _castSender!.launch();
    } else {
      final mimeType = url.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp4";
      final didl = '<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"><item id="0" parentID="0" restricted="1"><dc:title>${_escapeXml(title)}</dc:title><upnp:class>object.item.videoItem</upnp:class><res protocolInfo="http-get:*:$mimeType:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000">${_escapeXml(url)}</res></item></DIDL-Lite>';
      final body = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>${_escapeXml(url)}</CurrentURI><CurrentURIMetaData>${const HtmlEscape().convert(didl)}</CurrentURIMetaData></u:SetAVTransportURI></s:Body></s:Envelope>';
      try {
        await _dio.post(selectedDevice!.controlUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"', "Content-Type": 'text/xml; charset="utf-8"'}));
        await play();
      } catch (e) {
        statePlaying = "STOPPED";
      }
    }
  }

  Future<void> play() async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.play();
    } else {
      await _sendAvTransportCommand("Play", extraParams: {"Speed": "1"});
    }
    statePlaying = "PLAYING";
  }

  Future<void> pause() async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.pause();
    } else {
      await _sendAvTransportCommand("Pause");
    }
    statePlaying = "PAUSED_PLAYBACK";
  }

  Future<void> stop() async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.stop();
    } else {
      await _sendAvTransportCommand("Stop");
    }
    statePlaying = "STOPPED";
  }

  Future<void> togglePlayPause() async {
    statePlaying = await getTransportState() ?? "STOPPED";
    if (statePlaying == "PLAYING") {
      await pause();
    } else {
      await play();
    }
  }

  Future<void> volumeUp({int step = 1}) async {
    final current = await _getCurrentVolume();
    await setVolume((current + step).clamp(0, 100));
  }

  Future<void> volumeDown({int step = 1}) async {
    final current = await _getCurrentVolume();
    await setVolume((current - step).clamp(0, 100));
  }

  Future<int> _getCurrentVolume() async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      return ((_castSender?.castSession?.castMediaStatus?.volume ?? 0.5) * 100).toInt();
    }
    try {
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:GetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetVolume></s:Body></s:Envelope>';
      final res = await _dio.post(selectedDevice!.renderingUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:RenderingControl:1#GetVolume"', "Content-Type": 'text/xml; charset="utf-8"'}));
      return int.tryParse(XmlDocument.parse(res.data).findAllElements('CurrentVolume').first.innerText) ?? 0;
    } catch (_) { return 0; }
  }

  Future<void> setVolume(int volume) async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.setVolume(volume / 100.0);
    } else {
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>$volume</DesiredVolume></u:SetVolume></s:Body></s:Envelope>';
      await _dio.post(selectedDevice!.renderingUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:RenderingControl:1#SetVolume"', "Content-Type": 'text/xml; charset="utf-8"'}));
    }
  }

  Future<void> setMute(bool mute) async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.setVolume(mute ? 0 : 0.5);
    } else {
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:SetMute xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel><DesiredMute>${mute ? 1 : 0}</DesiredMute></u:SetMute></s:Body></s:Envelope>';
      await _dio.post(selectedDevice!.renderingUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:RenderingControl:1#SetMute"', "Content-Type": 'text/xml; charset="utf-8"'}));
    }
  }

  Future<void> seekToposition({required int duration}) async {
    final newPos = Duration(minutes: duration);
    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.seek(newPos.inSeconds.toDouble());
    } else {
      final formatted = _formatDuration(newPos);
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>ABS_TIME</Unit><Target>$formatted</Target></u:Seek></s:Body></s:Envelope>';
      await _dio.post(selectedDevice!.controlUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#Seek"', "Content-Type": 'text/xml; charset="utf-8"'}));
    }
  }

  Future<void> seekOneMinute({required bool forward, int duration = 1}) async {
    final current = await _getCurrentPosition();
    final newPosition = forward ? current + Duration(minutes: duration) : current - Duration(minutes: duration);
    final safePosition = newPosition.isNegative ? Duration.zero : newPosition;

    if (selectedDevice?.type == DeviceType.chromecast) {
      _castSender?.seek(safePosition.inSeconds.toDouble());
    } else {
      final formatted = _formatDuration(safePosition);
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>ABS_TIME</Unit><Target>$formatted</Target></u:Seek></s:Body></s:Envelope>';
      await _dio.post(selectedDevice!.controlUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#Seek"', "Content-Type": 'text/xml; charset="utf-8"'}));
    }
  }

  Future<Duration> _getCurrentPosition() async {
    if (selectedDevice?.type == DeviceType.chromecast) {
      return Duration(seconds: _castSender?.castSession?.castMediaStatus?.position?.toInt() ?? 0);
    }
    try {
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID></u:GetPositionInfo></s:Body></s:Envelope>';
      final res = await _dio.post(selectedDevice!.controlUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo"', "Content-Type": 'text/xml; charset="utf-8"'}));
      final match = RegExp(r'<RelTime>(.*?)</RelTime>').firstMatch(res.data.toString());
      final parts = (match?.group(1) ?? "00:00:00").split(':');
      return Duration(hours: int.parse(parts[0]), minutes: int.parse(parts[1]), seconds: int.parse(parts[2]));
    } catch (_) { return Duration.zero; }
  }

  Future<String?> getTransportState() async {
    if (selectedDevice == null) return null;
    if (selectedDevice!.type == DeviceType.chromecast) return statePlaying;

    try {
      final body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:GetTransportInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID></u:GetTransportInfo></s:Body></s:Envelope>';
      final res = await _dio.post(selectedDevice!.controlUrl, data: body, options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#GetTransportInfo"', "Content-Type": 'text/xml; charset="utf-8"'}));
      return XmlDocument.parse(res.data.toString()).findAllElements('CurrentTransportState').first.innerText;
    } catch (_) { return null; }
  }

  String getTransportStatePublic() => statePlaying;

  Future<void> discoverAndConnect(BuildContext context) async {
    showLoading("Searching Devices ...", context);
    await discoverDevices();
    if (devices.isEmpty) {
      Fluttertoast.showToast(msg: "No device Found");
      hideLoading(context);
      return;
    }
    final device = await selectDevice(context);
    isConnected = device != null;
    hideLoading(context);
  }

  Future<DlnaDevice?> selectDevice(BuildContext context) async {
    return showDialog<DlnaDevice>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Select TV"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: devices.map((d) => ListTile(
            leading: d.icon.startsWith("http") ? Image.network(d.icon, width: 30) : const Icon(Icons.tv),
            title: Text(d.name),
            onTap: () {
              selectedDevice = d;
              Navigator.pop(context, d);
            },
          )).toList(),
        ),
      ),
    );
  }

  Future<void> _sendAvTransportCommand(String action, {Map<String, String>? extraParams}) async {
    if (selectedDevice == null) return;
    final buffer = StringBuffer('<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:$action xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID>');
    extraParams?.forEach((key, value) => buffer.write('<$key>$value</$key>'));
    buffer.write('</u:$action></s:Body></s:Envelope>');

    await _dio.post(selectedDevice!.controlUrl, data: buffer.toString(), options: Options(headers: {"SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#$action"', "Content-Type": 'text/xml; charset="utf-8"'}));
  }

  String _formatDuration(Duration d) {
    return "${d.inHours.toString().padLeft(2, '0')}:${(d.inMinutes % 60).toString().padLeft(2, '0')}:${(d.inSeconds % 60).toString().padLeft(2, '0')}";
  }

  String _escapeXml(String input) => input.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
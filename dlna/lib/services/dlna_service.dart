// ignore_for_file: use_build_context_synchronously

import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/services/functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:xml/xml.dart';


class DlnaService {
  List<DlnaDevice> devices = [];
  DlnaDevice? selectedDevice;
  String statePlaying="STOPPED";
  bool isConnected=false;
  bool isDarkMode=false;
  dynamic selectedChannel={"id":-1,"name":""};
   dynamic lastSelectedChannel={"id":-1};
   String proxyUrl="";

void setChannel(dynamic ch){
  lastSelectedChannel=selectedChannel;

  selectedChannel=ch;
}

  final Dio _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5)));
Future<void> disconnect() async {
  try {
    final state = await _getTransportState();

    if (state == "PLAYING" || state == "PAUSED_PLAYBACK") {
      await stop();
    }
  } catch (_) {}

  selectedDevice = null;
  statePlaying = "STOPPED";
  isConnected = false;
}
  /// 🔹 Découverte réelle SSDP / MediaRenderer
  Future<void> discoverDevices() async {
    devices.clear();
    const st = "urn:schemas-upnp-org:device:MediaRenderer:1";
    const mx = 3;

    final ssdpRequest = '''
M-SEARCH * HTTP/1.1
HOST: 239.255.255.250:1900
MAN: "ssdp:discover"
MX: $mx
ST: $st

''';

    final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
    socket.broadcastEnabled = true;
    socket.send(
        utf8.encode(ssdpRequest), InternetAddress("239.255.255.250"), 1900);

    final discoveredLocations = <String>{};

    socket.listen((event) async {
      if (event == RawSocketEvent.read) {
        final dg = socket.receive();
        if (dg == null) return;

        final response = utf8.decode(dg.data);
        final match = RegExp(r"LOCATION: (.*)", caseSensitive: false)
            .firstMatch(response);
        if (match != null) {
          final location = match.group(1)!.trim();
          if (!discoveredLocations.contains(location)) {
            discoveredLocations.add(location);
            await _fetchDeviceDescription(location);
          }
        }
      }
    });

    await Future.delayed(const Duration(seconds: 3));
    socket.close();
  }

 late String renderingControlUrl; // ajouter dans DlnaDevice si besoin

Future<void> _fetchDeviceDescription(String location) async {
  try {
    final response = await _dio.get(location);
    final xmlDoc = XmlDocument.parse(response.data.toString());

    final name = xmlDoc.findAllElements('friendlyName').first.innerText;

    // AVTransport
    final avTransportService = xmlDoc.findAllElements('service').firstWhere(
        (s) =>
            s.findElements('serviceType').first.innerText
                .contains('AVTransport'),
        orElse: () => XmlElement(XmlName('')));
    if (avTransportService.name.local == '') return;
    final controlUrl = avTransportService.findElements('controlURL').first.innerText;
    final baseUri = Uri.parse(location);
    final finalControlUrl = baseUri.resolve(controlUrl).toString();

    // RenderingControl
    final renderingService = xmlDoc.findAllElements('service').firstWhere(
        (s) =>
            s.findElements('serviceType').first.innerText
                .contains('RenderingControl'),
        orElse: () => XmlElement(XmlName('')));
    String finalRenderingUrl = finalControlUrl; // fallback
    if (renderingService.name.local != '') {
      finalRenderingUrl =
          baseUri.resolve(renderingService.findElements('controlURL').first.innerText).toString();
    }
    final iconElement = xmlDoc
    .findAllElements('icon')
    .firstWhere(
      (icon) =>
          icon.findElements('mimetype').isNotEmpty &&
          icon.findElements('mimetype').first.innerText.contains('png'),
      orElse: () => XmlElement(XmlName('')),
    );

String finalIconUrl = '';

if (iconElement.name.local != '') {
  final iconPath = iconElement.findElements('url').first.innerText;
  finalIconUrl = baseUri.resolve(iconPath).toString();
}
    devices.add(DlnaDevice(
      name: name,
      icon: finalIconUrl,
      controlUrl: finalControlUrl,
      renderingUrl: finalRenderingUrl, // ajouter un champ renderingUrl
    ));
  } catch (e) {
    print("Error fetching device description: $e");
  }
}


Future<void> _sendAvTransportCommand(String action, {Map<String, String>? extraParams}) async {
  if (selectedDevice == null) return;

  final buffer = StringBuffer();

  buffer.write('''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:$action xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
''');

  if (extraParams != null) {
    extraParams.forEach((key, value) {
      buffer.write('<$key>$value</$key>');
    });
  }

  buffer.write('''
</u:$action>
</s:Body>
</s:Envelope>
''');

  await _dio.post(
    selectedDevice!.controlUrl,
    data: buffer.toString(),
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:AVTransport:1#$action"',
      },
    ),
  );
}
Future<String?> _getTransportState() async {
  if (selectedDevice == null) return null;

  const body = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:GetTransportInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
</u:GetTransportInfo>
</s:Body>
</s:Envelope>
''';

  try {
    final response = await _dio.post(
      selectedDevice!.controlUrl,
      data: body,
      options: Options(
        headers: {
          "Content-Type": 'text/xml; charset="utf-8"',
          "SOAPAction":
              '"urn:schemas-upnp-org:service:AVTransport:1#GetTransportInfo"',
        },
      ),
    );

    final xml = XmlDocument.parse(response.data.toString());
    return xml.findAllElements('CurrentTransportState').first.innerText;
  } catch (e) {
    print("GetTransportInfo error: $e");
    return null;
  }
}
Future<void> setMute(bool mute) async {
  final muteBody = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <u:SetMute xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
      <InstanceID>0</InstanceID>
      <Channel>Master</Channel>
      <DesiredMute>${mute ? 1 : 0}</DesiredMute>
    </u:SetMute>
  </s:Body>
</s:Envelope>
''';

  await _dio.post(
    selectedDevice!.renderingUrl,
    data: muteBody,
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:RenderingControl:1#SetMute"',
      },
    ),
  );
}
String _formatDuration(Duration d) {
  final hours = d.inHours.toString().padLeft(2, '0');
  final minutes =
      (d.inMinutes % 60).toString().padLeft(2, '0');
  final seconds =
      (d.inSeconds % 60).toString().padLeft(2, '0');

  return "$hours:$minutes:$seconds";
}
Future<void> seekOneMinute({required bool forward,int duration=1}) async {
  final current = await _getCurrentPosition();
  final newPosition = forward
      ? current +  Duration(minutes: duration)
      : current -  Duration(minutes: duration);

  final safePosition =
      newPosition.isNegative ? Duration.zero : newPosition;

  final formatted = _formatDuration(safePosition);

  final seekBody = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
      <InstanceID>0</InstanceID>
      <Unit>ABS_TIME</Unit>
      <Target>$formatted</Target>
    </u:Seek>
  </s:Body>
</s:Envelope>
''';

  await _dio.post(
    selectedDevice!.controlUrl,
    data: seekBody,
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:AVTransport:1#Seek"',
      },
    ),
  );
}
Future<Duration> _getCurrentPosition() async {
  const body = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
      <InstanceID>0</InstanceID>
    </u:GetPositionInfo>
  </s:Body>
</s:Envelope>
''';

  final response = await _dio.post(
    selectedDevice!.controlUrl,
    data: body,
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo"',
      },
    ),
  );

  final xml = response.data.toString();

  final match = RegExp(r'<RelTime>(.*?)</RelTime>').firstMatch(xml);
  final time = match?.group(1) ?? "00:00:00";

  final parts = time.split(':');
  return Duration(
    hours: int.parse(parts[0]),
    minutes: int.parse(parts[1]),
    seconds: int.parse(parts[2]),
  );
}

String getTransportStatePublic()  {
  return  statePlaying;
}
Future<void> togglePlayPause() async {
  statePlaying = await _getTransportState()??"STOPPED";

  if (statePlaying.isEmpty) return ;

  if (statePlaying == "PLAYING") {
    await pause();
    return;
  }

  if (statePlaying == "PAUSED_PLAYBACK" || statePlaying == "STOPPED") {
    await play();
    return;
  }
}

Future<void> play() async {
  await _sendAvTransportCommand(
    "Play",
    extraParams: {"Speed": "1"},
  );
}
Future<void> stop() async {
  await _sendAvTransportCommand("Stop");
}
Future<void> pause() async {
  await _sendAvTransportCommand("Pause");
}
/// 🔹 Obtenir le volume actuel via RenderingControl
Future<void> volumeUp({int step = 1}) async {
  if (selectedDevice == null) return;
  final current = await _getCurrentVolume();
  final newVol = (current + step).clamp(0, 100);
  await setVolume(newVol);
}

Future<void> volumeDown({int step = 1}) async {
  if (selectedDevice == null) return;
  final current = await _getCurrentVolume();
  final newVol = (current - step).clamp(0, 100);
  await setVolume(newVol);
}

Future<int> _getCurrentVolume() async {
  final getVolumeBody = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:GetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
<InstanceID>0</InstanceID>
<Channel>Master</Channel>
</u:GetVolume>
</s:Body>
</s:Envelope>
''';

  final response = await _dio.post(
    selectedDevice!.renderingUrl,
    data: getVolumeBody,
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:RenderingControl:1#GetVolume"',
      },
    ),
  );

  final xml = XmlDocument.parse(response.data.toString());
  return int.tryParse(xml.findAllElements('CurrentVolume').first.innerText) ?? 0;
}

Future<void> setVolume(int volume) async {
  final setVolumeBody = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
<InstanceID>0</InstanceID>
<Channel>Master</Channel>
<DesiredVolume>$volume</DesiredVolume>
</u:SetVolume>
</s:Body>
</s:Envelope>
''';

  await _dio.post(
    selectedDevice!.renderingUrl,
    data: setVolumeBody,
    options: Options(
      headers: {
        "Content-Type": 'text/xml; charset="utf-8"',
        "SOAPAction":
            '"urn:schemas-upnp-org:service:RenderingControl:1#SetVolume"',
      },
    ),
  );
}
  Future<void> discoverAndConnect(BuildContext context) async {
    showLoading("Searching Devices ...",context);
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
  /// 🔹 Sélection device via dialog
  Future<DlnaDevice?> selectDevice(BuildContext context) async {
    return showDialog<DlnaDevice>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Select TV"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: devices
              .map((d) => ListTile(
                leading: Image.network(d.icon),
                    title: Text(d.name),
                    onTap: () {
                      selectedDevice = d;
                      Navigator.pop(context, d);
                    },
                  ))
              .toList(),
        ),
      ),
    );
  }
String _escapeXml(String input) {
  return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
}
  /// 🔹 PlayWithTitle M3U8 / MP4 sur device sélectionné
  Future<void> playWithTitle(String url, String title) async {
FlutterForegroundTask.updateService(
      notificationTitle: title,
      notificationText: 'Playing now',
      notificationButtons: [
          const NotificationButton(id: 'btn_pause', text: 'Play/Pause'),
          const NotificationButton(id: 'btn_stop', text: 'Stop Service'),
        ],
    );
    selectedChannel={"id":5,"name":title};
    if (selectedDevice == null) return;

    final mimeType = url.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp4";

final protocolInfo =
      "http-get:*:$mimeType:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000";

 final didl = '''
<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
  <item id="0" parentID="0" restricted="1">
    <dc:title>${_escapeXml(title)}</dc:title>
    <upnp:class>object.item.videoItem</upnp:class>
    <res protocolInfo="$protocolInfo">
      ${_escapeXml(url)}
    </res>
  </item>
</DIDL-Lite>
''';

  // 🔥 ENCODAGE OBLIGATOIRE
  final encodedMetadata = const HtmlEscape().convert(didl);

 final setUriBody = '''
<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
<s:Body>
<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
<CurrentURI>${_escapeXml(url)}</CurrentURI>
<CurrentURIMetaData>$encodedMetadata</CurrentURIMetaData>
</u:SetAVTransportURI>
</s:Body>
</s:Envelope>
''';

    try {
      await _dio.post(
        selectedDevice!.controlUrl,
        data: setUriBody,
        options: Options(
          headers: {
            "Content-Type": 'text/xml; charset="utf-8"',
            "SOAPAction":
                '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
          },
        ),
      );

      final playBody = '''
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
<Speed>1</Speed>
</u:Play>
</s:Body>
</s:Envelope>
''';

      await _dio.post(
        selectedDevice!.controlUrl,
        data: playBody,
        options: Options(
          headers: {
            "Content-Type": 'text/xml; charset="utf-8"',
            "SOAPAction":
                '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
          },
        ),
      );
      statePlaying="PLAYING";
    } catch (e) {
      statePlaying="STOPPED";
      print("DLNA playWithTitle error: $e");
    }
  }

}

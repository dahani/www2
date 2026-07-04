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
    ChannelModel selectedChannel=ChannelModel(id: -1,name:"empty",poster: "",url: "",isFav: 0);
    ChannelModel lastSelectedChannel=ChannelModel(id: -1,name:"empty",poster: "",url: "",isFav: 0);
    String proxyUrl="";
    int videoDuration=0;
    bool isPlayingMovie=false;

 Future<void> playWithTitleChannel(ChannelModel ch) async {

 final tmp=selectedChannel;
   lastSelectedChannel=tmp;
  selectedChannel=ch;
    playWithTitle(ch.url,ch.name,isMovie: false);

 }
  Future<void> playWithTitleMovie(String url,String title) async {
  final ch=ChannelModel(id: -3,name:title,poster: "",url:url,isFav: 0);
 final tmp=selectedChannel;
   lastSelectedChannel=tmp;
  selectedChannel=ch;

    playWithTitle(ch.url,ch.name,isMovie: true);

 }
void setChannel(ChannelModel ch){
   final tmp=selectedChannel;
   lastSelectedChannel=tmp;
  selectedChannel=ch;
}
  final Dio _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5)));
Future<void> disconnect() async {
  try {
    final state = await getTransportState();

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

  // 1. Find your phone's actual internal local network IP address
  String? localIp;
  final interfaces = await NetworkInterface.list(
    type: InternetAddressType.IPv4,
    includeLinkLocal: false,
    includeLoopback: false,
  );

  for (var interface in interfaces) {
    // Look specifically for Wi-Fi interfaces (wlan, en, wlan0)
    if (interface.name.contains('wlan') || interface.name.contains('en')) {
      if (interface.addresses.isNotEmpty) {
        localIp = interface.addresses.first.address;
        break;
      }
    }
  }

  // Fallback to the first available if named search didn't match
  localIp ??= interfaces.isNotEmpty && interfaces.first.addresses.isNotEmpty
      ? interfaces.first.addresses.first.address
      : null;

  if (localIp == null) {
    debugPrint("Could not determine local Wi-Fi interface IP.");
    return;
  }

  const multicastAddress = "239.255.255.250";
  const st = "urn:schemas-upnp-org:device:MediaRenderer:1";
  const mx = 3;

  final ssdpRequest = "M-SEARCH * HTTP/1.1\r\n"
      "HOST: $multicastAddress:1900\r\n"
      "MAN: \"ssdp:discover\"\r\n"
      "MX: $mx\r\n"
      "ST: $st\r\n\r\n";

  // 2. Explicitly bind to your phone's real local IP address, NOT anyIPv4
  final socket = await RawDatagramSocket.bind(localIp, 0);
  socket.broadcastEnabled = true;
  socket.multicastLoopback = false;

  // 3. FORCE the OS network stack to join the UPnP multicast group on this specific interface
  try {
    socket.joinMulticast(InternetAddress(multicastAddress));
  } catch (e) {
    debugPrint("Multicast join failed, falling back to broadcast: $e");
  }

  final discoveredLocations = <String>{};
  final List<Future> pendingFetches = [];

  final subscription = socket.listen((event) {
    if (event == RawSocketEvent.read) {
      final dg = socket.receive();
      if (dg == null) return;

      try {
        final response = utf8.decode(dg.data);
        final match = RegExp(r"LOCATION:\s*(.*)", caseSensitive: false)
            .firstMatch(response);

        if (match != null) {
          final location = match.group(1)!.trim();
          if (!discoveredLocations.contains(location)) {
            discoveredLocations.add(location);
            pendingFetches.add(_fetchDeviceDescription(location));
          }
        }
      } catch (e) {
        debugPrint("Error parsing datagram payload: $e");
      }
    }
  });

  // Blast out the probe multiple times to handle packet loss
  for (int i = 0; i < 3; i++) {
    socket.send(
      utf8.encode(ssdpRequest),
      InternetAddress(multicastAddress),
      1900
    );
    await Future.delayed(const Duration(milliseconds: 150));
  }

  // Wait for network responses
  await Future.delayed(Duration(seconds: mx));

  // Let running HTTP parsing blocks safely finish writing to the devices array
  if (pendingFetches.isNotEmpty) {
    await Future.wait(pendingFetches).timeout(
      const Duration(seconds: 2),
      onTimeout: () => []
    );
  }

  await subscription.cancel();
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
    debugPrint("Error fetching device description: $e");
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
Future<String?> getTransportState() async {
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
    debugPrint("GetTransportInfo error: $e");
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
Future<void> seekToposition({required int duration}) async {
  final newPosition = Duration(minutes: duration);

  final safePosition =newPosition.isNegative ? Duration.zero : newPosition;

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
Future<void> seekOneMinute({required bool forward,int duration=1}) async {
  final current = await _getCurrentPosition();
  final newPosition = forward
      ? current +  Duration(minutes: duration)
      : current -  Duration(minutes: duration);

  final safePosition =newPosition.isNegative ? Duration.zero : newPosition;

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
  statePlaying = await getTransportState()??"STOPPED";

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
        title: const Text("Select TV",textAlign: TextAlign.center,),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: devices
              .map((d) => ListTile(
                leading:Icon(Icons.tv),
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
/// 🔹 PlayWithTitle M3U8 / MP4 sur device sélectionné
/// 🔹 High-Compatibility Play Method (Strips metadata to prevent silent TV crashes)
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

    // IMPORTANT RULE: Check your URL format!
    // If it's HTTPS, many TVs fail silently. DLNA prefers plain http://
    // If it's a local server on the phone, make sure it uses the phone's Wi-Fi IP (192.168.x.x), NOT localhost/127.0.0.1
    final cleanUrl = _escapeXml(url);

    try {
      // Step 1: Force the TV to stop whatever it's doing to clear its buffer state
      final stopBody = '''<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:Stop xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
</u:Stop>
</s:Body>
</s:Envelope>''';

      try {
        await _dio.post(
          selectedDevice!.controlUrl,
          data: stopBody,
          options: Options(headers: {
            "Content-Type": 'text/xml; charset="utf-8"',
            "SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#Stop"',
          }),
        );
      } catch (_) {
        // Ignore errors if the TV was already stopped
      }

      await Future.delayed(const Duration(milliseconds: 300));
       final mimeType = url.endsWith(".m3u8")? "application/vnd.apple.mpegurl": "video/mp4";
    final protocolInfo =  "http-get:*:$mimeType:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000";

 final didl = '''
<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
  <item id="0" parentID="0" restricted="1">
    <dc:title>${_escapeXml(title)}</dc:title>
    <upnp:class>object.item.videoBroadcast</upnp:class>
    <res protocolInfo="$protocolInfo">
      ${_escapeXml(url)}
    </res>
  </item>
</DIDL-Lite>
''';

  // 🔥 ENCODAGE OBLIGATOIRE
  final encodedMetadata = const HtmlEscape().convert(didl);

      // Step 2: Set the URI with COMPLETELY EMPTY metadata.
      // This skips the buggy DIDL-Lite parsing phase that breaks Samsung/LG/Sony engines.
      final setUriBody = '''<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
<s:Body>
<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
<CurrentURI>$cleanUrl</CurrentURI>
<CurrentURIMetaData>$encodedMetadata</CurrentURIMetaData>
</u:SetAVTransportURI>
</s:Body>
</s:Envelope>''';

      await _dio.post(
        selectedDevice!.controlUrl,
        data: setUriBody,
        options: Options(
          headers: {
            "Content-Type": 'text/xml; charset="utf-8"',
            "SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
          },
        ),
      );

      // Step 3: Give the TV a moment to process the empty metadata handoff
      await Future.delayed(const Duration(milliseconds: 800));

      // Step 4: Execute the Play command
      final playBody = '''<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
<InstanceID>0</InstanceID>
<Speed>1</Speed>
</u:Play>
</s:Body>
</s:Envelope>''';

      await _dio.post(
        selectedDevice!.controlUrl,
        data: playBody,
        options: Options(
          headers: {
            "Content-Type": 'text/xml; charset="utf-8"',
            "SOAPAction": '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
          },
        ),
      );

      statePlaying = "PLAYING";
      Fluttertoast.showToast(msg: "Casting started!");
    } catch (e) {
      statePlaying = "STOPPED";
      debugPrint("DLNA playWithTitle error: $e");
      Fluttertoast.showToast(msg: "Casting failed: $e");
    }
  }

}

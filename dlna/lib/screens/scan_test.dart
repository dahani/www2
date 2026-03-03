import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:multicast_dns/multicast_dns.dart';
import 'package:xml/xml.dart';

class RealScannerScreen extends StatefulWidget {
  const RealScannerScreen({super.key});

  @override
  State<RealScannerScreen> createState() => _RealScannerScreenState();
}

class _RealScannerScreenState extends State<RealScannerScreen> {
  final List<DiscoveredDevice> _devices = [];
  bool _isScanning = false;

  /// --- 1. DLNA/SSDP SCANNING ---
  Future<void> _scanDLNA() async {
    const String ssdpAddress = '239.255.255.250';
    const int ssdpPort = 1900;
    final String query =
        'M-SEARCH * HTTP/1.1\r\n'
        'HOST: $ssdpAddress:$ssdpPort\r\n'
        'MAN: "ssdp:discover"\r\n'
        'MX: 3\r\n'
        'ST: urn:schemas-upnp-org:service:AVTransport:1\r\n\r\n';

    RawDatagramSocket.bind(InternetAddress.anyIPv4, 0).then((socket) {
      socket.send(utf8.encode(query), InternetAddress(ssdpAddress), ssdpPort);
      socket.listen((RawSocketEvent event) {
        if (event == RawSocketEvent.read) {
          Datagram? dg = socket.receive();
          if (dg != null) {
            String response = utf8.decode(dg.data);
            _parseSSDPResponse(response);
          }
        }
      });
      Future.delayed(const Duration(seconds: 4), () => socket.close());
    });
  }

Future<void> _fetchDeviceDetails(String xmlUrl) async {
  try {
    final response = await Dio().get(xmlUrl);
    final document = XmlDocument.parse(response.data.toString());

    // DLNA devices store their name in the <friendlyName> tag
    final friendlyName = document.findAllElements('friendlyName').first.innerText;
    _addDevice(DiscoveredDevice(
      name: friendlyName,
      url: xmlUrl,
      type: DeviceType.dlna,
    ));
  } catch (e) {
    debugPrint("Could not fetch details for $xmlUrl: $e");
    // Fallback to IP address if name fetch fails
    _addDevice(DiscoveredDevice(
      name: "Generic DLNA Device",
      url: xmlUrl,
      type: DeviceType.dlna
    ));
  }
}
 void _parseSSDPResponse(String response) {
  RegExp exp = RegExp(r"LOCATION: (.*)\r\n", caseSensitive: false);
  Match? match = exp.firstMatch(response);
  if (match != null) {
    String xmlUrl = match.group(1)!.trim();
    // Don't add yet, fetch the 'friendlyName' first
    _fetchDeviceDetails(xmlUrl);
  }
}

  /// --- 2. CHROMECAST/mDNS SCANNING ---
  Future<void> _scanChromecast() async {
    const String name = '_googlecast._tcp.local';
    final MDnsClient client = MDnsClient();
    await client.start();

    await for (final PtrResourceRecord ptr in client.lookup<PtrResourceRecord>(
        ResourceRecordQuery.serverPointer(name))) {
      await for (final SrvResourceRecord srv in client.lookup<SrvResourceRecord>(
          ResourceRecordQuery.service(ptr.domainName))) {
        _addDevice(DiscoveredDevice(
          name: ptr.domainName.split('.').first,
          url: srv.target,
          type: DeviceType.chromecast,
        ));
      }
    }
    client.stop();
  }

  void _addDevice(DiscoveredDevice device) {
    if (!_devices.any((d) => d.url == device.url)) {
      setState(() => _devices.add(device));
    }
  }

  void _fullScan() async {
    setState(() {
      _isScanning = true;
      _devices.clear();
    });
    await Future.wait([_scanDLNA(), _scanChromecast()]);
    setState(() => _isScanning = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Real Network Scan")),
      body: Column(
        children: [
          if (_isScanning) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              itemCount: _devices.length,
              itemBuilder: (context, i) => ListTile(
                leading: Icon(_devices[i].type == DeviceType.chromecast ? Icons.cast : Icons.tv),
                title: Text(_devices[i].name),
                subtitle: Text(_devices[i].url),
                onTap: () => debugPrint("Connecting to ${_devices[i].name}"),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isScanning ? null : _fullScan,
        child: const Icon(Icons.search),
      ),
    );
  }
}

enum DeviceType { dlna, chromecast }

class DiscoveredDevice {
  final String name;
  final String url;
  final DeviceType type;
  DiscoveredDevice({required this.name, required this.url, required this.type});
}
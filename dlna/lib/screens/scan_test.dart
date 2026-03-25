import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:flutter/material.dart';
import 'package:multicast_dns/multicast_dns.dart';
import 'package:xml/xml.dart';
import 'package:provider/provider.dart';
import 'package:dlna/services/dlna_provider.dart';
class RealScannerScreen extends StatefulWidget {
  const RealScannerScreen({super.key});

  @override
  State<RealScannerScreen> createState() => _RealScannerScreenState();
}

class _RealScannerScreenState extends State<RealScannerScreen> {
  final List<DlnaDevice> _devices = [];
  bool _isScanning = false;
  late DlnaService dlnaService;
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
    _addDevice(DlnaDevice(
      name: friendlyName,
      renderingUrl: xmlUrl,
      controlUrl: xmlUrl,type: DeviceType.dlna
    ));
  } catch (e) {
    debugPrint("Could not fetch details for $xmlUrl: $e");
    // Fallback to IP address if name fetch fails
    _addDevice(DlnaDevice(
      name: "Generic DLNA Device",
      renderingUrl: xmlUrl, controlUrl: xmlUrl,
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

Future<void> _scanChromecast() async {
  const String service = '_googlecast._tcp.local';
  final MDnsClient client = MDnsClient();

  await client.start();

  try {
    await for (final PtrResourceRecord ptr in client.lookup<PtrResourceRecord>(
        ResourceRecordQuery.serverPointer(service))) {

      await for (final SrvResourceRecord srv in client.lookup<SrvResourceRecord>(
          ResourceRecordQuery.service(ptr.domainName))) {

        // ✅ Resolve IP (THIS IS THE IMPORTANT PART)
        InternetAddress? ip;
        await for (final addr in client.lookup<IPAddressResourceRecord>(
            ResourceRecordQuery.addressIPv4(srv.target))) {
          ip = addr.address;
          break;
        }

        if (ip == null) continue;

        final deviceKey = "${ip.address}:${srv.port}";

        // Optional: better name from TXT
        String name = ptr.domainName.split('.').first;

        await for (final txt in client.lookup<TxtResourceRecord>(
            ResourceRecordQuery.text(ptr.domainName))) {

          final raw = txt.text.replaceAll('\u0000', ' ');
          final match = RegExp(r'fn=([^=]+?)(?=\s|$)').firstMatch(raw);

          if (match != null) {
            name = match.group(1)!.trim();
          }
          break;
        }

        _addDevice(DlnaDevice(
          name: name,
          controlUrl: deviceKey,                // ex: 192.168.1.15:8009
          renderingUrl: "http://$deviceKey",
          type: DeviceType.chromecast,
        ));

        debugPrint("Chromecast: $name ($deviceKey)");
      }
    }
  } catch (e) {
    debugPrint("Chromecast scan error: $e");
  } finally {
    await Future.delayed(const Duration(seconds: 3));
    client.stop();
  }
}
  void _addDevice(DlnaDevice device) {
    if (!_devices.any((d) => d.renderingUrl == device.renderingUrl)) {
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
void initState() {
  super.initState();
    dlnaService = Provider.of<DlnaProvider>(context, listen: false).dlnaService;
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
                subtitle: Text(_devices[i].controlUrl),
                onTap:  () {
             
                },
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


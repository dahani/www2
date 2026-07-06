// ignore_for_file: use_build_context_synchronously

import 'dart:async';
import 'dart:io';
import 'package:dlna/models/models.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:flutter/material.dart';
import 'package:multicast_dns/multicast_dns.dart';
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

  /// --- 1. DLNA SCANNING USING DLNASERVICE ---
  Future<void> _scanDLNA() async {
    try {
      // Execute the verified, robust multi-packet interface binding scan
      await dlnaService.discoverDevices();

      // Add discovered DLNA devices safely to our screen list without duplicating
      for (var device in dlnaService.devices) {
        _addDevice(device);
      }
    } catch (e) {
      debugPrint("Error scanning via DlnaService: $e");
    }
  }

  /// --- 2. CHROMECAST SCANNING ---
  Future<void> _scanChromecast() async {
    const String service = '_googlecast._tcp.local';
    final MDnsClient client = MDnsClient();

    await client.start();

    try {
      await for (final PtrResourceRecord ptr in client.lookup<PtrResourceRecord>(
          ResourceRecordQuery.serverPointer(service))) {

        await for (final SrvResourceRecord srv in client.lookup<SrvResourceRecord>(
            ResourceRecordQuery.service(ptr.domainName))) {

          InternetAddress? ip;
          await for (final addr in client.lookup<IPAddressResourceRecord>(
              ResourceRecordQuery.addressIPv4(srv.target))) {
            ip = addr.address;
            break;
          }

          if (ip == null) continue;

          final deviceKey = "${ip.address}:${srv.port}";
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
            controlUrl: deviceKey,
            renderingUrl: "http://$deviceKey",
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

    // Concurrent scanning execution loop
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
  itemBuilder: (context, i) {
    final device = _devices[i];
    return ListTile(
      leading: const Icon(Icons.tv),
      title: Text(device.name),
      subtitle: Text(device.controlUrl),
      onTap: () {
        // Assign the device directly to your global service state layer
        dlnaService.selectedDevice = device;
        dlnaService.isConnected = true;

        // Visual confirmation alert popup notification
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Connected to ${device.name}"),
            duration: const Duration(seconds: 2),
          ),
        );

        // Optional: Close screen automatically once target controller is locked in
        Navigator.pop(context);
      },
    );
  },
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
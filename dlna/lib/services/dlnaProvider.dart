import 'package:dlna/services/dlna_service.dart';
import 'package:flutter/material.dart';

class DlnaProvider extends ChangeNotifier {
  final DlnaService dlnaService = DlnaService();

  bool get isConnected => dlnaService.isConnected;

Future<void> disconnect() async {
  await dlnaService.disconnect();
  dlnaService.isConnected = false;
  notifyListeners();
}

}

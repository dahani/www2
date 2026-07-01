
import 'package:app_links/app_links.dart';
import 'package:dlna/services/dlna_provider.dart';
import 'package:dlna/services/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'screens/home.dart';
import 'package:provider/provider.dart';
String? startupUrl;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  FlutterForegroundTask.initCommunicationPort();
  final appLinks = AppLinks();
  try {
    final uri = await appLinks.getInitialLink();
    startupUrl = uri?.toString();
  } catch (e) {
    debugPrint('Failed to get initial link: $e');
  }

  runApp(
    ChangeNotifierProvider(
      create: (_) => DlnaProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home:  const DlnaHomePage(),
    );
  }
}

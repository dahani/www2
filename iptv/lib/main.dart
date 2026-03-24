import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:tv_app/welcome_screen.dart';
import 'providers/channel_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations for Android TV
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ChannelProvider(),
      child: MaterialApp(
        title: 'TV Channels',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          primaryColor: const Color(0xFFE50914),
          scaffoldBackgroundColor: const Color(0xFF0F0F0F),
          fontFamily: 'Roboto',
        ),
        home: const WelcomeScreen(),
      ),
    );
  }
}

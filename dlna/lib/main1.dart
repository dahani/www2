import 'package:dlna/services/dlna_provider.dart';
import 'package:flutter/material.dart';
import 'screens/home.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(create: (_) => DlnaProvider(), child: const MyApp()),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  final Color seedColor = const Color(0xFF1565C0);
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seedColor,
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seedColor,
          brightness: Brightness.dark,

        ),
        bottomAppBarTheme: BottomAppBarThemeData(
          color: Colors.black
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(backgroundColor: Colors.black)
      ),
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home: DlnaHomePage(),
    );
  }
}

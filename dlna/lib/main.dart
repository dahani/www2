import 'package:dlna/services/dlnaProvider.dart';
import 'package:dlna/services/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'screens/home.dart';
import 'package:provider/provider.dart';

void main() {
  FlutterForegroundTask.initCommunicationPort();
  runApp(ChangeNotifierProvider(create: (_) => DlnaProvider(), child: const MyApp()),);
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme:lightTheme,
      darkTheme:darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home: DlnaHomePage(),
    );
  }
}

//crow movie https://egymovies.org/api/v1/titles/2794?loader=titleCreditsPage
/*

   data-value="revenue:desc"Biggest revenue first
    data-value="budget:desc"Biggest budget first
     data-value="rating:desc"Highest rated first
      data-value="created_at:desc"Recently created
         data-value="popularity:desc"Most popular first




*/
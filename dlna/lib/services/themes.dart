
import 'package:flutter/material.dart';
final Color seedColor = const Color(0xFF1565C0);
final ThemeData lightTheme= ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSwatch(
          accentColor: Colors.blue,
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
        ),
        bottomAppBarTheme: BottomAppBarThemeData(
          color: Colors.blue
        ),
       //  floatingActionButtonTheme: FloatingActionButtonThemeData(backgroundColor: Colors.blue)

      );

      final  darkTheme= ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seedColor,
          brightness: Brightness.dark,

        ),
        bottomAppBarTheme: BottomAppBarThemeData(
          color: Colors.black
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(backgroundColor: Colors.black)
      );
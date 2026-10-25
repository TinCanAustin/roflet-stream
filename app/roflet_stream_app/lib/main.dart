import 'package:flutter/material.dart';
import 'package:roflet_stream_app/pages/start_page/startpage.dart';
import 'package:roflet_stream_app/pages/stream_page/stream_menu_page.dart';

void main() {
  runApp(
    MaterialApp(
      initialRoute: '/',
      routes: {
        '/': (context) => const Startpage(duration: Duration(seconds: 3)),
        '/songs': (context)=> const StreamMenu()
      }
    )
  );
}
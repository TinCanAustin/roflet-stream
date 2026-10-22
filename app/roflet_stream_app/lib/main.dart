import 'package:flutter/material.dart';
import 'package:roflet_stream_app/pages/start_page/startpage.dart';

void main() {
  runApp(
    MaterialApp(
      initialRoute: '/',
      routes: {
        '/': (context) => const Startpage(duration: Duration(seconds: 3),)
      }
    )
  );
}
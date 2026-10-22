import 'package:flutter/material.dart';
import "dart:math";

class Startpage extends StatefulWidget {
  const new({super.key, required this.duration});

  final Duration duration;

  @override
  State<Startpage> createState() => _StartpageState();
}

class _StartpageState extends State<Startpage> with TickerProviderStateMixin{

  late AnimationController _controller;
  late AnimationController _controller2;

  late Animation<double> _sweepIn;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _textAnimation;

  List<Color> primaryColors = <Color>[
    Color(0xff252525),
    Color(0xff29242D),
    Color(0xff2C2335),
    Color(0xff30233E),
    Color(0xff342246),
    Color(0xff37214E),
    Color.fromARGB(255, 78, 40, 117)
  ];

  List<double> colorRatio = <double>[0.75, 0.80, 0.85, 0.90, 0.95, 0.98, 1.0];

  @override
  void initState(){
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this
    );
    _controller2 = AnimationController(vsync: this, duration: widget.duration);
    
    _controller.addListener((){
      if(_controller.isCompleted){
        _controller2.forward();
      }
    });

    _sweepIn = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.fastOutSlowIn));

    _textAnimation = CurvedAnimation(parent: _controller2, curve: Curves.easeInOut);

    _controller.forward();
  }

  @override
  void dispose(){
    _controller.dispose();
    super.dispose();
  }

  void _processGesture(Offset? start, Offset? end){
    double dx = end!.dx - start!.dx;
    double dy = end.dy - start.dy;
    double distance = sqrt(pow(dx, 2) + pow(dy, 2));
    double angle = (dy == 0 && dx == 0) ? 0 : atan(dy / dx);

    print("Start $start");
    print("End: $end");
    print("Distance: $distance");
    print("Angle: $angle");
  }

  Offset? _startPoint;
  Offset? _endPoint;

  @override
  Widget build(BuildContext context) {

    double _screenheight = MediaQuery.sizeOf(context).height;
    double _screenweight = MediaQuery.sizeOf(context).width;

    return Scaffold(
      body: AnimatedBuilder(
        animation: _sweepIn,
        builder: (context, _){
          final t = _sweepIn.value;
          return Container(
            width: _screenweight,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment(0.8, 1),
                colors: [
                  for (final color in primaryColors) Color.lerp(Color(0xff252525), color, t)!,
                ],
                // stops: colorRatio
              )
            ),
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onPanStart: (detalis){
                _startPoint = detalis.globalPosition;
              },
              onPanUpdate: (detalis){
                _endPoint = detalis.globalPosition;
              },
              onPanEnd: (details){
                if(_startPoint != null && _endPoint != null){
                  _processGesture(_startPoint, _endPoint);
                }
              },
              child: SizedBox.expand(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SlideTransition(
                      position: _slideAnimation,
                      child: FadeTransition(
                        opacity: _sweepIn,
                        child: Image.asset(
                          'assets/placeholder.png',
                          height: _screenheight * 0.3,
                        ),
                      ),
                    ),
                    SizedBox(height: _screenheight * 0.1,),
                    FadeTransition(
                      opacity: _textAnimation,
                      child: Text(
                        "Swipe up to start",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20
                        ),
                      ),
                    )
                  ],
                ),
              )
            ),
          );
        },
      ),
    );
  }
}
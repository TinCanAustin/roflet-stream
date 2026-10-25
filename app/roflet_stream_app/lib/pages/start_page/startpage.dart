import 'package:flutter/material.dart';

class Startpage extends StatefulWidget {
  const new({super.key, required this.duration});

  final Duration duration;

  @override
  State<Startpage> createState() => _StartpageState();
}

class _StartpageState extends State<Startpage> with TickerProviderStateMixin{

  late AnimationController _controller;
  late AnimationController _controller2;
  late AnimationController _swipeController;

  late Animation<double> _sweepIn;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _textAnimation;

  bool _done = false;

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
    _swipeController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    
    _controller.addListener((){
      if(_controller.isCompleted){
        _controller2.forward();
      }
    });

    _controller2.addListener((){
      if(_controller2.isCompleted){
        _done = true;
      }
    });

    _swipeController.addListener((){
      if(_swipeController.isCompleted){
        Navigator.pushNamed(context, '/songs');
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

  void _panUpdate(DragUpdateDetails d, double _screenheight){
    if(!_done) return;
    final delta = -d.delta.dy / (_screenheight * 0.4); //swipe lenght by 40% of the screen hight so we have how much % is swipped
    _swipeController.value = (_swipeController.value + delta).clamp(0.0, 1.0); //clappmed so that we dont get error
  }

  void _panEnd(DragEndDetails d){
    if(!_done) return;

    final flingUp = d.velocity.pixelsPerSecond.dy < -800;
    if(_swipeController.value > 0.5 || flingUp){
      _swipeController.forward();
    }else{
      _swipeController.reverse();
    }
  }

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
              onPanUpdate: (details){
                _panUpdate(details, _screenheight);
              },
              onPanEnd: _panEnd,
              child: SizedBox.expand(
                child: AnimatedBuilder(
                  animation: _swipeController,
                  builder: (context, child){
                    final e = Curves.easeOut.transform(_swipeController.value);
                    return Opacity(
                      opacity: 1 - e,
                      child: Transform.translate(
                        offset: Offset(0, -e * _screenheight * 0.25),
                        child: child,
                      ),
                    );
                  },
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
                        child: Column(
                          children: [
                            Text(
                              "Swipe up to start",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20
                              ),
                            ),
                            Icon(
                              Icons.arrow_drop_up_rounded,
                              color: Colors.white,
                              size: 40,
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              )
            ),
          );
        },
      ),
    );
  }
}
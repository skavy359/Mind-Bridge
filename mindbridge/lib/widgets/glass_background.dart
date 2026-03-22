import 'dart:ui';
import 'package:flutter/material.dart';

class GlassBackground extends StatelessWidget {
  final Widget child;
  final bool showBlobs;

  const GlassBackground({
    Key? key,
    required this.child,
    this.showBlobs = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (showBlobs) ...[
          Positioned(
            top: -100,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: const Color(0xFFFF56F6).withOpacity(0.3),
                shape: BoxShape.circle,
                boxShadow: const [BoxShadow(blurRadius: 100, color: Color(0xFFFF56F6))],
              ),
            ),
          ),
          Positioned(
            bottom: -150,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                color: const Color(0xFFB936F5).withOpacity(0.2),
                shape: BoxShape.circle,
                boxShadow: const [BoxShadow(blurRadius: 100, color: Color(0xFFB936F5))],
              ),
            ),
          ),
        ],

        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
            child: Container(color: Colors.transparent),
          ),
        ),

        child,
      ],
    );
  }
}
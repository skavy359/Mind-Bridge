import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'auth_wrapper.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _haloController;
  late AnimationController _rayController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _rayAnimation;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _haloController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _rayController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeIn),
    );

    _rayAnimation = Tween<double>(begin: 0.3, end: 0.7).animate(
      CurvedAnimation(parent: _rayController, curve: Curves.easeInOut),
    );

    _fadeController.forward().then((_) {
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const AuthWrapper()),
          );
        }
      });
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _haloController.dispose();
    _rayController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020202),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Stack(
          children: [
            const Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    colors: [
                      Color(0x1A00FF9D),
                      Colors.transparent,
                    ],
                    radius: 0.8,
                  ),
                ),
              ),
            ),
            
            Center(
              child: AnimatedBuilder(
                animation: Listenable.merge([_haloController, _rayController]),
                builder: (context, child) {
                  return CustomPaint(
                    size: const Size(300, 400),
                    painter: DivinePainter(
                      haloRotation: _haloController.value,
                      rayOpacity: _rayAnimation.value,
                    ),
                  );
                },
              ),
            ),

            Positioned(
              bottom: 80,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Text(
                    'MINDBRIDGE',
                    style: TextStyle(
                      color: const Color(0xFF00FF9D),
                      fontSize: 12,
                      letterSpacing: 8,
                      fontWeight: FontWeight.w300,
                      shadows: [
                        Shadow(
                          color: const Color(0xFF00FF9D).withOpacity(0.5),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: 40,
                    height: 1,
                    color: const Color(0xFF00FF9D).withOpacity(0.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DivinePainter extends CustomPainter {
  final double haloRotation;
  final double rayOpacity;

  DivinePainter({required this.haloRotation, required this.rayOpacity});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.4);
    final paint = Paint()
      ..color = const Color(0xFF00FF9D)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final rayPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF00FF9D).withOpacity(rayOpacity * 0.3),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: center, radius: 150));

    for (int i = 0; i < 12; i++) {
        final angle = (i * 30) * math.pi / 180;
        canvas.save();
        canvas.translate(center.dx, center.dy);
        canvas.rotate(angle);
        canvas.drawRect(
          Rect.fromLTWH(-1, 0, 2, 250),
          rayPaint,
        );
        canvas.restore();
    }

    final haloPaint = Paint()
      ..color = const Color(0xFF00FF9D).withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    canvas.save();
    canvas.translate(center.dx, center.dy - 35);
    canvas.rotate(haloRotation * 2 * math.pi);
    canvas.drawOval(
      Rect.fromCenter(center: Offset.zero, width: 70, height: 25),
      haloPaint,
    );
    canvas.drawOval(
      Rect.fromCenter(center: Offset.zero, width: 75, height: 30),
      Paint()
        ..color = const Color(0xFF00FF9D).withOpacity(0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.0
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5),
    );
    canvas.restore();

    final figurePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(Offset(center.dx, center.dy - 10), 8, figurePaint);
    
    final robePath = Path()
      ..moveTo(center.dx, center.dy + 2)
      ..lineTo(center.dx - 25, center.dy + 70)
      ..lineTo(center.dx + 25, center.dy + 70)
      ..close();
    canvas.drawPath(robePath, figurePaint..style = PaintingStyle.stroke);
    canvas.drawPath(robePath, Paint()..color = Colors.white.withOpacity(0.05)..style = PaintingStyle.fill);

    final leftArm = Path()
      ..moveTo(center.dx - 5, center.dy + 15)
      ..quadraticBezierTo(center.dx - 35, center.dy + 10, center.dx - 45, center.dy + 35);
    canvas.drawPath(leftArm, figurePaint..style = PaintingStyle.stroke);

    final rightArm = Path()
      ..moveTo(center.dx + 5, center.dy + 15)
      ..quadraticBezierTo(center.dx + 35, center.dy + 10, center.dx + 45, center.dy + 35);
    canvas.drawPath(rightArm, figurePaint..style = PaintingStyle.stroke);
    
    canvas.drawCircle(
      center,
      40,
      Paint()
        ..color = const Color(0xFF00FF9D).withOpacity(0.15)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 15),
    );
  }

  @override
  bool shouldRepaint(covariant DivinePainter oldDelegate) => 
    oldDelegate.haloRotation != haloRotation || oldDelegate.rayOpacity != rayOpacity;
}
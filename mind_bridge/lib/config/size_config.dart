import 'package:flutter/cupertino.dart';

class SizeConfig {
  static MediaQueryData? _mediaQueryData;
  static double? screenWidth;
  static double? screenHeight;
  static double? defaultSize;
  static Orientation? orientation;

  void init(BuildContext context) {
    _mediaQueryData = MediaQuery.of(context);
    screenWidth = _mediaQueryData!.size.width;
    screenHeight = _mediaQueryData!.size.height;
    orientation = _mediaQueryData!.orientation;
  }
}

double screenHeight(double inputHeight) {
  double screenHeight = SizeConfig.screenHeight as double;
  return (inputHeight / 585) * screenHeight;
}

double screenWidth(double inputWidth) {
  double screenWidth = SizeConfig.screenWidth as double;
  return (inputWidth / 270) * screenWidth;
}

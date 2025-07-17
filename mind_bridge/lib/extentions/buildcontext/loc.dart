import 'package:flutter/material.dart';
import 'package:mind_bridge/l10n/app_localizations.dart';

extension Localization on BuildContext {
  AppLocalizations get loc => AppLocalizations.of(this)!;
}

import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'features/auth/login_screen.dart'; // Import just in case, but Dashboard is improved target
import 'features/dashboard/dashboard_screen.dart';
import 'features/landing/landing_screen.dart';
import 'services/auth_service.dart';

void main() {
  runApp(const HybridAthleteApp());
}

class HybridAthleteApp extends StatelessWidget {
  const HybridAthleteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hybrid Athlete AI',
      theme: AppTheme.darkTheme,
      home: const AuthCheck(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthCheck extends StatefulWidget {
  const AuthCheck({super.key});

  @override
  State<AuthCheck> createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  Future<bool>? _authFuture;

  @override
  void initState() {
    super.initState();
    _authFuture = AuthService().isLoggedIn();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _authFuture,
      builder: (context, snapshot) {
        // Show loading while checking token
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: AppTheme.backgroundColor,
            body: Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
          );
        }

        // If logged in, go to Dashboard
        if (snapshot.data == true) {
          return const DashboardScreen();
        }

        // Otherwise, show Landing Page
        return const LandingScreen();
      },
    );
  }
}

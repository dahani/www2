import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:tv_app/screens/iptv_home_screen.dart';
import 'package:tv_app/screens/movies_screen.dart';
import '../providers/movie_provider.dart';
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [

            // IPTV and Movies Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildMenuButton(
                  context: context,
                  icon: Icons.live_tv,
                  title: 'IPTV',
                  subtitle: 'Live Channels',
                  gradientColors: const [Color(0xFFE50914), Color(0xFFB20710)],
                  autofocus: true,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const IptvHomeScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 40),
                _buildMenuButton(
                  context: context,
                  icon: Icons.movie,
                  title: 'Movies',
                  subtitle: 'On Demand',
                  gradientColors: const [Color(0xFF1E88E5), Color(0xFF1565C0)],
                  autofocus: false,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ChangeNotifierProvider(
                          create: (_) => MovieProvider(),
                          child: const MoviesScreen(),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuButton({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Color> gradientColors,
    required bool autofocus,
    required VoidCallback onTap,
  }) {
    return Focus(
      autofocus: autofocus,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;

          return GestureDetector(
            onTap: onTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 280,
              height: 320,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: gradientColors,
                ),
                borderRadius: BorderRadius.circular(24),
                border: isFocused
                    ? Border.all(color: Colors.white, width: 4)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: isFocused
                        ? gradientColors[0].withValues(alpha:0.6)
                        : Colors.black.withValues(alpha:0.4),
                    blurRadius: isFocused ? 30 : 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    color: Colors.white,
                    size: 100,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

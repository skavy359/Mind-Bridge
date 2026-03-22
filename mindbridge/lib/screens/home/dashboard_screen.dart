import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appwrite/appwrite.dart';
import '../../services/auth_service.dart';
import '../../services/appwrite_service.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/glass_background.dart';
import '../notes/notes_screen.dart';
import '../opportunities/opportunities_screen.dart';
import '../profile/profile_screen.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with TickerProviderStateMixin {
  int _selectedIndex = 0;
  late AnimationController _animationController;

  final List<Widget> _screens = const [
    HomeTab(),
    NotesScreen(),
    OpportunitiesScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: GlassBackground(
        child: SafeArea(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            switchInCurve: Curves.easeInOut,
            switchOutCurve: Curves.easeInOut,
            child: _screens[_selectedIndex],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          border: Border(top: BorderSide(color: isDark ? Colors.white : Colors.black, width: 2.5)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: isDark ? Colors.white : Colors.black, width: 2.5),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.white : Colors.black,
                    offset: const Offset(4, 4),
                  )
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12.5),
                child: NavigationBar(
                  selectedIndex: _selectedIndex,
                  onDestinationSelected: (index) {
                    setState(() => _selectedIndex = index);
                    _animationController.reset();
                    _animationController.forward();
                  },
                  backgroundColor: isDark ? const Color(0xFF222222) : Colors.white,
                  elevation: 0,
                  indicatorColor: Theme.of(context).colorScheme.secondary,
                  height: 65,
                  labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
                  destinations: [
                    NavigationDestination(
                      icon: const Icon(Icons.home_outlined),
                      selectedIcon: Icon(Icons.home, color: isDark ? Colors.white : Colors.black),
                      label: 'Home',
                    ),
                    NavigationDestination(
                      icon: const Icon(Icons.book_outlined),
                      selectedIcon: Icon(Icons.book, color: isDark ? Colors.white : Colors.black),
                      label: 'Notes',
                    ),
                    NavigationDestination(
                      icon: const Icon(Icons.work_outline),
                      selectedIcon: Icon(Icons.work, color: isDark ? Colors.white : Colors.black),
                      label: 'Opportunities',
                    ),
                    NavigationDestination(
                      icon: const Icon(Icons.person_outline),
                      selectedIcon: Icon(Icons.person, color: isDark ? Colors.white : Colors.black),
                      label: 'Profile',
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HomeTab extends StatefulWidget {
  const HomeTab({Key? key}) : super(key: key);

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  final _auth = AuthService();
  final _databases = AppwriteService().databases;
  int _noteCount = 0;
  int _oppCount = 0;
  int _downloadCount = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      final notes = await _databases.listDocuments(
        databaseId: AppwriteService.databaseId,
        collectionId: AppwriteService.notesCollectionId,
        queries: [Query.equal('uploadedBy', user.uid), Query.limit(1)],
      );

      final opps = await _databases.listDocuments(
        databaseId: AppwriteService.databaseId,
        collectionId: AppwriteService.opportunitiesCollectionId,
        queries: [Query.limit(1)],
      );

      final prefs = await SharedPreferences.getInstance();
      final userId = AuthService().currentUser?.uid ?? 'anonymous';
      final storageKey = 'downloaded_notes_$userId';
      final downloads = prefs.getStringList(storageKey) ?? [];

      if (mounted) {
        setState(() {
          _noteCount = notes.total;
          _oppCount = opps.total;
          _downloadCount = downloads.length;
          _isLoadingStats = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching stats: $e');
      if (mounted) setState(() => _isLoadingStats = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StreamBuilder<User?>(
      stream: _auth.authStateChanges,
      builder: (context, snapshot) {
        final user = snapshot.data ?? _auth.currentUser;
        final userName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Explorer';

        return Scaffold(
          backgroundColor: Colors.transparent, 
          body: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MindBridge',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'Your Study Companion',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? Colors.white70 : Colors.black54,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withOpacity(0.05)
                            : Theme.of(context).colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        icon: Icon(
                          themeProvider.isDarkMode
                              ? Icons.light_mode_rounded
                              : Icons.dark_mode_rounded,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        onPressed: () => themeProvider.toggleTheme(),
                        tooltip: 'Toggle Theme',
                      ),
                    ),
                  ],
                ),
              ),

              FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.secondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? Colors.white : Colors.black, width: 2.5),
                        boxShadow: [
                          BoxShadow(
                            color: isDark ? Colors.white : Colors.black,
                            offset: const Offset(6, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: isDark ? Colors.white : Colors.black,
                                backgroundImage: user?.photoURL != null ? NetworkImage(user!.photoURL!) : null,
                                child: user?.photoURL == null 
                                  ? Text(
                                    userName.substring(0, 1).toUpperCase(),
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.secondary,
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  )
                                  : null,
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.white : Colors.black,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  children: [
                                    Icon(Icons.verified, color: Theme.of(context).colorScheme.secondary, size: 16),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Active',
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.secondary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Welcome back,',
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            userName,
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black,
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Ready for learning something new?',
                            style: TextStyle(
                              color: isDark ? Colors.white.withOpacity(0.9) : Colors.black.withOpacity(0.8),
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Quick Access',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                      ),
                    ),
                    Icon(
                      Icons.dashboard_customize_rounded,
                      color: Theme.of(context).colorScheme.primary,
                      size: 20,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.1,
                  children: [
                    _QuickAccessCard(
                      icon: Icons.book_rounded,
                      title: 'My Notes',
                      subtitle: 'View & upload',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4F7FFF), Color(0xFF3D66CC)],
                      ),
                      onTap: () {
                        final scaffoldState = context.findAncestorStateOfType<_DashboardScreenState>();
                        scaffoldState?.setState(() {
                          scaffoldState._selectedIndex = 1;
                        });
                      },
                    ),
                    _QuickAccessCard(
                      icon: Icons.work_rounded,
                      title: 'Opportunities',
                      subtitle: 'Find jobs',
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF7A5C), Color(0xFFE65C3B)],
                      ),
                      onTap: () {
                        final scaffoldState = context.findAncestorStateOfType<_DashboardScreenState>();
                        scaffoldState?.setState(() {
                          scaffoldState._selectedIndex = 2;
                        });
                      },
                    ),
                    _QuickAccessCard(
                      icon: Icons.person_rounded,
                      title: 'Profile',
                      subtitle: 'View profile',
                      gradient: const LinearGradient(
                        colors: [Color(0xFFA855F7), Color(0xFF8B44D9)],
                      ),
                      onTap: () {
                        final scaffoldState = context.findAncestorStateOfType<_DashboardScreenState>();
                        scaffoldState?.setState(() {
                          scaffoldState._selectedIndex = 3;
                        });
                      },
                    ),
                    _QuickAccessCard(
                      icon: Icons.share_rounded,
                      title: 'Share App',
                      subtitle: 'Invite friends',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF059669)],
                      ),
                      onTap: () {
                        Share.share('Check out MindBridge - Your collaborative study platform! Download now and start sharing notes.');
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardTheme.color,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isDark ? Colors.white : Colors.black, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: isDark ? Colors.white : Colors.black,
                        offset: const Offset(6, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.analytics_rounded,
                            color: Theme.of(context).colorScheme.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Your Stats',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _StatItem(
                            icon: Icons.file_present_rounded,
                            count: _isLoadingStats ? '...' : _noteCount.toString(),
                            label: 'My Notes',
                            color: const Color(0xFF4F7FFF),
                          ),
                          Container(
                            height: 50,
                            width: 1,
                            color: isDark
                                ? Colors.white.withOpacity(0.1)
                                : Colors.grey[300],
                          ),
                          _StatItem(
                            icon: Icons.work_rounded,
                            count: _isLoadingStats ? '...' : _oppCount.toString(),
                            label: 'Available',
                            color: const Color(0xFFFF7A5C),
                          ),
                          Container(
                            height: 50,
                            width: 1,
                            color: isDark
                                ? Colors.white.withOpacity(0.1)
                                : Colors.grey[300],
                          ),
                          _StatItem(
                            icon: Icons.download_rounded,
                            count: _isLoadingStats ? '...' : _downloadCount.toString(),
                            label: 'Downloads',
                            color: const Color(0xFF10B981),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _QuickAccessCard extends StatefulWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Gradient gradient;
  final VoidCallback onTap;

  const _QuickAccessCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.onTap,
  });

  @override
  State<_QuickAccessCard> createState() => _QuickAccessCardState();
}

class _QuickAccessCardState extends State<_QuickAccessCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _isPressed ? 0.95 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          decoration: BoxDecoration(
            gradient: widget.gradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: widget.gradient.colors.first.withOpacity(0.3),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    widget.icon,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const Spacer(),
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String count;
  final String label;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.count,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 24, color: color),
        ),
        const SizedBox(height: 8),
        Text(
          count,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF1A1A1A),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
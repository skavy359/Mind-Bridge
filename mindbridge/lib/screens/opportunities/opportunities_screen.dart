import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:appwrite/appwrite.dart';
import '../../services/auth_service.dart';
import 'package:appwrite/models.dart' as models;
import '../../services/appwrite_service.dart';

class OpportunitiesScreen extends StatefulWidget {
  const OpportunitiesScreen({Key? key}) : super(key: key);

  @override
  State<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends State<OpportunitiesScreen> {
  final _databases = AppwriteService().databases;
  String _selectedFilter = 'All';
  final List<String> _filters = ['All', 'Internship', 'Job', 'Competition'];
  
  bool _isLoading = true;
  List<models.Document> _opportunities = [];

  @override
  void initState() {
    super.initState();
    _fetchOpportunities();
  }

  Future<void> _fetchOpportunities() async {
    setState(() => _isLoading = true);
    try {
      final queries = <String>[];
      if (_selectedFilter != 'All') {
        queries.add(Query.equal('type', _selectedFilter.toLowerCase()));
      }
      queries.add(Query.orderDesc('postedAt'));

      final response = await _databases.listDocuments(
        databaseId: AppwriteService.databaseId,
        collectionId: AppwriteService.opportunitiesCollectionId,
        queries: queries,
      );
      
      setState(() {
        _opportunities = response.documents;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching opportunities: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _opportunities = [];
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Opportunities',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        'Find your next adventure',
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
                        Icons.refresh_rounded,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      onPressed: _fetchOpportunities,
                    ),
                  ),
                ],
              ),
            ),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _filters.map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      child: FilterChip(
                        label: Text(
                          filter,
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            fontSize: 13,
                            color: isSelected 
                                ? Colors.black 
                                : (isDark ? Colors.white : Theme.of(context).colorScheme.primary),
                          ),
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() => _selectedFilter = filter);
                          _fetchOpportunities();
                        },
                        selectedColor: const Color(0xFFCCFF00),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected ? Colors.black : (isDark ? Colors.white24 : Colors.black12),
                            width: 1.5,
                          ),
                        ),
                        showCheckmark: false,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            Expanded(
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                  : _opportunities.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off_rounded, size: 64, color: Colors.grey[400]),
                              const SizedBox(height: 16),
                              const Text('No opportunities found', style: TextStyle(color: Colors.grey, fontSize: 16)),
                              const SizedBox(height: 16),
                              FilledButton.icon(
                                onPressed: _fetchOpportunities,
                                icon: const Icon(Icons.refresh_rounded),
                                label: const Text('Retry'),
                              ),
                            ],
                          ),
                        )
                    : RefreshIndicator(
                        onRefresh: _fetchOpportunities,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          physics: const BouncingScrollPhysics(),
                          itemCount: _opportunities.length,
                          itemBuilder: (context, index) {
                            final doc = _opportunities[index];
                            return OpportunityCard(
                              title: doc.data['title'] ?? 'Untitled',
                              company: doc.data['company'] ?? 'Unknown Company',
                              type: doc.data['type'] ?? 'internship',
                              location: doc.data['location'] ?? 'Remote',
                              description: doc.data['description'] ?? '',
                              deadline: DateTime.tryParse(doc.data['deadline'] ?? ''),
                              applyLink: doc.data['applyLink'] ?? '',
                              postedAt: DateTime.tryParse(doc.data['postedAt'] ?? ''),
                            );
                          },
                        ),
                      ),
            ),
          ],
        ),
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black, width: 2.5),
          boxShadow: const [
            BoxShadow(
              color: Colors.black,
              offset: Offset(4, 4),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          onPressed: () => _showAddOpportunityDialog(context),
          label: const Text(
            'Add Opportunity',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          icon: const Icon(Icons.add_rounded),
          backgroundColor: const Color(0xFFCCFF00),
          foregroundColor: Colors.black,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13.5)),
        ),
      ),
    );
  }

  void _showAddOpportunityDialog(BuildContext context) {
    final titleController = TextEditingController();
    final companyController = TextEditingController();
    final descriptionController = TextEditingController();
    final locationController = TextEditingController();
    final linkController = TextEditingController();
    String selectedType = 'internship';
    DateTime selectedDeadline = DateTime.now().add(const Duration(days: 30));

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Add Opportunity'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Title',
                    hintText: 'e.g., Software Engineer Intern',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: companyController,
                  decoration: const InputDecoration(
                    labelText: 'Company',
                    hintText: 'e.g., Google',
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: ['internship', 'job', 'competition'].map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(type[0].toUpperCase() + type.substring(1)),
                    );
                  }).toList(),
                  onChanged: (value) => setDialogState(() => selectedType = value!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: locationController,
                  decoration: const InputDecoration(
                    labelText: 'Location',
                    hintText: 'e.g., Remote / Bangalore',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descriptionController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Brief description...',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: linkController,
                  decoration: const InputDecoration(
                    labelText: 'Apply Link',
                    hintText: 'https://...',
                  ),
                ),
                const SizedBox(height: 12),
                ListTile(
                  title: Text('Deadline: ${selectedDeadline.day}/${selectedDeadline.month}/${selectedDeadline.year}'),
                  trailing: const Icon(Icons.calendar_month_rounded),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDeadline,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (picked != null) {
                      setDialogState(() => selectedDeadline = picked);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                if (titleController.text.isEmpty || companyController.text.isEmpty || linkController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please fill required fields')),
                  );
                  return;
                }

                try {
                  await _databases.createDocument(
                    databaseId: AppwriteService.databaseId,
                    collectionId: AppwriteService.opportunitiesCollectionId,
                    documentId: ID.unique(),
                    data: {
                      'title': titleController.text,
                      'company': companyController.text,
                      'type': selectedType,
                      'location': locationController.text,
                      'description': descriptionController.text,
                      'deadline': selectedDeadline.toIso8601String(),
                      'applyLink': linkController.text,
                      'postedAt': DateTime.now().toIso8601String(),
                    },
                  );

                  if (context.mounted) {
                    Navigator.pop(context);
                    _fetchOpportunities();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Opportunity added successfully!'), backgroundColor: Colors.green),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
                    );
                  }
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}

class OpportunityCard extends StatefulWidget {
  final String title;
  final String company;
  final String type;
  final String location;
  final String description;
  final DateTime? deadline;
  final String applyLink;
  final DateTime? postedAt;

  const OpportunityCard({
    Key? key,
    required this.title,
    required this.company,
    required this.type,
    required this.location,
    required this.description,
    this.deadline,
    required this.applyLink,
    this.postedAt,
  }) : super(key: key);

  @override
  State<OpportunityCard> createState() => _OpportunityCardState();
}

class _OpportunityCardState extends State<OpportunityCard> {
  bool _isPressed = false;

  Color _getTypeColor() {
    switch (widget.type.toLowerCase()) {
      case 'internship':
        return const Color(0xFF3B82F6);
      case 'job':
        return const Color(0xFF10B981);
      case 'competition':
        return const Color(0xFFFF7A5C);
      default:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon() {
    switch (widget.type.toLowerCase()) {
      case 'internship':
        return Icons.school_rounded;
      case 'job':
        return Icons.work_rounded;
      case 'competition':
        return Icons.emoji_events_rounded;
      default:
        return Icons.work_outline_rounded;
    }
  }

  String _getTimeAgo() {
    if (widget.postedAt == null) return 'Recently';

    final now = DateTime.now();
    final postTime = widget.postedAt!;
    final difference = now.difference(postTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else {
      return 'Just now';
    }
  }

  String _getDeadline() {
    if (widget.deadline == null) return 'No deadline';

    final deadlineDate = widget.deadline!;
    final now = DateTime.now();
    final difference = deadlineDate.difference(now);

    if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} months left';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} days left';
    } else {
      return 'Expired';
    }
  }

  bool _isUrgent() {
    if (widget.deadline == null) return false;
    final deadlineDate = widget.deadline!;
    final now = DateTime.now();
    final difference = deadlineDate.difference(now);
    return difference.inDays <= 7 && difference.inDays > 0;
  }

  Future<void> _launchUrl() async {
    if (widget.applyLink.isEmpty) return;

    var url = widget.applyLink;
    if (!url.startsWith('http')) {
      url = 'https://$url';
    }

    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('Could not launch $url: $e');
    }
  }

  bool _isSaved = false;

  @override
  void initState() {
    super.initState();
    _checkSavedStatus();
  }

  Future<void> _checkSavedStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = AuthService().currentUser?.uid ?? 'anonymous';
    final storageKey = 'saved_opportunities_$userId';
    final saved = prefs.getStringList(storageKey) ?? [];
    
    if (mounted) {
      bool isSaved = false;
      for (final item in saved) {
        try {
          final data = jsonDecode(item);
          if (data['title'] == widget.title && data['company'] == widget.company) {
            isSaved = true;
            break;
          }
        } catch (_) {}
      }
      setState(() {
        _isSaved = isSaved;
      });
    }
  }

  Future<void> _toggleSave() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = AuthService().currentUser?.uid ?? 'anonymous';
    final storageKey = 'saved_opportunities_$userId';
    final saved = prefs.getStringList(storageKey) ?? [];
    
    final itemKey = widget.title + widget.company;

    if (_isSaved) {
      saved.removeWhere((item) {
        try {
          final data = jsonDecode(item);
          return data['title'] == widget.title && data['company'] == widget.company;
        } catch (_) {
          return false;
        }
      });
    } else {
      final oppData = {
        'title': widget.title,
        'company': widget.company,
        'type': widget.type,
        'location': widget.location,
        'description': widget.description,
        'deadline': widget.deadline?.toIso8601String(),
        'applyLink': widget.applyLink,
        'postedAt': widget.postedAt?.toIso8601String(),
      };
      saved.add(jsonEncode(oppData));
    }

    await prefs.setStringList(storageKey, saved);
    if (mounted) {
      setState(() {
        _isSaved = !_isSaved;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isUrgent = _isUrgent();

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isUrgent ? Colors.red : (isDark ? Colors.white : Colors.black),
              width: 2.5,
            ),
            boxShadow: [
              BoxShadow(
                color: isUrgent ? Colors.red : (isDark ? Colors.white : Colors.black),
                offset: const Offset(4, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          _getTypeColor(),
                          _getTypeColor().withOpacity(0.7),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: _getTypeColor().withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      _getTypeIcon(),
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.business_rounded, size: 14, color: isDark ? Colors.white70 : Colors.black54),
                            const SizedBox(width: 6),
                            Text(
                              widget.company,
                              style: TextStyle(
                                fontSize: 14,
                                color: isDark ? Colors.white70 : Colors.black54,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(
                      _isSaved ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
                      color: _isSaved ? Theme.of(context).colorScheme.primary : Colors.grey,
                    ),
                    onPressed: _toggleSave,
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
              const SizedBox(height: 14),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getTypeColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getTypeIcon(), size: 14, color: _getTypeColor()),
                        const SizedBox(width: 6),
                        Text(
                          widget.type[0].toUpperCase() + widget.type.substring(1),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _getTypeColor(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withOpacity(0.05)
                          : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_on_rounded, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 6),
                        Text(
                          widget.location,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isUrgent)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.access_time_filled_rounded, size: 14, color: Colors.red),
                          const SizedBox(width: 6),
                          Text(
                            'Urgent',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),

              if (widget.description.isNotEmpty) ...[
                const SizedBox(height: 14),
                Text(
                  widget.description,
                  style: TextStyle(
                    color: isDark ? Colors.white70 : Colors.black87,
                    fontSize: 14,
                    height: 1.5,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              const SizedBox(height: 16),
              Container(
                height: 1,
                color: isDark
                    ? Colors.white.withOpacity(0.05)
                    : Colors.grey.withOpacity(0.1),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Icon(Icons.schedule_rounded, size: 16, color: isDark ? Colors.white70 : Colors.black54),
                  const SizedBox(width: 6),
                  Text(
                    _getTimeAgo(),
                    style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.event_rounded,
                    size: 16,
                    color: isUrgent ? Colors.red : (isDark ? Colors.white70 : Colors.black54),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _getDeadline(),
                    style: TextStyle(
                      fontSize: 12,
                      color: isUrgent ? Colors.red : (isDark ? Colors.white70 : Colors.black54),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: _launchUrl,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                    label: const Text('Apply'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      elevation: 0,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
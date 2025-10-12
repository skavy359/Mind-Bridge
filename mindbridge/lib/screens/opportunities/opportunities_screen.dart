import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:url_launcher/url_launcher.dart';

class OpportunitiesScreen extends StatefulWidget {
  const OpportunitiesScreen({Key? key}) : super(key: key);

  @override
  State<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends State<OpportunitiesScreen> {
  String _selectedFilter = 'All';
  final List<String> _filters = ['All', 'Internship', 'Job', 'Competition'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Opportunities'),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: _filters.map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => _selectedFilter = filter);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _selectedFilter == 'All'
                  ? FirebaseFirestore.instance
                  .collection('opportunities')
                  .orderBy('postedAt', descending: true)
                  .snapshots()
                  : FirebaseFirestore.instance
                  .collection('opportunities')
                  .where('type', isEqualTo: _selectedFilter.toLowerCase())
                  .orderBy('postedAt', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error loading opportunities'),
                        const SizedBox(height: 8),
                        Text(
                          'Please check your internet connection',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.work_outline,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No opportunities yet',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Check back later for new postings',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final opportunities = snapshot.data!.docs;

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: opportunities.length,
                  itemBuilder: (context, index) {
                    final opportunity = opportunities[index].data() as Map<String, dynamic>;
                    return OpportunityCard(
                      title: opportunity['title'] ?? 'Untitled',
                      company: opportunity['company'] ?? 'Company',
                      type: opportunity['type'] ?? 'internship',
                      location: opportunity['location'] ?? 'Remote',
                      description: opportunity['description'] ?? '',
                      deadline: opportunity['deadline'] as Timestamp?,
                      applyLink: opportunity['applyLink'] ?? '',
                      postedAt: opportunity['postedAt'] as Timestamp?,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddOpportunityDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Add Opportunity'),
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

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
                onChanged: (value) => selectedType = value!,
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
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isEmpty || companyController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please fill required fields'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }

              try {
                await FirebaseFirestore.instance.collection('opportunities').add({
                  'title': titleController.text,
                  'company': companyController.text,
                  'type': selectedType,
                  'location': locationController.text.isEmpty
                      ? 'Remote'
                      : locationController.text,
                  'description': descriptionController.text,
                  'applyLink': linkController.text,
                  'postedAt': FieldValue.serverTimestamp(),
                  'deadline': Timestamp.fromDate(
                    DateTime.now().add(const Duration(days: 30)),
                  ),
                });

                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Opportunity added successfully!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

class OpportunityCard extends StatelessWidget {
  final String title;
  final String company;
  final String type;
  final String location;
  final String description;
  final Timestamp? deadline;
  final String applyLink;
  final Timestamp? postedAt;

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

  Color _getTypeColor() {
    switch (type.toLowerCase()) {
      case 'internship':
        return Colors.blue;
      case 'job':
        return Colors.green;
      case 'competition':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getTimeAgo() {
    if (postedAt == null) return 'Recently';

    final now = DateTime.now();
    final postTime = postedAt!.toDate();
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
    if (deadline == null) return 'No deadline';

    final deadlineDate = deadline!.toDate();
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

  Future<void> _launchUrl() async {
    if (applyLink.isEmpty) return;

    final uri = Uri.parse(applyLink);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getTypeColor().withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    type == 'job'
                        ? Icons.work
                        : type == 'competition'
                        ? Icons.emoji_events
                        : Icons.school,
                    color: _getTypeColor(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        company,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Wrap(
              spacing: 8,
              children: [
                Chip(
                  label: Text(
                    type[0].toUpperCase() + type.substring(1),
                    style: const TextStyle(fontSize: 12),
                  ),
                  backgroundColor: _getTypeColor().withOpacity(0.1),
                  labelStyle: TextStyle(color: _getTypeColor()),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                Chip(
                  label: Text(
                    location,
                    style: const TextStyle(fontSize: 12),
                  ),
                  avatar: const Icon(Icons.location_on, size: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (description.isNotEmpty) ...[
              Text(
                description,
                style: TextStyle(
                  color: Colors.grey[700],
                  fontSize: 14,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
            ],

            Row(
              children: [
                Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  _getTimeAgo(),
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                const SizedBox(width: 16),
                Icon(Icons.event, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  _getDeadline(),
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: _launchUrl,
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text('Apply'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
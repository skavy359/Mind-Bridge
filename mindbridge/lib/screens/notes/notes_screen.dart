import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:appwrite/models.dart' as models;
import '../../services/auth_service.dart';
import '../../services/appwrite_service.dart';
import '../../widgets/note_card.dart';
import 'upload_note_screen.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({Key? key}) : super(key: key);

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  final _databases = AppwriteService().databases;
  final _auth = AuthService();
  bool _isLoading = true;
  List<models.Document> _notes = [];

  @override
  void initState() {
    super.initState();
    _fetchNotes();
  }

  Future<void> _fetchNotes() async {
    setState(() => _isLoading = true);
    try {
      final response = await _databases.listDocuments(
        databaseId: AppwriteService.databaseId,
        collectionId: AppwriteService.notesCollectionId,
      );
      setState(() {
        _notes = response.documents;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching notes: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _notes = []; 
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentUserId = _auth.currentUser?.uid;

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
                        'Notes',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        'Shared study materials',
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
                      onPressed: _fetchNotes,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                    : _notes.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.note_alt_outlined, size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                Text(
                                  'No notes found',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 16),
                                ),
                                const SizedBox(height: 16),
                                FilledButton.icon(
                                  onPressed: _fetchNotes,
                                  icon: const Icon(Icons.refresh_rounded),
                                  label: const Text('Retry'),
                                ),
                              ],
                            ),
                          )
                      : RefreshIndicator(
                          onRefresh: _fetchNotes,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            physics: const BouncingScrollPhysics(),
                            itemCount: _notes.length,
                            itemBuilder: (context, index) {
                              final note = _notes[index];
                              return NoteCard(
                                noteId: note.$id,
                                title: note.data['title'] ?? 'Untitled',
                                subject: note.data['subject'] ?? 'General',
                                fileType: note.data['fileType'] ?? 'pdf',
                                fileUrl: note.data['fileUrl'] ?? '',
                                uploadedBy: note.data['uploaderName'] ?? 'Unknown',
                                uploadedAt: DateTime.tryParse(note.data['uploadedAt'] ?? ''),
                                isOwner: note.data['uploadedBy'] == currentUserId,
                                onDelete: () => setState(() {}),
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
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const UploadNoteScreen()),
            );
            if (result == true) _fetchNotes();
          },
          label: const Text(
            'Upload Note',
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
}
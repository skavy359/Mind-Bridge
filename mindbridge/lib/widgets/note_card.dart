import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'package:dio/dio.dart';
import 'package:open_filex/open_filex.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';
import '../services/appwrite_service.dart';
import '../services/auth_service.dart';

class NoteCard extends StatefulWidget {
  final String noteId;
  final String title;
  final String subject;
  final String fileType;
  final String fileUrl;
  final String uploadedBy;
  final DateTime? uploadedAt;
  final bool isOwner;
  final VoidCallback? onDelete;

  const NoteCard({
    Key? key,
    required this.noteId,
    required this.title,
    required this.subject,
    required this.fileType,
    required this.fileUrl,
    required this.uploadedBy,
    this.uploadedAt,
    this.isOwner = false,
    this.onDelete,
  }) : super(key: key);

  @override
  State<NoteCard> createState() => _NoteCardState();
}

class _NoteCardState extends State<NoteCard> {
  bool _isPressed = false;

  IconData _getFileIcon() {
    switch (widget.fileType.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf_rounded;
      case 'doc':
      case 'docx':
        return Icons.description_rounded;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Icons.image_rounded;
      default:
        return Icons.insert_drive_file_rounded;
    }
  }

  Color _getFileColor() {
    switch (widget.fileType.toLowerCase()) {
      case 'pdf':
        return Colors.redAccent;
      case 'doc':
      case 'docx':
        return Colors.blueAccent;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Colors.orangeAccent;
      default:
        return Colors.grey;
    }
  }

  String _getTimeAgo() {
    if (widget.uploadedAt == null) return 'Unknown';
    final difference = DateTime.now().difference(widget.uploadedAt!);
    if (difference.inDays > 0) return '${difference.inDays}d ago';
    if (difference.inHours > 0) return '${difference.inHours}h ago';
    if (difference.inMinutes > 0) return '${difference.inMinutes}m ago';
    return 'Just now';
  }

  Future<void> _openFile() async {
    await _downloadNote(context);
  }

  Future<void> _downloadNote(BuildContext context) async {
    debugPrint('Download triggered for: ${widget.title}');
    try {
      if (Platform.isAndroid) {
        await Permission.storage.request();
      }

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Downloading ${widget.title}...', style: const TextStyle(color: Colors.black)),
            backgroundColor: const Color(0xFFCCFF00),
            duration: const Duration(seconds: 2),
          ),
        );
      }

      final url = widget.fileUrl;
      String fileId = '';
      final fileIdMatch = RegExp(r'/files/([^/]+)/').firstMatch(url);
      if (fileIdMatch != null) {
        fileId = fileIdMatch.group(1)!;
      } else {
        fileId = widget.noteId; 
      }
      
      debugPrint('Extracting fileId: $fileId from URL: $url');

      final fileName = '${widget.title.replaceAll(RegExp(r'[^\w\s-]'), '')}_${DateTime.now().millisecondsSinceEpoch}.${widget.fileType.toLowerCase()}';
      final directory = await getApplicationDocumentsDirectory();
      final filePath = '${directory.path}/$fileName';

      final response = await AppwriteService().storage.getFileView(
        bucketId: AppwriteService.storageBucketId,
        fileId: fileId,
      );
      
      final file = File(filePath);
      await file.writeAsBytes(response);
      
      debugPrint('Download complete. Opening file at: $filePath');
      final result = await OpenFilex.open(filePath);
      debugPrint('Open file result: ${result.type}');
      
      if (result.type != ResultType.done && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening file: ${result.message}'),
            backgroundColor: Colors.orange,
          ),
        );
      }

      final prefs = await SharedPreferences.getInstance();
      final userId = AuthService().currentUser?.uid ?? 'anonymous';
      final storageKey = 'downloaded_notes_$userId';
      final downloadsJson = prefs.getStringList(storageKey) ?? [];
      
      bool alreadyDownloaded = false;
      for (final item in downloadsJson) {
        try {
          final data = jsonDecode(item);
          if (data['id'] == widget.noteId) {
            alreadyDownloaded = true;
            break;
          }
        } catch (_) {}
      }

      if (!alreadyDownloaded) {
        final noteData = {
          'id': widget.noteId,
          'title': widget.title,
          'subject': widget.subject,
          'fileType': widget.fileType,
          'fileUrl': widget.fileUrl,
          'uploaderName': widget.uploadedBy,
          'downloadedAt': DateTime.now().toIso8601String(),
        };
        
        downloadsJson.add(jsonEncode(noteData));
        await prefs.setStringList(storageKey, downloadsJson);
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
  }

  Future<void> _shareFile() async {
    await Share.share(
      'Check out this note: ${widget.title}\n\nDownload: ${widget.fileUrl}',
      subject: widget.title,
    );
  }

  Future<void> _deleteNote(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Note'),
        content: const Text('Are you sure you want to delete this note?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await AppwriteService().databases.deleteDocument(
          databaseId: AppwriteService.databaseId,
          collectionId: AppwriteService.notesCollectionId,
          documentId: widget.noteId,
        );
        
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Note deleted successfully'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Colors.green,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
          widget.onDelete?.call();
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error deleting note: $e'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: _openFile,
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white : Colors.black,
              width: 2.5,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.white : Colors.black,
                offset: const Offset(4, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getFileColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getFileIcon(),
                      color: _getFileColor(),
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
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                widget.subject,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: _getFileColor().withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                widget.fileType.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: _getFileColor(),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                height: 1,
                color: isDark
                    ? Colors.white.withOpacity(0.05)
                    : Colors.grey.withOpacity(0.1),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.person_rounded, size: 16, color: isDark ? Colors.white70 : Colors.black54),
                  const SizedBox(width: 6),
                  Text(
                    widget.uploadedBy,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white70 : Colors.black54,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.access_time_rounded, size: 16, color: isDark ? Colors.white70 : Colors.black54),
                  const SizedBox(width: 6),
                  Text(
                    _getTimeAgo(),
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white70 : Colors.black54,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withOpacity(0.05)
                          : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.download_rounded, size: 18),
                      onPressed: () => _downloadNote(context),
                      padding: const EdgeInsets.all(8),
                      constraints: const BoxConstraints(),
                      color: const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withOpacity(0.05)
                          : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.share_rounded, size: 18),
                      onPressed: _shareFile,
                      padding: const EdgeInsets.all(8),
                      constraints: const BoxConstraints(),
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  if (widget.isOwner) ...[
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.delete_rounded, size: 18),
                        onPressed: () => _deleteNote(context),
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(),
                        color: Colors.red,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
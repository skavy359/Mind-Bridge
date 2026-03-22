import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:appwrite/appwrite.dart';
import '../../services/auth_service.dart';
import '../../services/appwrite_service.dart';
import '../../widgets/glass_background.dart';

class UploadNoteScreen extends StatefulWidget {
  const UploadNoteScreen({Key? key}) : super(key: key);

  @override
  State<UploadNoteScreen> createState() => _UploadNoteScreenState();
}

class _UploadNoteScreenState extends State<UploadNoteScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _authService = AuthService();
  final _appwrite = AppwriteService();

  String? _selectedSubject;
  String? _fileName;
  PlatformFile? _pickedFile;
  bool _isUploading = false;
  double _uploadProgress = 0.0;

  final List<String> _subjects = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Economics',
    'Business',
    'Other',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        withData: true, 
      );

      if (result != null && result.files.single.bytes != null) {
        setState(() {
          _pickedFile = result.files.single;
          _fileName = result.files.single.name;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking file: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _getFileExtension(String fileName) {
    if (!fileName.contains('.')) return 'bin';
    final parts = fileName.split('.');
    if (parts.length < 2) return 'bin';
    return parts.last.toLowerCase();
  }

  Future<void> _uploadNote() async {
    if (!_formKey.currentState!.validate()) return;
    if (_pickedFile == null || _pickedFile!.bytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a file to upload'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.1; 
    });

    try {
      final user = _authService.currentUser;
      if (user == null) throw 'User not logged in';

      final fileId = ID.unique();
      final uploadedFile = await _appwrite.storage.createFile(
        bucketId: AppwriteService.storageBucketId,
        fileId: fileId,
        file: InputFile.fromBytes(
          bytes: _pickedFile!.bytes!.toList(),
          filename: _fileName!,
        ),
      );
      
      setState(() => _uploadProgress = 0.5);

      final fileUrl = '${AppwriteService.endpoint}/storage/buckets/${AppwriteService.storageBucketId}/files/${uploadedFile.$id}/view?project=${AppwriteService.projectId}';

      await _appwrite.databases.createDocument(
        databaseId: AppwriteService.databaseId,
        collectionId: AppwriteService.notesCollectionId,
        documentId: ID.unique(),
        data: {
          'title': _titleController.text,
          'subject': _selectedSubject,
          'fileUrl': fileUrl,
          'fileType': _getFileExtension(_fileName!),
          'uploadedBy': user.uid,
          'uploaderName': user.displayName,
          'uploadedAt': DateTime.now().toIso8601String(),
        },
      );

      setState(() => _uploadProgress = 1.0);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Note uploaded successfully!',
              style: TextStyle(color: Colors.black),
            ),
            behavior: SnackBarBehavior.floating,
            backgroundColor: const Color(0xFFCCFF00),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
        Navigator.pop(context, true); 
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadProgress = 0.0;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF111111) : const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(
          'Upload Note',
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: isDark ? Colors.white : Colors.black),
      ),
      body: GlassBackground(
        showBlobs: isDark,
        child: Container(
          color: isDark ? Colors.black.withOpacity(0.2) : Colors.white.withOpacity(0.4),
          height: double.infinity,
          width: double.infinity,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  GestureDetector(
                    onTap: _isUploading ? null : _pickFile,
                    child: Container(
                      height: 150,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withOpacity(0.05) : const Color(0xFFF0F0F0),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? Colors.white : Colors.black,
                          width: 2.5,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _pickedFile != null ? Icons.check_circle : Icons.cloud_upload,
                            size: 48,
                            color: _pickedFile != null ? Colors.green : Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _pickedFile != null ? _fileName! : 'Tap to select file',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'PDF, DOC, DOCX, JPG, PNG',
                            style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  TextFormField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      labelText: 'Title',
                      hintText: 'e.g., Data Structures Notes',
                      prefixIcon: const Icon(Icons.title),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'Please enter a title' : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedSubject,
                    decoration: InputDecoration(
                      labelText: 'Subject',
                      prefixIcon: const Icon(Icons.book),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                    onChanged: _isUploading ? null : (v) => setState(() => _selectedSubject = v),
                    validator: (v) => v == null ? 'Please select a subject' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _descriptionController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      labelText: 'Description (Optional)',
                      hintText: 'Brief description of the content',
                      prefixIcon: const Icon(Icons.description),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (_isUploading) ...[
                    LinearProgressIndicator(value: _uploadProgress, minHeight: 8, borderRadius: BorderRadius.circular(4)),
                    const SizedBox(height: 8),
                    Text(
                      '${(_uploadProgress * 100).toStringAsFixed(0)}% uploaded',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: isDark ? Colors.white70 : Colors.black54, fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                  ],

                  ElevatedButton(
                    onPressed: _isUploading ? null : _uploadNote,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isUploading
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                              SizedBox(width: 12),
                              Text('Uploading...'),
                            ],
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.cloud_upload),
                              SizedBox(width: 8),
                              Text('Upload Note'),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
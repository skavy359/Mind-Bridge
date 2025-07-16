import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:file_picker/file_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool isUploading = false;
  String? selectedType;
  File? selectedFile;
  String? uploadedLink;

  final linkController = TextEditingController();

  Future<void> pickFile(String type) async {
    FilePickerResult? result;
    if (type == 'pdf') {
      result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf']);
    } else if (type == 'image') {
      result = await FilePicker.platform.pickFiles(type: FileType.image);
    }

    if (result != null && result.files.single.path != null) {
      setState(() {
        selectedFile = File(result!.files.single.path!);
        uploadedLink = null;
      });
    }
  }

  Future<void> upload() async {
    if ((selectedType == 'link' && linkController.text.trim().isEmpty) ||
        (selectedType != 'link' && selectedFile == null)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a file or enter a link.')));
      return;
    }

    setState(() => isUploading = true);
    final user = FirebaseAuth.instance.currentUser!;
    String downloadUrl = '';

    try {
      if (selectedType == 'link') {
        downloadUrl = linkController.text.trim();
      } else {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${selectedFile!.path.split('/').last}';
        final ref = FirebaseStorage.instance.ref().child('uploads/$fileName');
        await ref.putFile(selectedFile!);
        downloadUrl = await ref.getDownloadURL();
      }

      await FirebaseFirestore.instance.collection('uploads').add({
        'uid': user.uid,
        'type': selectedType,
        'url': downloadUrl,
        'timestamp': FieldValue.serverTimestamp(),
      });

      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload successful!')));
      setState(() {
        selectedFile = null;
        linkController.clear();
        selectedType = null;
        uploadedLink = null;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    }

    setState(() => isUploading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Study Material')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: selectedType,
              items: const [
                DropdownMenuItem(value: 'pdf', child: Text('PDF')),
                DropdownMenuItem(value: 'image', child: Text('Image')),
                DropdownMenuItem(value: 'link', child: Text('Link')),
              ],
              hint: const Text('Select upload type'),
              onChanged: (val) {
                setState(() {
                  selectedType = val;
                  selectedFile = null;
                  linkController.clear();
                });
              },
            ),
            const SizedBox(height: 16),
            if (selectedType == 'link')
              TextField(
                controller: linkController,
                decoration: const InputDecoration(labelText: 'Paste your link', border: OutlineInputBorder()),
              )
            else if (selectedType != null)
              ElevatedButton(
                onPressed: isUploading ? null : () => pickFile(selectedType!),
                child: Text(selectedFile == null ? 'Pick File' : 'File Selected ✅'),
              ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.upload),
              label: Text(isUploading ? 'Uploading...' : 'Upload'),
              onPressed: isUploading ? null : upload,
            ),
          ],
        ),
      ),
    );
  }
}

# Frontend-Backend Connection Guide

*This document explains exactly how the Flutter Frontend connects to the Appwrite Backend.*

## 1. The Core Dependency
The connection is made possible by the `appwrite: ^12.0.4` package defined in `mindbridge/pubspec.yaml`. This is the official SDK that translates Dart code into HTTP REST/GraphQL calls that the Appwrite server understands.

## 2. Initialization: Making the Connection
Before the app can do anything, it must tell the SDK *where* the backend lives. This happens in `mindbridge/lib/services/appwrite_service.dart`.

```dart
// Conceptual code representation
import 'package:appwrite/appwrite.dart';

class AppwriteService {
  Client client = Client();
  late Databases databases;
  late Storage storage;

  void init() {
    client
      .setEndpoint('https://cloud.appwrite.io/v1') // The Backend URL
      .setProject('mindbridge_project_id');        // The specific Project ID
      
    databases = Databases(client);
    storage = Storage(client);
  }
}
```
**What happens here?** The `Client` object stores the base URL and Project ID. Every subsequent request (Database, Auth, Storage) uses this `Client` to know where to send the HTTP packets over the network.

## 3. How Data Flows Over the Network: Fetching Notes
Assume the user opens the "Notes" screen. They want to see a list of PDFs.

**Step A: The UI Request**
The UI calls a function in the state manager (Provider), which in turn calls the service:
```dart
final response = await appwriteService.databases.listDocuments(
  databaseId: 'main_db',
  collectionId: 'notes_collection',
);
```

**Step B: The Network Translation**
The `appwrite` SDK takes that Dart method and constructs an HTTP GET request.
- **URL:** `GET https://cloud.appwrite.io/v1/databases/main_db/collections/notes_collection/documents`
- **Headers:** It attaches the `X-Appwrite-Project: mindbridge_project_id` header. If the user is logged in, it also attaches a Session Cookie header for authentication.

**Step C: The Backend Processing**
1. The Appwrite server receives the HTTP request.
2. It checks the headers: "Is this a valid project? Is this user authorized?"
3. If yes, it queries its internal MariaDB database for documents in the `notes_collection`.
4. It formats the results into a JSON string.

**Step D: The Return Trip**
The Appwrite server sends an HTTP 200 OK response with the JSON body back over the network to the mobile phone.

**Step E: Dart Parsing**
The `appwrite` SDK receives the JSON string. The Flutter app then parses this JSON back into Dart objects.
```dart
// Conceptual Parsing
List<Note> fetchedNotes = response.documents.map((doc) => Note.fromJson(doc.data)).toList();
```
The Provider updates its state with `fetchedNotes`, and the UI renders the list on the screen.

## 4. The Data Flow for Files (Uploading a PDF)
When a user uploads a PDF, the flow is slightly different.

1. **Local File:** The UI gets a file path from the OS (e.g., `/storage/emulated/0/Download/math.pdf`).
2. **Multipart Request:** The Dart SDK uses `Storage(client).createFile(...)`. It creates a "Multipart Form Data" HTTP request. This doesn't send JSON; it sends the actual binary 1s and 0s of the PDF file in chunks over the network.
3. **Backend Storage:** Appwrite receives the binary data, saves it to its storage bucket, and generates a unique `fileId` (e.g., `file_65a4b3...`).
4. **Database Link:** Appwrite sends the `fileId` back to the app. The app then makes a *second* request (a JSON POST request to the Database) saying: "Create a new Note document, title 'Math', and link it to `file_65a4b3...`".

By separating the heavy binary file (Storage) from the lightweight metadata (Database), the app remains fast and responsive.
# Database & Data Flow

## 1. Database Structure
MindBridge uses Appwrite's database, which is a NoSQL-like document store built on top of MariaDB. The database is organized into Databases, Collections, and Documents.

## 2. Collections (Inferred Schema)
Based on the application features, the primary collections are:

- **Users Collection (Managed internally by Appwrite Auth)**
  - `userId` (String)
  - `email` (String)
  - `name` (String)
  - `preferences` (JSON)

- **Notes Collection**
  - `noteId` (String, Primary Key)
  - `title` (String)
  - `authorId` (String, Foreign Key -> Users)
  - `fileId` (String, Foreign Key -> Storage Bucket)
  - `tags` (Array of Strings)
  - `groupId` (String, Optional)
  - `createdAt` (Datetime)

- **Groups Collection**
  - `groupId` (String, Primary Key)
  - `name` (String)
  - `members` (Array of User IDs)
  - `createdAt` (Datetime)

- **Opportunities Collection (Career Feed)**
  - `jobId` (String, Primary Key)
  - `title` (String)
  - `company` (String)
  - `description` (String)
  - `url` (String)
  - `postedAt` (Datetime)

## 3. Relationships
- **One-to-Many:** A User can author many Notes.
- **Many-to-Many:** A User can belong to many Groups, and a Group has many Users. Appwrite handles this typically by storing arrays of IDs within the documents.
- **Storage Linkage:** Documents in the `Notes` collection store a `fileId` reference. To view a note, the app reads the `fileId` from the document and uses the Appwrite Storage API to fetch the actual file.

## 4. Data Lifecycle
1. **Creation:** Data originates from the user via the Flutter app UI.
2. **Persistence:** Written to Appwrite Collections via the Dart SDK.
3. **Distribution:** Broadcasted to other users querying those collections (e.g., viewing a group feed).
4. **Deletion:** Users can delete their notes, which triggers API calls to delete both the document in the DB and the file in Storage.

## 5. CRUD Flow Example: Uploading a Note
- **Create (Upload):** User selects a PDF. `appwrite_service` uploads to Storage -> gets `fileId` -> creates Document in `Notes` collection with metadata + `fileId`.
- **Read (Fetch):** App fetches list of documents from `Notes` collection. Uses `fileId` to generate a preview/download URL from Storage.
- **Update (Edit):** User changes the note title. App calls `databases.updateDocument()` to modify the title field.
- **Delete (Remove):** App calls `storage.deleteFile()` and `databases.deleteDocument()`.

## 6. Query Behavior
Appwrite provides powerful querying capabilities. The app queries the database to filter data:
- `Query.equal('groupId', currentGroup.id)` to fetch notes only for a specific study group.
- `Query.orderDesc('createdAt')` to show the most recent career opportunities first.
- `Query.search('title', 'midterm')` to implement a search feature for notes.

## 7. Storage Logic
Files (PDFs, Images) are not stored directly in the database. They are stored in Appwrite Storage Buckets. The database only holds references to these files. This separation ensures fast database queries and optimized file delivery.
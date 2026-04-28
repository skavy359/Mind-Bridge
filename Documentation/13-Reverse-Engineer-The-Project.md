# Reverse Engineer the Project

## 1. How the Project was Built
Based on the file structure and configuration, the project was built using a hybrid approach combining modern web and mobile development frameworks:

-   **Phase 1: Backend Setup:** An Appwrite project was created. Collections for Notes, Groups, and Opportunities were likely defined in the Appwrite console. Storage buckets were configured for PDF/Image uploads.
-   **Phase 2: Mobile Core (`/mindbridge`):** A standard Flutter project was initialized (`flutter create`). The `appwrite`, `provider`, and various utility packages (like `file_picker`) were added to `pubspec.yaml`. The logic was heavily decoupled into `services/` (talking to Appwrite) and `providers/` (managing state).
-   **Phase 3: Web Landing Page (`/frontend`):** A Vite + React application was scaffolded (`npm create vite@latest`). The focus was entirely on visual flair, leveraging pure HTML5 Canvas for the particle system rather than heavy 3D libraries like Three.js, ensuring faster load times for a marketing page.

## 2. Why Certain Design Decisions Exist
-   **Why Appwrite?** Using a BaaS like Appwrite allows a small team or single developer to avoid writing boilerplate CRUD APIs and managing databases/servers, allowing them to focus entirely on the frontend user experience. It provides auth, DB, and storage out of the box.
-   **Why two distinct codebases (React & Flutter)?**
    -   *Flutter* is excellent for complex, state-heavy, native-feeling mobile applications, but Flutter Web can sometimes feel heavy and have SEO/initial load time drawbacks.
    -   *React + Vite* was chosen for the landing page to guarantee extremely fast load times, perfect SEO, and access to the vast React ecosystem for complex DOM/Canvas animations that might be difficult to achieve purely in Flutter Web.
-   **Why Canvas for Particles instead of CSS/SVG?** Moving 80+ particles with repelling physics using CSS or SVGs would cause massive DOM repaints and drop the frame rate significantly. Canvas renders on a single DOM element, utilizing hardware acceleration much more efficiently for this specific effect.

## 3. Hidden Relationships
-   **The `appwrite_service.dart` Singleton:** While not explicitly enforced as a strict singleton in the architecture diagram, the `AppwriteService` acts as the single source of truth for the connection instance to the backend. If multiple instances were created, it could lead to redundant connection pooling or authentication state desyncs.
-   **Foreign Keys in NoSQL:** Even though Appwrite is a document database, the `Notes` collection maintains a hidden relational mapping to the `Users` collection (via `authorId`) and the `Storage` buckets (via `fileId`). The Flutter app is responsible for resolving these "joins" by making secondary API calls when necessary.

## 4. Execution Dependencies
-   **Mobile App -> Appwrite Endpoint:** If the Appwrite server goes down, the Flutter app's core functionality ceases. It relies on the endpoint defined in `AppwriteService.init()`.
-   **Web App -> `lucide-react`:** The web app relies heavily on this icon library for visual cues.

## 5. Internal Mechanics: The Provider Architecture
The mobile app's internal engine is driven by `Provider`.
When a user uploads a note:
1.  The UI calls a method on `NotesProvider`.
2.  `NotesProvider` sets `_isLoading = true` and calls `notifyListeners()` (UI shows a spinner).
3.  `NotesProvider` awaits `AppwriteService.upload()`.
4.  Once returned, it adds the new Note object to its internal `List<Note>`, sets `_isLoading = false`, and calls `notifyListeners()` again.
5.  The UI spinner disappears, and the `ListView` updates to show the new note.
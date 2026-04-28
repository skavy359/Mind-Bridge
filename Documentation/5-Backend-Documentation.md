# Backend Documentation

## 1. API Architecture
MindBridge utilizes **Appwrite**, a Backend-as-a-Service (BaaS) platform, abstracting away traditional custom server infrastructure (like Node.js/Express or Python/Django). The architecture is Serverless from the client's perspective. The Flutter app communicates directly with Appwrite's REST and GraphQL endpoints via the official `appwrite` Dart SDK.

## 2. Business Logic Flow
Instead of residing on a custom server, business logic is handled in two places:
- **Client-Side Logic:** The Flutter app (`mindbridge/lib/services/`) validates data, manages state, and structures requests.
- **Backend Rules:** Appwrite handles complex logic internally based on configured rules, such as Database permissions (Document Level Security), Storage file validation, and Authentication flows.

## 3. Database Interaction
Database interaction is managed via `appwrite_service.dart`.
- The service initializes an `Account`, `Databases`, and `Storage` client.
- To fetch data (e.g., Notes), the client calls `databases.listDocuments()`.
- To write data, the client calls `databases.createDocument()`.
- Appwrite handles the SQL/NoSQL abstractions, providing the client with a unified JSON document structure.

## 4. Authentication System
Authentication is fully managed by Appwrite and accessed via `auth_service.dart`.
- **Supported Methods:** Email/Password and OAuth2 (Google Sign-In).
- **Session Management:** When a user logs in, Appwrite issues a secure session token. The Flutter SDK stores this token securely and attaches it to subsequent requests automatically.
- **Flow:** User enters credentials -> App calls `account.createEmailSession()` -> Appwrite validates -> Returns Session -> `AuthWrapper` updates UI to Home Screen.

## 5. Services and Controllers
The `mindbridge/lib/services/` directory acts as the controller layer interfacing with the backend.
- `AuthService`: Methods for `login`, `register`, `logout`, `getUser()`.
- `AppwriteService`: Methods for `uploadNote()`, `fetchOpportunities()`, `joinGroup()`.

## 6. Models/Entities
While not explicitly defined in the provided directory structure, standard Dart models (e.g., `Note`, `User`, `Opportunity`) are used to serialize/deserialize the JSON responses from Appwrite into strongly typed Dart objects for safe usage within the UI.

## 7. Middleware
Middleware concepts in a BaaS architecture are handled via:
- **Appwrite Functions:** (If deployed) Serverless functions triggered by database events (e.g., automatically generating an AI summary when a note is uploaded).
- **Client Interceptors:** The Dio HTTP client (if used alongside the Appwrite SDK) can intercept requests to inject headers or handle global error logging.

## 8. Request-Response Lifecycle
1. User action triggers a method in a Flutter Provider.
2. Provider calls the corresponding Service method.
3. Service formats the request using the Appwrite SDK.
4. SDK makes a secure HTTPS request to the Appwrite Cloud/Self-hosted instance.
5. Appwrite processes the request, checks permissions, and interacts with its internal MariaDB/Redis instances.
6. Appwrite returns a JSON response.
7. Service parses the JSON into a Dart model.
8. Provider updates its state with the new model and calls `notifyListeners()`.
9. UI rebuilds to reflect the change.

## 9. Security Flow
- **Data in Transit:** All connections to Appwrite are secured via TLS/SSL.
- **Data at Rest:** Appwrite encrypts sensitive data (passwords) and files in storage.
- **Access Control:** Role-Based Access Control (RBAC) and Document-Level Security (DLS) configured in the Appwrite Console ensure users can only read/write documents they own or have been granted access to.
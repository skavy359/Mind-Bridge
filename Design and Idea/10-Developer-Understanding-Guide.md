# Developer Understanding Guide

## 1. How This Project Works Internally
MindBridge is essentially two distinct projects sharing the same name and backend infrastructure:
1.  **The Marketing Face (`/frontend/`):** A React app that exists purely to sell the vision, show off the features via a cinematic scrolling experience, and direct users to download the app.
2.  **The Actual Product (`/mindbridge/`):** A cross-platform Flutter application where all the functional user interaction (notes, groups, chat) happens.

Both rely heavily on **Appwrite**, which serves as the "invisible" backend, handling all database storage, file hosting, and user logins.

## 2. Where to Add New Features

### Adding a new Web Page/Section
-   Navigate to `frontend/src/App.jsx`.
-   Create a new React component (e.g., `const PricingSection = () => {...}`).
-   Add it within the `<main>` tag, wrapped in a `<ScrollReveal>` component to ensure it animates in correctly as the user scrolls.

### Adding a new Mobile Screen
1.  **UI:** Create a new file in `mindbridge/lib/screens/` (e.g., `calendar_screen.dart`).
2.  **Logic:** If it needs to fetch new types of data, add methods to `mindbridge/lib/services/appwrite_service.dart` (e.g., `fetchEvents()`).
3.  **State:** If the data needs to be shared across screens, create/update a provider in `mindbridge/lib/providers/`.
4.  **Navigation:** Add a route or a new tab in your main Home Scaffold to access the screen.

## 3. How Modules Connect
In the Flutter app, data flows from the **Bottom Up**:
-   **Services (`appwrite_service.dart`)** talk to the Internet (Appwrite). They know *how* to get data.
-   **Providers** talk to Services. They hold the data in memory and tell the UI when the data changes (`notifyListeners()`).
-   **Screens/Widgets** talk to Providers (via `context.watch()` or `Consumer`). They build the UI based on the data.

## 4. How to Debug It
-   **Web:** Run `npm run dev` in the `frontend` folder. Use Chrome DevTools. The complex canvas animations might cause performance drops; use the React Profiler to check for unnecessary re-renders.
-   **Mobile:** Run `flutter run` in the `mindbridge` folder. Use the Flutter DevTools.
    -   *Auth Issues?* Check if the Appwrite Endpoint and Project ID in `appwrite_service.dart` match your Appwrite Console.
    -   *UI not updating?* Ensure you are calling `notifyListeners()` in your Provider after fetching data.

## 5. Critical Files to Understand First
1.  **`frontend/src/App.jsx`:** Understand the `<ParticleCanvas>` and `<ScrollReveal>` mechanics, as they define the entire web experience.
2.  **`mindbridge/pubspec.yaml`:** Know your dependencies (Appwrite SDK, Provider).
3.  **`mindbridge/lib/main.dart`:** Look at how Providers are initialized at the root.
4.  **`mindbridge/lib/services/appwrite_service.dart`:** This is the heart of the app's functionality. Understand how it connects to the database.
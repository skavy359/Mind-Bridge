# Folder & File Structure Documentation

## 1. Entire Folder Hierarchy
```text
Mind-Bridge/
├── README.md
├── LICENSE
├── frontend/ (React Web Application)
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── RootComponent.jsx
│       ├── Splash.jsx
│       └── hooks/
└── mindbridge/ (Flutter Mobile Application)
    ├── pubspec.yaml
    ├── pubspec.lock
    ├── analysis_options.yaml
    ├── android/
    ├── ios/
    ├── lib/
    │   ├── main.dart
    │   ├── providers/
    │   │   └── theme_provider.dart
    │   ├── services/
    │   │   ├── auth_service.dart
    │   │   └── appwrite_service.dart
    │   ├── screens/
    │   │   ├── auth/
    │   │   ├── home/
    │   │   ├── notes/
    │   │   ├── opportunities/
    │   │   ├── profile/
    │   │   ├── auth_wrapper.dart
    │   │   └── splash_screen.dart
    │   └── widgets/
    └── test/
```

## 2. Purpose of Every Important Folder
- `frontend/`: Contains the entire React + Vite web landing page.
- `frontend/src/`: Source code for the web application, including components, styles, and hooks.
- `mindbridge/`: Contains the Flutter mobile application for Android and iOS.
- `mindbridge/lib/`: The core Dart source code for the mobile app.
- `mindbridge/lib/providers/`: State management classes (Provider pattern).
- `mindbridge/lib/services/`: API and BaaS interaction logic (Appwrite, Auth).
- `mindbridge/lib/screens/`: UI Views and pages, organized by feature.
- `mindbridge/lib/widgets/`: Reusable UI components for the mobile app.

## 3. Purpose of Every Important File
- `README.md`: Central documentation detailing the project's features, tech stack, and setup.
- `frontend/package.json`: Defines React dependencies (lucide-react), build scripts, and metadata.
- `frontend/src/App.jsx`: The main React component containing the cinematic landing page logic, particle canvas, and scroll reveals.
- `frontend/src/index.css`: Global vanilla CSS for the web app, defining themes, glassmorphism utilities, and animations.
- `mindbridge/pubspec.yaml`: Flutter configuration file defining dependencies (appwrite, provider, google_fonts), assets, and SDK versions.
- `mindbridge/lib/main.dart`: The entry point for the Flutter application, initializing providers and the root widget.
- `mindbridge/lib/services/appwrite_service.dart`: Encapsulates the Appwrite SDK initialization and core database/storage logic.
- `mindbridge/lib/services/auth_service.dart`: Handles login, registration, Google Sign-In, and session management.

## 4. Module Mapping
- **Authentication Module:** `frontend/src/Splash.jsx` (Web Intro) -> `mindbridge/lib/screens/auth/` (Mobile UI) -> `mindbridge/lib/services/auth_service.dart` (Logic).
- **Core App Logic:** `mindbridge/lib/screens/home/` acts as the hub, connecting to `notes/` and `opportunities/`.
- **State Module:** `mindbridge/lib/providers/` manages the global state and injects it into the UI tree via `main.dart`.
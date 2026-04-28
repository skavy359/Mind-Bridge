# Wireframes & UI Design

## 1. UI Layout Strategy
MindBridge employs two distinct layout strategies based on the platform:
- **Web (React):** A single-column, long-scroll cinematic landing page. Focuses on full viewport height (`100vh`) sections, massive typography, and deep background layers (particles, stickmen).
- **Mobile (Flutter):** Standard mobile application architecture. Utilizes Bottom Navigation Bars, Scaffolds, AppBars, and ListViews to organize complex functional data into digestible screens.

## 2. Navigation Flow Diagrams (Mobile)
```text
[ Splash Screen ]
       |
       v
[ Auth Wrapper ] ----(Not Logged In)---> [ Login / Signup Screen ]
       |                                           |
  (Logged In)                                 (Success)
       |                                           |
       +-------------------------------------------+
       |
       v
[ Main Navigation Scaffold ]
       |-- Tab 1: [ Home Dashboard ] -> [ Recent Notes / Quick Actions ]
       |-- Tab 2: [ Notes / Vault ] -> [ List of PDFs ] -> (Click) -> [ PDF Viewer ]
       |-- Tab 3: [ Groups ] -> [ Group Chat / Shared Notes ]
       |-- Tab 4: [ Career Feed ] -> [ List of Opportunities ] -> (Click) -> [ Web View ]
       |-- Tab 5: [ Profile ] -> [ Settings / Logout ]
```

## 3. High-Level Wireframes (Conceptual)

### Web Landing Page
```text
+--------------------------------------------------+
| [Logo]                               [Get App]   |
+--------------------------------------------------+
|                                                  |
|              [ Student SVG Art ]                 |
|                                                  |
|         Your Study Notes, Connected.             |
|       (Animated Typewriter Subtitle)             |
|                                                  |
|               [ Download Button ]                |
|                                                  |
+--------------------------------------------------+
|              [ Scroll Progress Bar ]             |
+--------------------------------------------------+
|    [ 100+ Users ]    [ 500+ Notes ]    etc...    |
+--------------------------------------------------+
|    [ Glow Card ] [ Glow Card ] [ Glow Card ]     |
|      (Notes)       (Groups)      (Sync)          |
+--------------------------------------------------+
```

### Mobile: Home Screen
```text
+---------------------------------------+
|  [User Avatar]    Hi, John!     [🔔] |
+---------------------------------------+
|  [ Search your notes...            🔍] |
+---------------------------------------+
|  Quick Actions                        |
|  [ Upload Note ]  [ Create Group ]    |
+---------------------------------------+
|  Recent Notes                         |
|  +---------------------------------+  |
|  | [PDF Icon] Physics Chapter 4    |  |
|  |  Added 2 hrs ago                |  |
|  +---------------------------------+  |
|  +---------------------------------+  |
|  | [IMG Icon] Math Homework        |  |
|  |  Added yesterday                |  |
|  +---------------------------------+  |
+---------------------------------------+
| [Home]  [Notes]  [Groups]  [Profile]  |
+---------------------------------------+
```

## 4. User Interaction Diagrams
- **Upload Flow:** `FAB Click` -> `File Picker OS Dialog` -> `Select File` -> `Show Upload Progress Indicator` -> `Refresh Note List on Success`.
- **Theme Toggle:** `Profile Screen` -> `Switch Clicked` -> `ThemeProvider updates state` -> `Entire App UI Rebuilds with new colors`.

## 5. Design Philosophy
- **Web:** Cinematic, immersive, and "God-tier" aesthetics. Designed to wow the user immediately.
- **Mobile:** Functional, clean, and distraction-free. Prioritizes quick access to information, readability of documents, and fast navigation.

## 6. Component Positioning Concepts
- **Floating Action Buttons (FAB):** Positioned at the bottom right on mobile for primary actions (Upload).
- **Cards:** Used extensively to encapsulate distinct items (a Note, a Job Posting) to provide clear visual boundaries.
- **Glassmorphism:** Applied primarily on the Web to create a sense of depth, separating the foreground text/UI from the busy particle background.
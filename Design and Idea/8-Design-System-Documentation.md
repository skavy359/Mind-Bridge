# Design System Documentation

## 1. UI Principles
MindBridge adheres to three core design principles:
1.  **Immersion (Web):** The web experience must feel alive. Elements should react to user input (mouse tracking, scroll reveals) to keep the user engaged.
2.  **Clarity (Mobile):** The mobile app must prioritize readability. Academic materials are complex; the UI should not get in the way.
3.  **Modern Aesthetics:** Heavy reliance on modern trends like dark modes, vibrant neon accents, and glassmorphism.

## 2. Color Palette
The primary theme is built around a dark mode foundation with high-contrast, vibrant accents.

-   **Primary Brand:** `#00FF9D` (Neon Spring Green) - Used for primary buttons, active states, glowing elements, and key illustrations.
-   **Accent:** `#1A7FC4` to `#38B8F8` (Cyan/Blue Gradient) - Used for secondary highlights and deep background auras.
-   **Background (Dark):** `#000C1A` to `#00050F` (Deep Navy/Black) - The vast empty space that allows the neon colors to pop.
-   **Text (Primary):** `#FFFFFF` (White)
-   **Text (Secondary/Muted):** `rgba(255, 255, 255, 0.35)` - Used for subtitles and non-critical information.

## 3. Typography System
MindBridge utilizes a dual-font strategy:
-   **Primary Font (Sans-Serif):** Often Inter, Roboto, or system defaults. Used for massive headings and body text for optimal readability.
-   **Secondary Font (Monospace):** `var(--font-mono)` (e.g., Fira Code, JetBrains Mono). Used for subheadings, labels, and technical-feeling accents (e.g., "FOR STUDENTS, BY STUDENTS").

## 4. Layout Spacing
-   **Web:** Uses massive, sweeping padding (`120px` between sections, `60px` gaps in grids) to create a sense of grandeur and cinematic scale.
-   **Mobile:** Tighter, standard Material Design spacing. `16px` padding around screens, `8px` between list items.

## 5. Component Consistency
-   **Glow Effects:** Critical interactive elements (like the `GlowCard`) use a specific mouse-tracking radial gradient to create an "inner glow" that follows the cursor.
-   **Border Radii:** Soft, rounded corners are used everywhere. `14px` for buttons, up to `50px` for large container cards. Hard edges are avoided.

## 6. Theme Explanation
The web app is heavily leaning into a **"Cyber-Academic" Dark Theme**. It uses:
-   `noise-overlay`: A subtle grain effect applied globally to prevent banding in gradients and give a physical texture.
-   `aura-blob`: Massive, highly blurred (`filter: blur(100px)`) background divs that create subtle, moving color fields behind the UI.

The Mobile app supports **Adaptive Themes** (Light and Dark mode), governed by the `ThemeProvider`, allowing users to choose their preferred reading environment.

## 7. Animation Guidelines
-   **Micro-interactions:** Buttons scale down slightly on click/press.
-   **Continuous (Ambient):** Particles slowly drift; stickmen gently float (`heroFloat 5s ease-in-out infinite`).
-   **Entrance:** Elements should never simply appear. They must fade in and slide up (`translateY(60px)` to `0`) using cubic-bezier timing functions for smooth deceleration.
# Frontend Documentation

*Note: This documentation covers the Web Frontend (`frontend` directory). For the Mobile Frontend, see the Developer Understanding Guide and Technical Deep Dive.*

## 1. UI Architecture
The web frontend is a Single Page Application (SPA) built with React 19 and Vite. It utilizes a highly componentized architecture within `App.jsx`, prioritizing visual fidelity and smooth scrolling experiences over complex routing. It is essentially a dynamic, cinematic landing page.

## 2. Pages/Screens/Components
- `App` (Main Container): Orchestrates the entire landing page.
- `ParticleCanvas`: A low-level HTML5 Canvas component that renders an interactive, physics-based particle system acting as the background.
- `ScrollReveal`: A wrapper component utilizing `IntersectionObserver` to trigger CSS animations when elements enter the viewport.
- `TypeWriter`: An animated text component that reveals text character by character.
- `AnimatedCounter`: A numbers counter that animates from 0 to a target value using easing functions.
- `StudentIllustration` & `GodStickman`: SVG-based generative art components providing thematic visuals.
- `GlowingStickmen`: A collection of animated stick figures floating in the background.
- `GlowCard`: A glassmorphic card component with a mouse-tracking dynamic radial glow effect.
- `Carousel`: A custom-built image slider for showcasing app screenshots.
- `MagneticButton`: An interactive button that slightly tracks the user's cursor for a physical feel.

## 3. State Management
State management is handled locally using React Hooks:
- `useState`: For tracking scroll progress, component visibility, carousel slides, and mouse positions.
- `useRef`: Critical for accessing DOM nodes directly (Canvas, IntersectionObservers) and storing mutable variables that shouldn't trigger re-renders (animation frames, particle arrays).
- `useEffect`: Manages side effects such as setting up event listeners (scroll, resize, mousemove), initializing canvas rendering loops, and handling IntersectionObservers.

## 4. Routing/Navigation
As a focused landing page, there is no complex client-side routing (no React Router). Navigation is primarily vertical scrolling, enhanced by smooth scroll behaviors and a fixed scroll progress bar at the top of the screen. Links directly point to external resources (e.g., APK download).

## 5. Styling System
The styling system relies on **Vanilla CSS** (`index.css` and inline styles in React).
- **CSS Variables:** Extensive use of CSS custom properties (e.g., `--primary`, `--bg-dark`) for theming and consistency.
- **Glassmorphism:** Heavy use of `backdrop-filter: blur()`, semi-transparent backgrounds, and inner shadows to create depth.
- **Animations:** Keyframe animations (`@keyframes`) are heavily utilized for floating elements, glowing pulses, and SVG manipulations.

## 6. User Interaction Flow
1. User lands on the page and is greeted by the `ParticleCanvas` and `StudentIllustration`.
2. As the user moves the mouse, the particles react to the cursor, creating immediate engagement.
3. User scrolls down; the `ScrollProgress` bar updates.
4. `ScrollReveal` components detect intersection and animate text and feature cards into view.
5. User interacts with `GlowCard`s, triggering the dynamic mouse-tracking glow.
6. User clicks the `MagneticButton` to download the app, experiencing the physics-based pull.

## 7. Frontend Lifecycle
1. `main.jsx` mounts the application to the DOM.
2. `App` component renders, initializing all child hooks.
3. `ParticleCanvas` sets up its `requestAnimationFrame` loop.
4. Event listeners are bound to the `window`.
5. Upon unmount (rare in this SPA), cleanup functions in `useEffect` clear animation frames and remove event listeners to prevent memory leaks.
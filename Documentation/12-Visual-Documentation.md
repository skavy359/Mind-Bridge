# Visual Documentation

*Note: This document provides conceptual visual aids to understand the application flow. Since markdown cannot execute interactive code, these serve as textual representations of the visual logic.*

## 1. Sequence Diagram: Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant App as Flutter App
    participant Auth as AuthService
    participant AW as Appwrite Cloud

    User->>App: Opens App
    App->>Auth: Check Session Status
    Auth->>AW: Get Current Account
    
    alt Active Session Exists
        AW-->>Auth: Returns Account Info
        Auth-->>App: State = Logged In
        App->>User: Route to Home Screen
    else No Session
        AW-->>Auth: Returns Error (401)
        Auth-->>App: State = Logged Out
        App->>User: Route to Login Screen
        
        User->>App: Enters Email & Password
        App->>Auth: login(email, pass)
        Auth->>AW: POST /account/sessions/email
        AW-->>Auth: Returns Session Token
        Auth-->>App: State = Logged In
        App->>User: Route to Home Screen
    end
```

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ NOTE : authors
    USER ||--o{ GROUP_MEMBER : joins
    GROUP ||--o{ GROUP_MEMBER : contains
    NOTE ||--o| STORAGE_FILE : references
    
    USER {
        string userId PK
        string email
        string name
    }
    
    NOTE {
        string noteId PK
        string title
        string authorId FK
        string fileId FK
        string groupId FK "Nullable"
    }
    
    GROUP {
        string groupId PK
        string groupName
    }
    
    STORAGE_FILE {
        string fileId PK
        string bucketId
        int size
        string mimeType
    }
```

## 3. Web Animation Architecture

```mermaid
graph TD
    A[Window Scroll Event] -->|Updates| B(Scroll Progress State)
    A -->|Triggers| C{Intersection Observer}
    
    B -->|Changes CSS Width| D[Top Progress Bar UI]
    
    C -->|If Element in View| E[Set isVisible = true]
    E -->|Triggers CSS Class| F[Apply Transform/Opacity]
    F -->|Result| G[Element Slides/Fades Up]
    
    H[Mouse Move Event] -->|Updates| I(Mouse Coordinates Ref)
    I -->|Read by RequestAnimationFrame| J[Canvas Render Loop]
    J -->|Calculates Distance| K[Apply Repulsive Force to Particles]
    K -->|Result| L[Particles Scatter from Cursor]
```
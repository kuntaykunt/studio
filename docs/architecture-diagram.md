```mermaid
graph TD
    subgraph "User Interaction Layer"
        A[User (Browser)]
    end

    subgraph "Presentation Layer (Next.js App - Firebase App Hosting)"
        B[Next.js App <br> (Pages, React Components, <br> ShadCN UI, Tailwind)]
        C[Next.js Server Actions <br> (API Layer)]
    end

    subgraph "AI Processing Layer (Genkit - Server-Side)"
        D[Genkit AI Flows Executor]
        D1[Child-Safe Story Flow]
        D2[Dialogue Transformation Flow]
        D3[Image Generation Flow]
        D4[Voice Generation Flow (TTS)]
        D5[Animation Generation Flow <br> (Placeholder)]
    end

    subgraph "External AI Services (Google AI)"
        E1[Google AI (Gemini - Text Models)]
        E2[Google AI (Gemini - Image Models)]
        E3[Google AI (Gemini - TTS Models)]
    end

    subgraph "Data & Authentication Layer (Firebase)"
        F[Firebase Authentication]
        G[Firebase Firestore <br> (Storybook Data)]
    end

    %% Interactions
    A -- Interacts with --> B;

    B -- UI Events, Form Submissions --> C;
    B -- Data Fetching for Views --> G;
    B -- Auth UI (Login/Signup Forms) --> F;

    C -- Calls AI Functionality --> D;
    C -- CRUD Operations --> G;

    D --> D1;
    D --> D2;
    D --> D3;
    D --> D4;
    D --> D5;

    D1 -- Uses --> E1;
    D2 -- Uses --> E1;
    D3 -- Uses --> E2;
    D4 -- Uses --> E3;
    D5 -.-> E2; %% Placeholder, might use image model

    %% Styling
    classDef user fill:#f9f,stroke:#333,stroke-width:2px;
    classDef nextjs fill:#5BC0EB,stroke:#333,stroke-width:2px,color:#000;
    classDef genkit fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff;
    classDef googleai fill:#4285F4,stroke:#333,stroke-width:2px,color:#fff;
    classDef firebase fill:#FFCA28,stroke:#333,stroke-width:2px,color:#000;

    class A user;
    class B,C nextjs;
    class D,D1,D2,D3,D4,D5 genkit;
    class E1,E2,E3 googleai;
    class F,G firebase;
```
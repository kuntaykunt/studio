# StoryTime Studio - Application Overview

Welcome to StoryTime Studio, an AI-powered application designed to help users create magical, personalized, and child-safe storybooks. This document provides an overview of the app's features, design principles, and the technologies used in its development.

## Core Features

The application currently implements the following core functionalities:

1.  **Landing Page:**
    *   Showcases the app's capabilities, featuring child-safe content generation and interactive storybook creation.
    *   Highlights key features like AI story rewriting, image generation, and video clip creation.
    *   Includes calls to action for users to start creating or sign up.

2.  **Account Management:**
    *   User authentication (Signup and Login) using Firebase Authentication (Email/Password).
    *   Allows users to manage their accounts for personalized story creation and access to their storybook library.

3.  **Storybook Library (`/storybooks`):**
    *   A dedicated page for authenticated users to browse, view, and manage their created storybooks.
    *   Displays a list of storybooks with their titles, cover images (first page image), target age, and creation date.
    *   Provides options to view a storybook in detail and delete storybooks (with confirmation).

4.  **Storybook Creation (`/storybooks/create`):**
    *   An interactive form for users to input:
        *   Story Title
        *   Original Story Prompt/Idea
        *   Child's Age (to tailor content)
        *   Voiceover Gender preference
        *   Optional Visual Style (selected from predefined options like "Classic Watercolor", "Whimsical Cartoon", etc.)
        *   Optional Learning Opportunity Tags (e.g., "Counting", "Gardening")
    *   A multi-step AI generation process:
        *   **Child-Safe Story Generation:** AI rewrites the initial prompt into child-friendly language, considering age and selected learning themes. The story is split into pages.
        *   **Image Generation:** AI generates relevant, style-guided images for each page of the story. The first image uses the selected visual style, and subsequent images use the previous image as context for consistency.
        *   **Voiceover Generation:** AI generates a voiceover for each page text, first transforming the text into a dialogue script.
        *   **Animation Generation (Placeholder):** A placeholder step for future animated video clip creation per page.
    *   Users can preview generated content (text, images, voiceovers, animation placeholders) during the creation process.
    *   Option to save the completed storybook to the user's library.

5.  **Storybook Viewing (`/storybooks/[id]`):**
    *   Displays a created storybook with all its details:
        *   Title, original prompt, child age, visual style description, selected learning themes.
        *   Full rewritten story text.
        *   Individual pages with their text, generated illustration, voiceover (with player and download button), and animation placeholder.
        *   Indicates if an AI-generated image was flagged as not matching the text.

## Style Guidelines

The application aims for a cheerful, friendly, and intuitive user experience:

*   **Primary Color:** Cheerful light blue (`#5BC0EB`, HSL: `199 78% 64%`)
*   **Background Color:** Very light blue (`#E1F5FE`, HSL: `199 93% 94%`), almost white, for a calm backdrop.
*   **Accent Color:** Sunny yellow (`#FDE74C`, HSL: `52 98% 64%`), used for calls to action and highlights.
*   **Font:** A friendly, rounded sans-serif font (Geist Sans) for readability.
*   **Icons:** Playful and intuitive icons from `lucide-react` are used throughout the interface.
*   **Layout:** Clean and intuitive with clear visual hierarchy, utilizing ShadCN UI components for a consistent and modern look and feel. Components feature rounded corners and subtle shadows.
*   **Responsiveness:** Designed to be responsive across various screen sizes.

## Technical Stack

The application is built using the following technologies:

*   **Frontend Framework:** Next.js (v15+) with React (v18+)
    *   Utilizes Next.js App Router and Server Components.
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (v3+)
*   **UI Components:** ShadCN UI (a collection of reusable UI components built with Radix UI and Tailwind CSS)
*   **State Management (Client-Side):** React Context API (for Auth), React Hook Form (for forms), `useState` / `useEffect` for component-level state.
*   **AI Integration:** Genkit (v1.x)
    *   `@genkit-ai/googleai` plugin for interacting with Google's Gemini models (including `gemini-2.0-flash-exp` for image generation and `gemini-2.5-flash-preview-tts` for voice).
    *   AI flows are defined in `src/ai/flows/` for modular GenAI functionality.
*   **Backend Services & Database:**
    *   Firebase Authentication for user login and signup.
    *   Firebase Firestore as the NoSQL database for storing storybook data.
*   **Deployment (Assumed):** Firebase App Hosting (configured via `apphosting.yaml`)
*   **Linting/Formatting:** ESLint and Prettier (implied by standard Next.js setups, though not explicitly configured in provided files beyond Next.js defaults).

## Architecture Diagram

The following diagram illustrates the high-level architecture of StoryTime Studio:

```mermaid
graph TD
    subgraph UserLayer
        A[User via Browser]
    end

    subgraph PresentationLayer_NextJS_FirebaseAppHosting
        B[Next.js App <br> (Pages, React Components, <br> ShadCN UI, Tailwind)]
        C[Next.js Server Actions <br> (API Layer)]
    end

    subgraph AI_Processing_Layer_Genkit_ServerSide
        D[Genkit AI Flows Executor]
        D1[ChildSafe Story Flow]
        D2[Dialogue Transformation Flow]
        D3[Image Generation Flow]
        D4[Voice Generation Flow TTS]
        D5[Animation Generation Flow <br> Placeholder]
    end

    subgraph External_AI_Services_GoogleAI
        E1[Google AI Gemini Text Models]
        E2[Google AI Gemini Image Models]
        E3[Google AI Gemini TTS Models]
    end

    subgraph Data_Authentication_Layer_Firebase
        F[Firebase Authentication]
        G[Firebase Firestore <br> Storybook Data]
    end

    %% Interactions
    A -- Interacts with --> B;

    B -- UI Events, Form Submissions --> C;
    B -- Data Fetching for Views --> G;
    B -- Auth UI Login/Signup Forms --> F;

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

## Development Setup

(This section would typically include instructions on how to run the project locally, manage dependencies, etc. For this "backward PRD," we'll assume a standard Next.js development environment.)

```
npm install
npm run dev
```

The Genkit development server can be run separately if needed for flow development:
```
npm run genkit:dev
```

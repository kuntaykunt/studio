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
mindmap
  root((StoryTime Studio Architecture))
    User Interaction Layer
      User (Browser)
    Presentation Layer (Next.js - Firebase App Hosting)
      Next.js App (UI Components)
        Pages & React Components
        ShadCN UI & Tailwind CSS
      Next.js Server Actions (API Layer)
    AI Processing Layer (Genkit - Server-Side)
      Genkit AI Flows Executor
        Child-Safe Story Flow
        Dialogue Transformation Flow
        Image Generation Flow
        Voice Generation Flow (TTS)
        Animation Generation Flow (Placeholder)
    External AI Services (Google AI)
      Google AI Models
        Gemini Text Models
        Gemini Image Models
        Gemini TTS Models
    Data & Authentication Layer (Firebase)
      Firebase Authentication
      Firebase Firestore (Storybook Data)
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

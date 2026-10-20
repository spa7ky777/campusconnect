# CampusConnect

CampusConnect is a student networking platform that helps students discover peers with shared interests, create a profile, and chat in real time.

## Features

- Email and password authentication with Firebase Authentication
- Student profiles with department, year, interests, and an optional photo
- Interest-based discovery that ranks students by shared interests
- Search and filtering by name, department, academic year, or interest
- One-to-one real-time chat powered by Cloud Firestore
- Responsive React interface styled with Tailwind CSS

## Tech stack

- React and TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Firebase project and register a web app. Enable Email/Password sign-in, Cloud Firestore, and Firebase Storage.

3. Copy the environment template and add the Firebase web configuration from the Firebase console:

   ```bash
   copy .env.example .env
   ```

4. Deploy the included `firestore.rules` and `storage.rules` to your Firebase project before testing with real users.

5. Start the development server:

   ```bash
   npm run dev
   ```

## Environment variables

The application reads Firebase settings from `.env`. Never commit this file. See `.env.example` for the required variables.

## Security notes

The included Firebase rules restrict profile updates to the profile owner, chat access to participants, message creation to chat participants, and profile-image uploads to the signed-in owner. Review and deploy these rules before exposing the app to users.

## Project structure

```text
src/
├── components/     # Authentication, profiles, discovery, chat, and layout
├── contexts/       # Authentication state
├── lib/            # Firebase initialization
└── types/          # Shared TypeScript models
```

## Resume-ready description

Built a student networking platform using React, TypeScript, and Firebase. Implemented authentication, profile creation with image uploads, interest-based student discovery, and real-time one-to-one messaging with Firestore.

## Future improvements

- Add message read receipts and last-message previews
- Add profile moderation and reporting workflows
- Add test coverage for Firebase interactions
- Add institutional email verification

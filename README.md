# Unlimited QR Generator
Free unlimited QR code generator

## Features
- URL, Text, WiFi, Contact QR codes
- Custom colors, logos, gradients
- Built-in QR scanner
- Arabic/RTL support
- PWA - installable on Android
- No signup required

## Deployment Guide

This project is fully ready for deployment on **AI Studio** or **Google Cloud Run** as a standard full-stack Node.js/TypeScript Express + Vite application. To prevent build failures or secrets scanning alerts caused by hardcoded API credentials, all Firebase settings have been externalized into environment variables.

### 1. Set Up Environment Variables

Provide the following environment variables in your deployment environment settings:

| Variable Name | Description | Example / Source |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key | `AIzaSyBI...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication Domain | `your-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | GCP/Firebase Project ID | `your-app-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage Bucket | `your-app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `954375973804` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App Identifier | `1:9543...:web:abcde` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Firestore Sub-database (optional) | `ai-studio-9f...` (or `(default)`) |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID (optional) | `G-Z5SBN2TJ5S` |

### 2. Standalone Local Development

To run the project locally with full database features:
1. Create a `.env` file in the project's root directory (this file is ignored by Git in `.gitignore`).
2. Populate the keys matching `.env.example` with your real Firebase parameters or copy the template.
3. Start the dev server:
   ```bash
   npm run dev
   ```

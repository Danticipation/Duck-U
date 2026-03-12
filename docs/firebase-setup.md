# Firebase setup for Duck U

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com).
2. **Enable Authentication:** Email/Password, Google, Apple (for iOS).
3. **Create Firestore Database** in production mode (we use `firestore.rules` for security).
4. **Enable Storage** for avatars and future assets.
5. **Register apps:**
   - Android: add app, download `google-services.json` → place in `duck-u/` (or `duck-u/android/` if using bare workflow).
   - iOS: add app, download `GoogleService-Info.plist` → place in `duck-u/` (Expo will pick it up via config plugin if configured).
6. **Environment variables:** Create `duck-u/.env` with:
   - `EXPO_PUBLIC_FIREBASE_API_KEY=`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID=`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=`
   - `EXPO_PUBLIC_FIREBASE_APP_ID=`
7. **Deploy Firestore rules:** `firebase deploy --only firestore:rules` (from project root where `firebase.json` exists).
8. **Cloud Functions:** From `functions/` run `npm install` and `firebase deploy --only functions`.

# Duck U Implementation Plan

> **For Claude:** Execute this plan task-by-task. Use exact schema and scoring rules from design doc.

**Goal:** Ship MVP of Duck U (Expo + Firebase): auth, profile, personal QR, scanner, scoring, leaderboard, streaks/revenge/chain, push, admin.

**Architecture:** Expo app (screens: Auth, Home, Scanner, Leaderboard, Profile, Admin); Firestore for users/duckEvents/leaderboards; Cloud Functions for scoring, weekly snapshot, push; Firebase Auth (email + Apple/Google).

**Tech Stack:** Expo (SDK 52), Firebase JS SDK v10+, expo-barcode-scanner, qrcode, Lottie, Expo AV, Firebase Admin in Functions.

---

## Phase 1: Project scaffold + Firebase

### Task 1.1: Create Expo app
- Run `npx create-expo-app@latest duck-u --template blank-typescript` in `c:\My Applications\Duck U`
- Add dependencies: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `firebase`, `expo-barcode-scanner`, `qrcode`, `lottie-react-native`, `expo-av`, `expo-notifications`, `expo-sharing`, `react-native-safe-area-context`, `react-native-screens`
- Set `app.json` name to "Duck U" and slug "duck-u"

### Task 1.2: Firebase project setup (docs only)
- Create `docs/firebase-setup.md` with: create project, enable Auth (Email, Google, Apple), create Firestore DB, enable Storage, register iOS/Android apps, add `google-services.json` / `GoogleService-Info.plist` to app (paths documented)

### Task 1.3: Firebase config in app
- Create `src/config/firebase.ts`: init Firebase (Auth, Firestore, Storage) from env/constants; export `auth`, `db`, `storage`
- Create `src/constants/env.ts`: `EXPO_PUBLIC_FIREBASE_*` keys (placeholder); add to `.env.example`

### Task 1.4: Firestore security rules (stub)
- Create `firestore.rules`: allow read/write users for authenticated; allow create duckEvents for authenticated; allow read leaderboards for authenticated; deny all else

### Task 1.5: Navigation shell
- Create `App.tsx`: wrap with SafeAreaProvider; NavigationContainer; bottom tabs: Home, Leaderboard, Profile; stack for Auth flow and Scanner
- Create placeholder screens: `src/screens/HomeScreen.tsx`, `LeaderboardScreen.tsx`, `ProfileScreen.tsx`, `ScannerScreen.tsx`, `AuthScreen.tsx` (login/signup)

---

## Phase 2: Auth + profile + QR

### Task 2.1: Auth screen and Firebase Auth
- `src/screens/AuthScreen.tsx`: email/password form (sign up + sign in), "Sign in with Google" / "Sign in with Apple" buttons; on success create/update user doc and navigate to main app
- `src/contexts/AuthContext.tsx`: listen to `onAuthStateChanged`, expose user + loading; if no user show AuthScreen

### Task 2.2: User profile document
- On first sign-in (or sign-up): create Firestore doc `users/{uid}` with schema: `uid`, `username` (default "JeepQuack42"), `displayName`, `avatarUrl`, `totalDucksGiven: 0`, `totalDucksReceived: 0`, `currentStreak: 0`, `bestStreak: 0`, `rankTitle: "Sitting Duck"`, optional `jeepNickname`, `jeepColor`; if user count < 100 set badge "Founding Ducker"

### Task 2.3: Profile screen and edit
- ProfileScreen: show username, displayName, optional Jeep nickname/color, avatar placeholder, stats (ducks given/received, streaks), "Edit profile" → simple form to update username, displayName, jeepNickname, jeepColor; "Data deletion" button (calls Cloud Function or doc delete per design)

### Task 2.4: Personal QR generator
- Install `qrcode`; create `src/utils/qr.ts`: generate QR data URL for `ducku://profile/{uid}` (or `https://ducku.app/profile/{uid}`)
- ProfileScreen (and post-onboard): display user's QR image; "Print me!" button (share or open share sheet with image/link); show shareable invite link

### Task 2.5: Onboarding flow
- After first auth: if no username set or flag `onboarded: false`, show onboarding screen → pick username (prefill "JeepQuack42") → show QR + "Print me!" + "Done"; set `onboarded: true`

---

## Phase 3: Scanner + duck events

### Task 3.1: Scanner screen and permissions
- ScannerScreen: request camera permission (expo-barcode-scanner); scan QR; parse payload for profile ID (uid or slug); on success show "You've been ducked!" UI and call backend to record event

### Task 3.2: Record duck event (client)
- `src/services/duckService.ts`: function `recordDuck(fromUid, toUid)` that creates a doc in `duckEvents` with `fromUid`, `toUid`, `timestamp: serverTimestamp()`, and optionally `location`; Cloud Function will compute `pointsAwarded`, `isRevenge`, `chainLength` and update user stats

### Task 3.3: Cloud Function: process duck event
- `functions/`: onCreate `duckEvents`: compute points (first duck 5, regular 3; Night Owl +2; revenge ×2; chain 3+ → +10 and double next; self-duck −5); set `pointsAwarded`, `isRevenge`, `chainLength`; update `users` (totalDucksGiven/totalDucksReceived, streaks); trigger push to `toUid` ("You just got ducked by {displayName}!")

### Task 3.4: Success animation and points pop-up
- After record succeeds: show Lottie or simple animation "You've been ducked!"; show points pop-up; play quack (Expo AV); if new high/title show "Duck Lord" style message

---

## Phase 4: Scoring engine (Cloud Function) and leaderboard

### Task 4.1: Scoring logic in Cloud Function
- In `processDuckEvent`: determine first duck (query duckEvents where toUid == target, limit 1); Night Owl from timestamp (10pm–6am local or UTC per rule); revenge: check if toUid ever ducked fromUid; chain: count recent duckEvents from fromUid with no toUid duck in between; self-duck if fromUid === toUid; write points and flags to duckEvent doc

### Task 4.2: Streak and title updates
- In same Function: update fromUser's `currentStreak` (increment if last event was same day or consecutive day logic); update `bestStreak`; compute `rankTitle` from total points (0–10 Sitting Duck, 50+ Quack Assassin, 200+ Supreme Duckinator)

### Task 4.3: Weekly leaderboard snapshot
- Scheduled Cloud Function (every Sunday): aggregate points from duckEvents for the week per user; write/update `leaderboards` collection (`weekStart`, `userId`, `score`, `rank`); assign "Lord of the Pond" to top 3 for that week (e.g. in user doc or leaderboard doc)

### Task 4.4: Leaderboard screen
- LeaderboardScreen: tabs or segments "Weekly" / "All-time"; Weekly: read `leaderboards` where weekStart == current week, order by rank; All-time: read users order by total points (or maintained field); show crowns for top 3

---

## Phase 5: Push, animations, revenge/chain, admin

### Task 5.1: Push notifications
- Expo Notifications: request permission; store push token in `users/{uid}.pushToken`; Cloud Function on duck event: send FCM to toUid "You just got ducked by {displayName}!"

### Task 5.2: Revenge and chain detection
- Already in Task 4.1; ensure client shows "Revenge!" and "Duck Chain!" badges in success UI when applicable (read from duckEvent response or doc)

### Task 5.3: Admin dashboard (in-app or simple web)
- Admin screen (role: check custom claim or `users/{uid}.isAdmin`): "Print Starter Pack" → generate PDF with 4–6 QR stickers (different UIDs or placeholder QR codes); "Approve first 100 users" or list of users to approve (if using approval gate); show list of users for support

### Task 5.4: Polish
- Home screen: "Scan a duck" big button; current streak; "You've been ducked X times"; silly duck-themed styling
- After first duck: "Challenge a friend" modal with pre-filled share text + app link
- Data deletion: button in profile that calls Cloud Function to delete user data (auth, Firestore user doc, duckEvents where from/to uid)

---

## Phase 6 (optional): Sounds, Lottie, shareable stories

- Silly quack on duck (Expo AV)
- Lottie duck explosion on scan success
- Shareable "I just ducked someone" story (image or deep link)

---

## File layout (reference)

```
duck-u/
  App.tsx
  app.json
  package.json
  .env.example
  firestore.rules
  docs/
    plans/
    firebase-setup.md
  src/
    config/firebase.ts
    constants/env.ts
    contexts/AuthContext.tsx
    screens/
      AuthScreen.tsx
      HomeScreen.tsx
      ScannerScreen.tsx
      LeaderboardScreen.tsx
      ProfileScreen.tsx
      OnboardingScreen.tsx
      AdminScreen.tsx
    services/
      duckService.ts
      userService.ts
    utils/qr.ts
    components/ (shared UI)
  functions/ (Cloud Functions)
```

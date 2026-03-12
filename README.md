# Duck U ~ Don't be Wack, Do Quack!

React Native (Expo) + Firebase app: scan QR stickers to "duck" friends, earn points, streaks, and compete on leaderboards.

## Repo structure

- **`duck-u/`** – Expo app (iOS + Android)
- **`docs/`** – Design and implementation plans
- **`functions/`** – Firebase Cloud Functions (scoring, weekly leaderboard, push)
- **`firestore.rules`** – Firestore security rules
- **`firestore.indexes.json`** – Firestore composite indexes

## How to run the app (no phone needed)

1. **Open a terminal you can see**  
   In Cursor: **View → Terminal** (or `` Ctrl+` ``). Use this same terminal for the steps below.

2. **Start the app**
   ```bash
   cd duck-u
   npm install
   npx expo start
   ```
   Wait until it says something like “Metro waiting on …” and shows a QR code and menu.

3. **Open in your browser (easiest)**  
   In that **same terminal**, press **`w`**.  
   The Duck U app will open in your browser. No phone and no QR scanning.

4. **If you want to use your phone later**  
   The **QR code appears only in that same terminal** (the one where `npx expo start` is running).  
   - On **iPhone**: open the Camera app and point it at the QR code in the terminal.  
   - On **Android**: open the Expo Go app and use “Scan QR code” and point it at the terminal.  
   If you don’t see a QR in Cursor’s terminal, run `npx expo start` in a normal PowerShell or Command Prompt window instead; the QR will show there.

---

## Quick start (Firebase + deploy)

### 1. Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password; Google and Apple optional).
3. Create **Firestore** and **Storage**.
4. Copy `duck-u/.env.example` to `duck-u/.env` and fill in your Firebase config.

See **`docs/firebase-setup.md`** for full steps.

### 2. App (run locally)

```bash
cd duck-u
npm install
# Add your .env with EXPO_PUBLIC_FIREBASE_*
npx expo start
# Then press w for web, or use the QR in this terminal on your phone
```

### 3. Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Deploy rules and indexes from repo root:

```bash
firebase deploy --only firestore
```

## Features (MVP)

- **Auth:** Email/password sign up & sign in (Google/Apple optional).
- **Profile:** Username (default "JeepQuack42"), optional Jeep nickname/color, stats.
- **Personal QR:** One QR per user; "Print me!" / share.
- **Scanner:** Scan any Duck U QR → "You've been ducked!" + points and bonuses.
- **Scoring:** First duck 5 pts, regular 3 pts; Night Owl +2, Revenge ×2, Duck Chain +10 and double.
- **Leaderboard:** Weekly (from Cloud Function snapshot) and all-time.
- **Push:** "You just got ducked by …" (store FCM/Expo token in `users.pushToken`).

## Scoring (Cloud Function)

- First duck on a user: **5 pts**. Regular: **3 pts**.
- **Night Owl** (10pm–6am UTC): +2.
- **Revenge** (they ducked you first): ×2.
- **Duck Chain** (3+ ducks given in a row): +10 and ×2.
- **Self-duck:** −5 pts.

Titles: 0–10 Sitting Duck, 50+ Quack Assassin, 200+ Supreme Duckinator. Top 3 weekly: "Lord of the Pond".

## Privacy

- QR is opt-in only. No license plate storage. Location optional and only for future bonuses. Data deletion available from profile.

## License

Private / your choice.

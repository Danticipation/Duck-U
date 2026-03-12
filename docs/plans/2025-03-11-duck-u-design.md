# Duck U – Design Document

> **App:** Duck U ~ Don't be Wack, Do Quack!  
> **Repo:** https://github.com/Danticipation/Duck-U.git

## 1. Overview

Duck U is a React Native (Expo) + Firebase app where users scan QR stickers to “duck” each other, earn points, and compete on leaderboards. Core loop: **print/scan QR → instant points + silly feedback → live leaderboard + streaks**.

## 2. MVP Scope

- **Auth:** Email/password + Apple/Google
- **Profile:** Silly username (default "JeepQuack42"), optional Jeep nickname/color, duck-themed avatar
- **Personal QR:** One unique QR per user → profile ID
- **Scanner:** Scan any QR → "You've been ducked!" animation + points
- **Scoring:** Base points + Night Owl, Revenge, Duck Chain, self-duck penalty (see §6)
- **Leaderboard:** Weekly + all-time, live
- **Duck Chain + Revenge** rules
- **Push:** "You just got ducked by BlueBeast!"
- **Admin:** Print starter stickers, approve first 100 users (Founding Ducker)

*Deferred:* geolocation bonuses (opt-in), photo proof, custom QR designs.

## 3. Tech Stack

- **Frontend:** React Native (Expo), one codebase iOS + Android
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Storage)
- **QR:** expo-barcode-scanner + qrcode
- **Animations/Sounds:** Lottie + Expo AV (quack on duck)
- **Deploy:** Expo EAS Build

## 4. Database Schema (Firestore)

### `users`
- `uid`, `username`, `displayName`, `avatarUrl`
- `totalDucksGiven`, `totalDucksReceived`
- `currentStreak`, `bestStreak`, `rankTitle`
- Optional: Jeep nickname/color, badges (e.g. Founding Ducker)

### `duckEvents` (one doc per ducking)
- `id`, `fromUid`, `toUid`, `timestamp`
- `pointsAwarded`, `isRevenge`, `isDriveThruBonus`, `chainLength`
- `location?` (optional)

### `leaderboards`
- Weekly snapshot (Cloud Function every Sunday): `weekStart`, `userId`, `score`, `rank`

## 5. User Flows

- **Onboard:** Pick silly username → Generate & show QR ("Print me!" + shareable link)
- **Home:** "Scan a duck" button, current streak, "You've been ducked X times"
- **Scanner:** Success animation + points pop-up + "Duck Lord" title if new high
- **Leaderboard tab:** Weekly + all-time, crowns
- **Profile tab:** My QR, stats, "Print more stickers" link

## 6. Scoring Engine (Cloud Function)

- **First duck on a user ever:** 5 pts  
- **Regular duck:** 3 pts  
- **Night Owl (10pm–6am):** +2  
- **Revenge duck (they ducked you first):** ×2  
- **Duck Chain (3+ in a row without being hit):** +10 + auto-double next duck  
- **Self-duck:** −5 + shame badge  
- **Fake/expired QR:** 0 pts + "Quack Fail" badge  

**Titles:** 0–10 = Sitting Duck; 50+ = Quack Assassin; 200+ = Supreme Duckinator; Top 3 weekly = "Lord of the Pond" crown.

## 7. Bootstrap / Seeding

- First 100 users: "Founding Ducker" badge + free digital sticker pack
- Invite: shareable link → auto QR for new user
- "Print Starter Pack" → PDF with 4–6 QR stickers (silly faces)
- After first duck: "Challenge a friend" with pre-filled text + app link

## 8. Privacy & Legal (hard-coded)

- QR 100% opt-in only
- Never store or scan real license plates
- Location = optional, clear toggle, only for bonuses
- Data deletion button in profile

## 9. Implementation Phases

1. **Phase 1:** Auth + profile + QR generation  
2. **Phase 2:** Scanner + basic duck event logging  
3. **Phase 3:** Scoring Cloud Function + streak logic; Leaderboard + titles  
4. **Phase 4:** Push, animations, revenge & chain detection; Admin + print PDF; Polish  
5. **Optional:** Sounds, Lottie duck explosions, shareable "I just ducked someone" stories

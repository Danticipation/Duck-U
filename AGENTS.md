# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Duck U is a React Native (Expo) + Firebase app. The repo has two npm packages:
- **Root (`/workspace`)** – Expo app (entry: `App.tsx`, uses `expo/AppEntry.js`)
- **`/workspace/functions`** – Firebase Cloud Functions (TypeScript, compiled to `lib/`)

### Running the Expo dev server
```
npx expo start --web --port 8081 --non-interactive
```
Opens at `http://localhost:8081`. The `--non-interactive` flag is required in headless/cloud environments. Press `w` to open web if running interactively.

**Note:** The README references `cd duck-u` but the Expo app is at the repo root, not inside the `duck-u/` directory (which is empty).

### Building Cloud Functions
```
cd functions && npm run build
```
This runs `tsc`. Output goes to `functions/lib/`.

### Linting
- `npx expo lint` — runs ESLint on the project (auto-configures ESLint on first run if not set up)
- `npx eslint App.tsx` — lint specific files
- The `functions/lib/` directory (compiled JS) will produce lint errors — these are expected and can be ignored. Consider adding `functions/lib/*` to the ESLint `ignores` list.

### TypeScript checking
- Root app: `npx tsc --noEmit`
- Functions: `cd functions && npx tsc --noEmit`

### Known gotchas
- **Permission issue on `node_modules/.bin` scripts**: After `npm install`, scripts like `tsc` and `expo` may lack execute permission. Run `chmod +x node_modules/.bin/*` if you get "Permission denied" errors.
- **Node version**: Functions `package.json` specifies `engines.node: "20"` but the environment runs Node 22. `npm install` will warn but dependencies install correctly and `tsc` compiles without issues.
- **No test suite**: `npm test` is a placeholder that exits with error. There are no automated tests configured.
- **No Firebase project linked**: There is no `.firebaserc` file. Firebase deploy commands require `firebase init` or manual project linking first.
- **No `.env` file**: The app needs `EXPO_PUBLIC_FIREBASE_*` environment variables for Firebase integration, but the splash screen runs without them.

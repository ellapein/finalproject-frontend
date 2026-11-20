# 📍 Where to put the files — Frontend (React + Firebase)

This guide tells you **exactly where each file goes** and what to do with it.
Works on Windows, Mac and Linux. Commands are for **PowerShell in VS Code** (Terminal → New Terminal).

---

## 1. Put the project folder in the right place

1. Unzip `frontend-finals.zip`. You get one folder named **`frontend-finals`**.
2. Move it somewhere easy, for example:
   `C:\Users\riche\Documents\3rd year na siya\frontend-project\frontend-finals`
3. In VS Code: **File → Open Folder…** → choose the `frontend-finals` folder.

✅ **Check:** in the VS Code sidebar you must see `package.json` and `src` **directly** (not inside another folder).
If you see only one more folder called `frontend-finals`, you opened one level too high — open the inner one.

---

## 2. What every file is (and whether you edit it)

Legend: ✏️ = you edit/create this · 📋 = you copy-paste this somewhere else · 🔒 = leave it alone

```
frontend-finals/
├─ .env.example            📋 copy → rename to ".env" and fill in your Firebase keys   (Step 3)
├─ .env                    ✏️ YOU CREATE THIS (never upload to GitHub — already ignored)
├─ firestore.rules         📋 paste the whole file into Firebase Console → Firestore → Rules (Step 4)
├─ serviceAccountKey.json  ✏️ OPTIONAL: only for demo data (Step 6). Never share it.
├─ package.json            🔒 list of libraries + commands (npm run dev / build / test)
├─ package-lock.json       🔒
├─ index.html              🔒 the single HTML page React mounts into
├─ vite.config.ts          🔒 Vite + test settings
├─ tsconfig.json           🔒 TypeScript settings
├─ vercel.json             🔒 makes page refresh work on Vercel (e.g. /dashboard)
├─ firebase.json           🔒 tells Firebase CLI which rules file to use
├─ firestore.indexes.json  🔒
├─ vitest.rules.config.ts  🔒 settings for the rules tests
├─ README.md               📖 full setup + Firebase + GitHub + Vercel instructions
├─ .gitignore              🔒 keeps secrets (.env, serviceAccountKey.json) out of GitHub
├─ .github/workflows/ci.yml 🔒 GitHub runs type-check + tests + build on every push
├─ public/
│   └─ favicon.svg         🔒 browser tab icon
├─ scripts/
│   └─ seed.mjs            🔒 `npm run seed` → creates demo accounts/data
├─ tests/
│   └─ firestore.rules.test.ts  🔒 tests that prove the privacy rules work
├─ docs/                   ✏️ PUT YOUR PAPER (PDF/Word) AND SLIDES HERE before submitting
└─ src/
    ├─ main.tsx            🔒 app entry
    ├─ App.tsx             ✏️ all routes (pages) live here — add a new page = add a <Route>
    ├─ index.css           ✏️ ALL the styling (colors are variables at the top)
    ├─ types.ts            🔒 TypeScript types (User, Team, Evaluation…)
    ├─ lib/
    │   ├─ firebase.ts     🔒 connects to Firebase using your .env values
    │   ├─ peer.ts         ✏️ criteria, rating scale, roles, comment length — change wording here
    │   ├─ validation.ts   ✏️ all form-validation rules and error messages
    │   ├─ stats.ts        🔒 averages, completion %, CSV export
    │   └─ __tests__/      🔒 16 unit tests
    ├─ services/           ← the ONLY files that talk to Firebase (CRUD lives here)
    │   ├─ authService.ts        register / login / logout (+ friendly error messages)
    │   ├─ userService.ts        read teammates, update profile, join team
    │   ├─ teamService.ts        create / read / update / delete teams, remove member
    │   └─ evaluationService.ts  create / read / update / delete evaluations
    ├─ context/AuthContext.tsx   🔒 knows who is signed in
    ├─ hooks/useAsync.ts         🔒 loading / error / data helper used by pages
    ├─ components/         ← 17 reusable pieces
    │   Avatar, Badge, ConfirmDialog, EmptyState, ErrorNotice, EvaluationCard, FormField,
    │   Header, Layout, ProgressBar, ProtectedRoute, RatingInput, ResultsTable, Spinner,
    │   TeammateCard, TermSwitch, Toast
    └─ pages/              ← one file per screen
        LoginPage, RegisterPage, DashboardPage, EvaluatePage, MyEvaluationsPage, TeamPage,
        GuidePage (student)  ·  AdviserResultsPage, AdviserTeamsPage, TeamFormPage (adviser)
        NotFoundPage, SetupPage (shows when .env is missing)
```

---

## 3. Put your Firebase keys in `.env`

1. In the project root (same level as `package.json`) copy `.env.example` and name the copy **`.env`**
   PowerShell: `copy .env.example .env`
2. Open `.env` and paste the values from **Firebase Console → ⚙ Project settings → General → Your apps → Web app → `firebaseConfig`**:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```
No quotes, no spaces around `=`. **Restart `npm run dev` after editing `.env`.**

## 4. Put the Security Rules into Firebase (very important)

1. Open `firestore.rules` in VS Code → **Ctrl+A → Ctrl+C**.
2. Firebase Console → **Firestore Database → Rules** tab → select everything → **Ctrl+V** → **Publish**.

Without this step the privacy feature (teammates can’t read each other’s evaluations) does not work.

## 5. Run it

```powershell
cd "C:\Users\riche\Documents\3rd year na siya\frontend-project\frontend-finals"
npm install
npm run dev
```
Open the link it prints (usually http://localhost:5173).
Before you submit, also run: `npm run typecheck` · `npm test` · `npm run build` — all three should finish without errors.

## 6. Demo data (optional but great for the defense)

1. Firebase Console → Project settings → **Service accounts → Generate new private key**.
2. Save that downloaded file as **`serviceAccountKey.json`** in the project root (next to `package.json`).
3. `npm run seed`
4. Sign in with `adviser@sorsu.edu.ph / adviser123` or `juan@student.sorsu.edu.ph / student123`.

## 7. Real adviser account

Firestore Database → **Start collection** `adviserInvites` → **Document ID = adviser’s email in lowercase** → add any field (e.g. `approved` = `true`) → Save.
Then that person registers on the **Create account → Adviser** tab.

## 8. GitHub then Vercel

Put the whole project folder on GitHub (commands are in `README.md`, section 5). On Vercel, **import the repo** and add the **same six `VITE_FIREBASE_*` values** under *Settings → Environment Variables*. Then in Firebase → **Authentication → Settings → Authorized domains → Add** your `xxxx.vercel.app`.

---

## 9. Already have your own Vite + React project (from the Midterm)? Merge like this

| Copy from this zip | Into your project | Notes |
|---|---|---|
| `src/` (whole folder) | `src/` | replace your files |
| `public/favicon.svg` | `public/` | |
| `index.html`, `vite.config.ts`, `tsconfig.json` | project root | replace |
| `firestore.rules`, `firestore.indexes.json`, `firebase.json` | project root | new |
| `vercel.json`, `.env.example`, `.gitignore` | project root | new / merge |
| `scripts/`, `tests/`, `.github/` | project root | new |
| `package.json` | — | don’t replace; instead run: `npm i firebase@11.1.0 react-router-dom@6.28.0` and `npm i -D vitest@2.1.8` and add the scripts from our `package.json` |

---

## 10. Quick fixes

| What you see | Fix |
|---|---|
| Page says **“Firebase is not set up yet”** | `.env` missing or has empty values → Step 3, then restart `npm run dev` |
| `permission-denied` / “You do not have permission” | Rules not published → Step 4 |
| “This email has not been approved as an adviser” | Add the `adviserInvites` document (Step 7) |
| “We could not find a team with that code” | The adviser must first create the team (Manage Teams → New team) |
| White page after deploying, 404 on refresh | Make sure `vercel.json` is in the repo root |
| Login works locally but not on Vercel | Add your Vercel domain in Firebase → Authentication → Authorized domains |
| `npm` is not recognized | Install Node.js 20+ from nodejs.org, reopen VS Code |

---

## 11. 🎨 Change the colors / logo (login page like the SorSU portal)

| I want to… | Open this file | Change this |
|---|---|---|
| Change the maroon color | `src/index.css` (top of the file) | `--brand: #810504;` (and `--brand-dark`, `--brand-soft`) |
| Change the blue Sign-in button | `src/index.css` | `--action: #1d74e0;` |
| Change colors of the whole website | `src/index.css` | the variables under `/* App colors (light mode) */` |
| Turn OFF dark mode | `src/index.css` | delete the block that starts with `@media (prefers-color-scheme: dark)` |
| Change the logo | replace the file `public/sorsu-logo.png` | keep the same name, use a square PNG (≥ 400×400 looks sharpest) |
| Change the welcome words | `src/components/AuthShell.tsx` | the text inside `<h1>`, `<p className="auth-sub">`, `<p className="auth-note">` |
| Change the Sign-in page fields | `src/pages/LoginPage.tsx` | |

How to get a color code: Google “color picker”, pick a color, copy the `#xxxxxx` code and paste it after the variable name. Save the file — the browser updates by itself.

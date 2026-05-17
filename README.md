# HireSight

HireSight is a Chrome Extension + Express backend that analyzes job postings against a user's resume and shows a premium sidebar with match score, missing skills, ATS suggestions, rewrite ideas, interview topics, project recommendations, and save-to-dashboard support.

## Stack

- Extension: React, TypeScript, Tailwind CSS, Chrome Extension Manifest V3
- Backend: Node.js, Express, TypeScript, MongoDB
- AI: Gemini or Groq through the backend only

API keys are never used in the extension frontend.

## Project Structure

```txt
extension/
  src/
    popup/
    content/
    sidebar/
    options/
    dashboard/
    components/
    utils/
server/
  routes/
  controllers/
  services/
  models/
  middleware/
```

## Setup

### 1. Install dependencies

```bash
cd server
npm install

cd ../extension
npm install
```

`pnpm install` also works in both folders if you prefer pnpm.

### 2. Configure backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/hiresight
ALLOWED_ORIGINS=chrome-extension://YOUR_EXTENSION_ID,http://localhost:5173
AI_PROVIDER=demo
GEMINI_API_KEY=
GROQ_API_KEY=
```

Use `AI_PROVIDER=demo` when you do not have an AI key yet. The API will return realistic fallback analysis. If MongoDB is not running, the server still boots with in-memory demo storage for the current process.

### 3. Run backend

```bash
cd server
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

### 4. Build extension

```bash
cd extension
npm run build
```

### 5. Load unpacked extension in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select `extension/dist`.
5. Open the extension options and set the backend URL to `http://localhost:4000`.

## Extension Commands

```bash
cd extension
npm run dev
npm run build
npm run typecheck
```

During development, use `npm run build -- --watch` and reload the unpacked extension after changes.

## Server Commands

```bash
cd server
npm run dev
npm run build
npm start
```

## Backend APIs

- `POST /api/resume/upload`
- `POST /api/job/analyze`
- `GET /api/jobs/saved`
- `POST /api/jobs/save`
- `DELETE /api/jobs/:id`

## Security Notes

- Keep all AI keys in `server/.env`.
- The extension calls only the Express backend.
- CORS is restricted by `ALLOWED_ORIGINS`.
- Inputs are validated before controller logic.
- Demo mode works without Gemini or Groq credentials.

# QuillAI frontend

React (Vite) + Tailwind CSS v4 single-page app. Talks to the QuillAI backend and renders Gemini output as it streams in.

## Run locally
```bash
npm install
cp .env.example .env   # VITE_API_URL points at the backend
npm run dev
```

## Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/quillai-frontend.git
git push -u origin main
```

## Deploy on Netlify
1. Netlify: **Add new site > Import an existing project**, pick the `quillai-frontend` repo.
2. Build command `npm run build`, publish directory `dist`.
3. Site configuration > Environment variables: `VITE_API_URL` = your Render backend URL (no trailing slash).
4. Deploy, then put the Netlify URL into the backend's `CLIENT_URL` on Render so CORS allows it.

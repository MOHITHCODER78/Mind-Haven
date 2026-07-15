@echo off
cd /d f:\MHP2
echo Pushing all fixes to GitHub...
git add server/src/app.js server/src/server.js server/.env.example
git commit -m "Fix CORS and trust proxy for Render deployment - add mind-haven-f2t4.vercel.app"
git push origin main
echo Done! Redeploy on Render.
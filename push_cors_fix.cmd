@echo off
cd /d f:\MHP2
echo Committing CORS fix...
git add server/src/app.js server/.env.example
git commit -m "Fix CORS for Vercel frontend - add mind-haven-f2t4.vercel.app to allowed origins"
git push origin main
echo Done! Remember to redeploy on Render.
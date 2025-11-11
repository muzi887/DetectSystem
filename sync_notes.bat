@echo off
cd /d "D:\code2\software\vue\program\DetectSystem"
git pull
git add -A
git commit -m "chore: update notes" 2>nul
git push
pause

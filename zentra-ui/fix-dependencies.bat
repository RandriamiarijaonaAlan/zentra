@echo off
echo Suppression du dossier node_modules et package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo Installation des nouvelles dependances...
npm install

echo.
echo Dependances mises a jour avec succes!
echo Vous pouvez maintenant lancer: npm run dev
pause

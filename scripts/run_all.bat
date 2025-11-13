::@echo off
:: Inicializar la base de datos (solo si no existe)
::start /B cmd /C "cd ..\tamagotchi-service && python database.py"
:: Levantar el servidor de backend (Node.js)
::start cmd /K "cd ..\backend && npm start && pause"
:: Levantar el frontend (servidor de desarrollo Phaser o un placeholder)
::start cmd /K "cd ..\frontend && npm run dev && pause"
:: Levantar Flask (Tamagotchi)
::start cmd /K "cd ..\tamagotchi-service && venv\Scripts\activate && python app.py && pause"
:: Levantar el servicio de cron para actualizar atributos
::start cmd /C "cd ..\backend && node cron.js"
:: Esperar unos segundos para asegurarse de que los servidores estén arriba
::timeout /t 5
:: Abrir el navegador automáticamente en la URL del juego
::start http://localhost:3000/html/index.html
:: Opcionalmente, abrir la página de estado de los servicios para verificar Flask (comentado)
:: start http://localhost:5000/estado-sistemas


@echo off
set SCRIPT_DIR=%~dp0

REM -- Inicializar la base de datos (opcional)
start /B "" cmd /C "cd /d "%SCRIPT_DIR%..\tamagotchi-service" && python database.py"

REM -- Backend
start "BACKEND" cmd /K "cd /d "%SCRIPT_DIR%..\backend" && npm start"

REM -- Frontend en puerto distinto si hay conflicto
start "FRONTEND" cmd /K "cd /d "%SCRIPT_DIR%..\frontend" && npx live-server --port=3001 --no-browser"

REM -- Flask Tamagotchi (activar venv)
start "TAMAGOTCHI" cmd /K "cd /d "%SCRIPT_DIR%..\tamagotchi-service" && call venv\Scripts\activate.bat && python app.py"

REM -- CRON (archivo CommonJS .cjs)
start "CRON" cmd /K "cd /d "%SCRIPT_DIR%..\backend" && node scripts/cron.cjs"

timeout /t 6 /nobreak > nul
start "" "http://127.0.0.1:3001/html/index.html"
exit /b 0
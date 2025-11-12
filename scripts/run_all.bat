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
REM -- Base dir del script
set SCRIPT_DIR=%~dp0

REM -- Inicializar la base de datos (si corresponde)
start /B cmd /C "cd /d \"%SCRIPT_DIR%..\\tamagotchi-service\" && python database.py"

REM -- Levantar el servidor de backend (Node.js)
start cmd /K "cd /d \"%SCRIPT_DIR%..\\backend\" && npm start && pause"

REM -- Levantar el frontend (si tienes un script dev)
start cmd /K "cd /d \"%SCRIPT_DIR%..\\frontend\" && npm run dev && pause"

REM -- Levantar Flask (Tamagotchi)
start cmd /K "cd /d \"%SCRIPT_DIR%..\\tamagotchi-service\" && venv\\Scripts\\activate && python app.py && pause"

REM -- Levantar el servicio de cron para actualizar atributos (ajustado a ruta scripts)
start cmd /C "cd /d \"%SCRIPT_DIR%..\\backend\" && node scripts/cron.js"

REM -- Esperar unos segundos para asegurarse de que los servidores estén arriba
timeout /t 5

REM -- Abrir el navegador automáticamente en la URL del juego
start http://localhost:3000/html/index.html


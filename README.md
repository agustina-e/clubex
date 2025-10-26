# Clubex 🐾

Clubex es un juego web multijugador en 2D estilo Club Penguin, donde los jugadores pueden interactuar con otros, cuidar un avatar tipo Tamagotchi y participar en minijuegos para ganar monedas.

##🎮 Características principales

Sistema de avatares tipo Tamagotchi: comer, beber, jugar y mantenerlos vivos.

HUD interactivo que muestra hambre, sed, aburrimiento y vida del avatar.

Multijugador en tiempo real usando Socket.IO.

Movimiento 2D y chat entre jugadores.

Minijuegos para obtener monedas y desbloquear acciones.

Personalización de colores de gatitos (6 opciones en pixel art).

Sistema de coma y recuperación si el Tamagotchi llega a vida 0, con contadores de tiempo y revivir mediante monedas.

##🛠 Tecnologías utilizadas

Frontend: HTML, CSS (Pixel Art), JavaScript

Backend: Node.js, Express, Socket.IO

Microservicio: Python con Flask para la lógica del Tamagotchi

Base de datos: MongoDB

##🚀 Instalación y ejecución

Clonar el repositorio:

git clone https://github.com/agustina-e/clubex.git
cd clubex


Instalar dependencias del backend:

cd backend
npm install


Levantar el servidor de Node.js:

node server.js


Levantar el microservicio Flask para Tamagotchi:

cd ../tamagotchi-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py


Abrir el juego en el navegador desde frontend/html/index.html

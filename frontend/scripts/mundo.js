document.addEventListener('DOMContentLoaded', () => {
  // ——————— DOM Elements ———————
  const mapButton         = document.getElementById('map-button');
  const mapPopup          = document.getElementById('map-popup');
  const closeMapButton    = document.getElementById('close-map');
  const chatLog           = document.getElementById('chat-log');
  const chatInput         = document.getElementById('chat-input');
  const sendMessageButton = document.getElementById('send-message');
  const usernameSpan      = document.getElementById('username-display');
  const avatarName        = document.getElementById('avatar-name');

  // Elementos del popup de color
  const colorPopup      = document.getElementById('color-popup');
  const colorOptions    = document.querySelectorAll('input[name="avatar_color"]');
  const colorPreview    = document.getElementById('color-preview');
  const saveColorBtn    = document.getElementById('save-color');

  // Sprite del avatar en el mundo
  const avatarSprite    = document.getElementById('gatito-sprite');

  // ——————— Current User ———————
  const currentUsername = localStorage.getItem('clubex_username') || 'Invitado';
  usernameSpan.textContent = currentUsername;
  avatarName.textContent   = currentUsername;

  let selectedColor = "gris"; // color por defecto

  // ——————— Color del avatar ———————
  if (currentUsername === "Invitado") {
    aplicarColor("gris");
  } else {
    fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`)
      .then(res => res.json())
      .then(data => {
        if (!data.avatar_color) {
          colorPopup.classList.remove('hidden');
          aplicarColor("gris"); // mostrar gris en preview por defecto
          colorPreview.src = "/assets/avatar_gris.png";
        } else {
          aplicarColor(data.avatar_color);
        }
      });
  }

  // Al hacer clic en un color, actualizar preview y variable
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      selectedColor = option.value;
      colorPreview.src = `/assets/avatar_${selectedColor}.png`;
    });
  });

  // Guardar color elegido
  saveColorBtn.addEventListener('click', () => {
    if (!selectedColor) return alert("Elegí un color");

    fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_color: selectedColor })
    })
    .then(res => res.json())
    .then(() => {
      colorPopup.classList.add('hidden');
      aplicarColor(selectedColor);
    });
  });

  function aplicarColor(color) {
    if (avatarSprite) {
      avatarSprite.src = `/assets/avatar_${color}.png`;
    }
  }

  // ——————— Welcome Message ———————
  const welcomeMessage = document.createElement('p');
  welcomeMessage.textContent = 'Sistema: ¡Bienvenido al mundo de CluBex!';
  chatLog.appendChild(welcomeMessage);
  chatLog.scrollTop = chatLog.scrollHeight;

  // ——————— Map Popup ———————
  mapButton.addEventListener('click', () => {
    mapPopup.classList.remove('hidden');
  });
  closeMapButton.addEventListener('click', () => {
    mapPopup.classList.add('hidden');
  });

  // ——————— Techo Navigation ———————
  document.querySelectorAll('.jump-sign').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.location;
      console.log(`Saltar a: ${target}`);
      // TODO: aquí cargar nuevo techo/mapa según target
    });
  });

  // ——————— Chat Messaging ———————
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const msgElem = document.createElement('p');
    msgElem.textContent = `${currentUsername}: ${text}`;
    chatLog.appendChild(msgElem);

    while (chatLog.children.length > 50) {
      chatLog.removeChild(chatLog.firstChild);
    }

    chatInput.value = '';
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  sendMessageButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});

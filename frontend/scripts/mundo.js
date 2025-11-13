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

  // // Elementos del popup de color (debe existir en el HTML)
  // const colorPopup      = document.getElementById('color-popup');
  // const colorOptions    = document.querySelectorAll('input[name="avatar_color"]');
  // const colorPreview    = document.getElementById('color-preview');
  // const saveColorBtn    = document.getElementById('save-color');

  const colorPopup      = document.getElementById('color-popup');
  const colorPreview    = document.getElementById('color-preview');
  const colorChoices    = document.querySelectorAll('#color-choices .color-choice');
  const colorInputs     = document.querySelectorAll('input[name="avatar_color"]');
  const saveColorBtn    = document.getElementById('save-color');
  const avatarSprite    = document.getElementById('gatito-sprite');

  const currentUsername = localStorage.getItem('clubex_username') || 'Invitado';
  const popupSeenKey = `clubex_seen_color_popup_${currentUsername}`;
  let selectedColor = 'gris';

  function avatarPath(color) {
    return `../assets/avatars/gatito_${color}.png`;
  }

  function aplicarColor(color) {
    selectedColor = color;
    if (avatarSprite) avatarSprite.src = avatarPath(color);
    if (colorPreview) colorPreview.src = avatarPath(color);
    // marcar input correspondiente
    const inp = document.querySelector(`input[name="avatar_color"][value="${color}"]`);
    if (inp) inp.checked = true;
  }

  // Inicializar: pedir color al servidor; si no hay, mostrar popup (solo la primera vez)
  if (currentUsername === 'Invitado') {
    aplicarColor('gris');
  } else {
    fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`)
      .then(r => r.json())
      .then(data => {
        const serverColor = data && data.avatar_color ? data.avatar_color : null;
        if (!serverColor && !localStorage.getItem(popupSeenKey)) {
          // mostrar modal obligatorio (bloquea fondo)
          if (colorPopup) {
            colorPopup.classList.remove('hidden');
            document.documentElement.classList.add('modal-open');
            aplicarColor('gris');
          }
        } else {
          aplicarColor(serverColor || 'gris');
        }
      })
      .catch(() => aplicarColor('gris'));
  }

  // Click sobre label -> actualizar preview inmediatamente
  colorChoices.forEach(label => {
    label.addEventListener('click', (e) => {
      const color = label.dataset.color;
      // marcar el input asociado (por si el click no lo hizo)
      const inp = label.querySelector('input[name="avatar_color"]');
      if (inp) inp.checked = true;
      aplicarColor(color);
    });
  });

  // También escuchar cambios directos en inputs (por teclado)
  colorInputs.forEach(inp => {
    inp.addEventListener('change', () => {
      if (inp.checked) aplicarColor(inp.value);
    });
  });

  // Guardar color en backend y cerrar popup (obligatorio en primera sesión)
  saveColorBtn?.addEventListener('click', async () => {
    if (!selectedColor) return alert('Elegí un color.');
    try {
      const res = await fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_color: selectedColor })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error guardando color');
      }
      localStorage.setItem(popupSeenKey, 'true');
      if (colorPopup) colorPopup.classList.add('hidden');
      document.documentElement.classList.remove('modal-open');
      aplicarColor(selectedColor);
    } catch (err) {
      console.error('Error guardando color:', err);
      alert('No se pudo guardar el color. Revisá la consola.');
    }
  });

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

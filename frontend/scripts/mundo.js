document.addEventListener('DOMContentLoaded', () => {
  // ————— DOM elements —————
  const chatLog           = document.getElementById('chat-log');
  const chatInput         = document.getElementById('chat-input');
  const sendMessageButton = document.getElementById('send-message');
  const usernameSpan      = document.getElementById('username-display');
  const avatarName        = document.getElementById('avatar-name');

  const colorPopup      = document.getElementById('color-popup');
  const colorPreview    = document.getElementById('color-preview');
  const colorChoices    = document.querySelectorAll('#color-choices .color-choice');
  const colorInputs     = document.querySelectorAll('input[name="avatar_color"]');
  const saveColorBtn    = document.getElementById('save-color');

  const avatarSprite    = document.getElementById('gatito-sprite');
  const avatarEl        = document.getElementById('avatar');

  // ————— Usuario y keys —————
  const rawUsername = (localStorage.getItem('clubex_username') || '').trim();
  const currentUsername = rawUsername;
  const usernameKey = currentUsername.toLowerCase();
  const popupSeenKey = `clubex_seen_color_popup_${usernameKey}`;

  if (!currentUsername) {
    window.location.href = '/html/index.html';
    return;
  }

  if (usernameSpan) usernameSpan.textContent = currentUsername;
  if (avatarName)  avatarName.textContent  = currentUsername;

  // ————— Avatar (color & sprite) —————
  let selectedColor = null;
  function avatarPath(color) {
    return `../assets/avatars/gatito_${color}.png`;
  }
  function aplicarColor(color) {
    if (!color) return;
    selectedColor = color;
    if (avatarSprite) avatarSprite.src = avatarPath(color);
    if (colorPreview) colorPreview.src = avatarPath(color);
    const inp = document.querySelector(`input[name="avatar_color"][value="${color}"]`);
    if (inp) inp.checked = true;
    if (typeof centerAvatar === 'function') setTimeout(centerAvatar, 60);
  }

  if (localStorage.getItem(popupSeenKey) && colorPopup) {
    colorPopup.classList.add('hidden');
    colorPopup.style.display = 'none';
    document.documentElement.classList.remove('modal-open');
  }

  fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`)
    .then(r => r.json())
    .then(data => {
      const serverColor = data && data.avatar_color ? data.avatar_color : null;
      if (serverColor) {
        localStorage.setItem(popupSeenKey, 'true');
        aplicarColor(serverColor);
        if (colorPopup) {
          colorPopup.classList.add('hidden');
          colorPopup.style.display = 'none';
          document.documentElement.classList.remove('modal-open');
        }
      } else {
        if (!localStorage.getItem(popupSeenKey) && colorPopup) {
          colorPopup.classList.remove('hidden');
          document.documentElement.classList.add('modal-open');
        }
      }
    })
    .catch(() => {
      if (!localStorage.getItem(popupSeenKey) && colorPopup) {
        colorPopup.classList.remove('hidden');
        document.documentElement.classList.add('modal-open');
      }
    });

  colorChoices.forEach(label => {
    label.addEventListener('click', () => {
      const color = label.dataset.color;
      const inp = label.querySelector('input[name="avatar_color"]');
      if (inp) inp.checked = true;
      aplicarColor(color);
    });
  });

  colorInputs.forEach(inp => {
    inp.addEventListener('change', () => {
      if (inp.checked) aplicarColor(inp.value);
    });
  });

  saveColorBtn?.addEventListener('click', async (ev) => {
    ev?.preventDefault?.();
    if (!selectedColor) return alert('Elegí un color.');
    try {
      const res = await fetch(`http://localhost:5000/api/user/${encodeURIComponent(currentUsername)}/color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_color: selectedColor })
      });
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      localStorage.setItem(popupSeenKey, 'true');
      if (colorPopup) {
        colorPopup.classList.add('hidden');
        colorPopup.style.display = 'none';
      }
      document.documentElement.classList.remove('modal-open');
      aplicarColor(selectedColor);
    } catch (err) {
      console.error('Error guardando color:', err);
      alert('No se pudo guardar el color. Revisá la consola.');
    }
  });

  // ————— Welcome message & chat —————
  const welcomeMessage = document.createElement('p');
  welcomeMessage.textContent = '¡Bienvenid@ al mundo de CluBex!';
  chatLog.appendChild(welcomeMessage);
  chatLog.scrollTop = chatLog.scrollHeight;

  sendMessageButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    const msgElem = document.createElement('p');
    msgElem.textContent = `${currentUsername}: ${text}`;
    chatLog.appendChild(msgElem);
    while (chatLog.children.length > 50) chatLog.removeChild(chatLog.firstChild);
    chatInput.value = '';
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // ————— Avatar: centrar y movimiento (solo dentro de #world-container) —————
  let centerAvatar = null;
  (function initAvatarMovement() {
    const worldContainer = document.getElementById('world-container') || document.getElementById('game-world') || document.getElementById('main-layout');
    if (!avatarEl || !worldContainer) return;
    if (getComputedStyle(worldContainer).position === 'static') worldContainer.style.position = 'relative';
    if (avatarEl.parentElement !== worldContainer) worldContainer.appendChild(avatarEl);
    avatarEl.style.position = 'absolute';
    avatarEl.style.zIndex = '30';

    let avatarPos = { x: 0, y: 0 };
    function setAvatarPos(x, y) {
      const maxX = Math.max(0, worldContainer.clientWidth - avatarEl.offsetWidth);
      const maxY = Math.max(0, worldContainer.clientHeight - avatarEl.offsetHeight);
      const nx = Math.min(Math.max(0, Math.round(x)), maxX);
      const ny = Math.min(Math.max(0, Math.round(y)), maxY);
      avatarEl.style.left = nx + 'px';
      avatarEl.style.top = ny + 'px';
      avatarPos.x = nx; avatarPos.y = ny;
    }

    centerAvatar = function () {
      const wcW = worldContainer.clientWidth;
      const wcH = worldContainer.clientHeight;
      const aw = avatarEl.offsetWidth;
      const ah = avatarEl.offsetHeight;
      const cx = Math.round((wcW - aw) / 2);
      const cy = Math.round((wcH - ah) / 2);
      setAvatarPos(cx, cy);
    };

    const STEP = 12;
    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      let moved = false;
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': setAvatarPos(avatarPos.x - STEP, avatarPos.y); moved = true; break;
        case 'ArrowRight': case 'd': case 'D': setAvatarPos(avatarPos.x + STEP, avatarPos.y); moved = true; break;
        case 'ArrowUp': case 'w': case 'W': setAvatarPos(avatarPos.x, avatarPos.y - STEP); moved = true; break;
        case 'ArrowDown': case 's': case 'S': setAvatarPos(avatarPos.x, avatarPos.y + STEP); moved = true; break;
        default: break;
      }
      if (moved) e.preventDefault();
    });

    window.addEventListener('resize', () => setAvatarPos(avatarPos.x, avatarPos.y));
    avatarSprite?.addEventListener('load', centerAvatar);
    setTimeout(centerAvatar, 60);
  })();

  // ————— Escenarios (background) y navegación —————
  const SCENARIOS = [
    { id: 'techo',  label: 'Techo',  img: 'techo.png'  },
    { id: 'tienda', label: 'Tienda', img: 'tienda.png' },
    { id: 'taberna',label: 'Taberna',img: 'taberna.png'},
    { id: 'jardin', label: 'Jardín',  img: 'jardin.png' },
    { id: 'fabrica',label: 'Fábrica', img: 'fabrica.png'}
  ];
  let currentIndex = 0;
  const roofEl = document.getElementById('techo-actual');
  const leftBtn = document.getElementById('left-jump');
  const rightBtn = document.getElementById('right-jump');

  function changeRoofImage(fileName) {
    if (!roofEl) return;
    const imgPath = `/img/${fileName}`;
    roofEl.style.transition = 'opacity 220ms ease';
    roofEl.style.opacity = '0';
    setTimeout(() => {
      roofEl.style.backgroundImage = `url('${imgPath}')`;
      roofEl.style.opacity = '1';
    }, 260);
  }

  function setScenario(index) {
    index = Math.max(0, Math.min(index, SCENARIOS.length - 1));
    currentIndex = index;
    const s = SCENARIOS[currentIndex];
    changeRoofImage(s.img);
    updateJumpButtons();
  }

  function updateJumpButtons() {
    const prev = SCENARIOS[Math.max(0, currentIndex - 1)];
    const next = SCENARIOS[Math.min(SCENARIOS.length - 1, currentIndex + 1)];
    if (leftBtn) {
      if (currentIndex === 0) { leftBtn.textContent = '← Inicio'; leftBtn.disabled = true; leftBtn.style.opacity = '0.6'; }
      else { leftBtn.textContent = `← ${prev.label}`; leftBtn.disabled = false; leftBtn.style.opacity = '1'; }
    }
    if (rightBtn) {
      if (currentIndex === SCENARIOS.length - 1) { rightBtn.textContent = 'Fin →'; rightBtn.disabled = true; rightBtn.style.opacity = '0.6'; }
      else { rightBtn.textContent = `${next.label} →`; rightBtn.disabled = false; rightBtn.style.opacity = '1'; }
    }
  }

  leftBtn?.addEventListener('click', () => setScenario(currentIndex - 1));
  rightBtn?.addEventListener('click', () => setScenario(currentIndex + 1));

  // inicializar escenario por defecto
  setScenario(0);

  // ————— Logout —————
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', () => {
    if (!confirm('¿Cerrar sesión?')) return;
    localStorage.removeItem('clubex_username');
    localStorage.removeItem(popupSeenKey);
    window.location.href = '/html/index.html';
  });
});
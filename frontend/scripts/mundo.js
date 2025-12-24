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

  sendMessageButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    const sid = SCENARIOS[currentIndex].id;
    const msg = { user: currentUsername, text, ts: Date.now() };

    // añadir al array, podar y persistir
    messagesByScenario[sid].push(msg);
    pruneMessages(sid);
    persistChats();

    // renderizar sólo el mensaje nuevo
    const row = document.createElement('div');
    row.className = 'chat-msg me';
    const textNode = document.createElement('div');
    textNode.className = 'chat-text';
    textNode.textContent = msg.text;
    const meta = document.createElement('div');
    meta.className = 'chat-meta';
    meta.textContent = `${msg.user} • ${new Date(msg.ts).toLocaleTimeString()}`;
    row.appendChild(textNode);
    row.appendChild(meta);
    chatLog.appendChild(row);

    // Mantener límite visual por número (seguridad)
    while (chatLog.children.length > MAX_MESSAGES_PER_SCENARIO) chatLog.removeChild(chatLog.firstChild);

    // Mantener límite visual por tamaño (altura)
    pruneVisibleMessages(sid);

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

  // Chat por escenario (persistente SOLO durante la sesión del usuario)
  const SESSION_CHAT_KEY_BASE = 'clubex_chat_by_scenario_';
  const SESSION_CHAT_KEY = SESSION_CHAT_KEY_BASE + usernameKey; // por usuario, en sessionStorage
  const MAX_MESSAGES_PER_SCENARIO = 200; // ajusta según necesidad
  let messagesByScenario = {};

  // Cargar desde sessionStorage si existe (esto hace que en cada nuevo inicio de sesión el chat aparezca vacío)
  try {
    messagesByScenario = JSON.parse(sessionStorage.getItem(SESSION_CHAT_KEY) || '{}') || {};
  } catch (e) {
    messagesByScenario = {};
  }

  // Asegura que cada escenario tenga un array (si venimos de sessionStorage vacío, se inicializa vacío)
  SCENARIOS.forEach(s => { if (!Array.isArray(messagesByScenario[s.id])) messagesByScenario[s.id] = []; });

  function pruneMessages(sid) {
    const arr = messagesByScenario[sid] || [];
    if (arr.length > MAX_MESSAGES_PER_SCENARIO) {
      messagesByScenario[sid] = arr.slice(-MAX_MESSAGES_PER_SCENARIO);
    }
  }

  function persistChats() {
    // prune all before saving
    SCENARIOS.forEach(s => { if (messagesByScenario[s.id] && messagesByScenario[s.id].length > MAX_MESSAGES_PER_SCENARIO) {
      messagesByScenario[s.id] = messagesByScenario[s.id].slice(-MAX_MESSAGES_PER_SCENARIO);
    }});
    try {
      sessionStorage.setItem(SESSION_CHAT_KEY, JSON.stringify(messagesByScenario));
    } catch (e) {
      console.warn('No se pudo guardar chat en sessionStorage:', e);
    }
  }

  function pruneVisibleMessages(sid) {
    // Remove oldest messages until the chat content fits the visible height
    const arr = messagesByScenario[sid] || [];
    // Ensure DOM corresponds to arr
    while (chatLog.scrollHeight > chatLog.clientHeight && arr.length > 1) {
      // remove earliest message from both storage and DOM
      arr.shift();
      if (chatLog.firstChild) chatLog.removeChild(chatLog.firstChild);
    }
    // Persist after pruning
    persistChats();
  }

  function renderChatMessages(messages) {
    chatLog.innerHTML = '';
    messages.forEach(m => {
      const row = document.createElement('div');
      row.className = 'chat-msg' + (m.system ? ' system' : (m.user === currentUsername ? ' me' : ''));

      const textNode = document.createElement('div');
      textNode.className = 'chat-text';
      textNode.textContent = m.text;

      const meta = document.createElement('div');
      meta.className = 'chat-meta';
      meta.textContent = `${m.user} • ${new Date(m.ts).toLocaleTimeString()}`;

      row.appendChild(textNode);
      row.appendChild(meta);
      chatLog.appendChild(row);
    });

    // Now prune visible overflow so no vertical scrollbar appears
    const sid = SCENARIOS[currentIndex].id;
    pruneVisibleMessages(sid);

    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Llamar esto cuando cambias de escenario
  function loadChatForCurrentScenario() {
    const sid = SCENARIOS[currentIndex].id;
    const msgs = messagesByScenario[sid] || [];
    // si no hay mensajes, crear uno de bienvenida por defecto
    if (!msgs || msgs.length === 0) {
      const welcome = { user: 'CluBex', text: `¡Bienvenid@ a ${SCENARIOS[currentIndex].label}!`, ts: Date.now(), system: true };
      messagesByScenario[sid] = messagesByScenario[sid] || [];
      messagesByScenario[sid].push(welcome);
      persistChats();
    }
    renderChatMessages(messagesByScenario[sid]);
  }

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
    const len = SCENARIOS.length;
    // navegación circular (modulo, siempre dentro de [0,len-1])
    currentIndex = ((index % len) + len) % len;
    const s = SCENARIOS[currentIndex];
    changeRoofImage(s.img);
    updateJumpButtons();
    // cargar chat del escenario actual (ver sección de chat)
    loadChatForCurrentScenario();
  }

  function updateJumpButtons() {
    const len = SCENARIOS.length;
    const prev = SCENARIOS[(currentIndex - 1 + len) % len];
    const next = SCENARIOS[(currentIndex + 1) % len];
    if (leftBtn) { leftBtn.textContent = `← ${prev.label}`; leftBtn.disabled = false; leftBtn.style.opacity = '1'; }
    if (rightBtn) { rightBtn.textContent = `${next.label} →`; rightBtn.disabled = false; rightBtn.style.opacity = '1'; }
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
    // limpiar chat de sesión de este usuario al hacer logout
    try { sessionStorage.removeItem(SESSION_CHAT_KEY); } catch (e) { /* ignore */ }
    window.location.href = '/html/index.html';
  });

  /* ————— Mapa interactivo (modal con hotspots) ————— */
  const mapButton = document.getElementById('map-button');
  const mapPopup  = document.getElementById('map-popup');
  const mapClose  = document.getElementById('map-close');
  const mapHotspots = Array.from(document.querySelectorAll('.map-hotspot'));

  function openMap() {
    if (!mapPopup) return;
    mapPopup.classList.remove('hidden');
    mapPopup.style.display = 'flex';
    document.documentElement.classList.add('modal-open');
  }
  function closeMap() {
    if (!mapPopup) return;
    mapPopup.classList.add('hidden');
    mapPopup.style.display = 'none';
    document.documentElement.classList.remove('modal-open');
  }

  function goToScenarioById(id) {
    const idx = SCENARIOS.findIndex(s => s.id === id);
    if (idx >= 0) {
      setScenario(idx);
    } else {
      console.warn('Escenario no encontrado en mapa:', id);
    }
  }

  mapButton?.addEventListener('click', openMap);
  mapClose?.addEventListener('click', closeMap);

  // cerrar si se hace click fuera del contenido
  // si el usuario hace click fuera del contenido, cerrar
  mapPopup?.addEventListener('click', (ev) => { if (ev.target === mapPopup) closeMap(); });

  // placeholder si la imagen no está disponible
  const mapImage = document.getElementById('map-image');
  if (mapImage) {
    mapImage.addEventListener('error', () => {
      mapImage.style.display = 'none';
      const wrapper = document.querySelector('.map-wrapper');
      if (wrapper && !wrapper.querySelector('.map-placeholder')) {
        const ph = document.createElement('div');
        ph.className = 'map-placeholder';
        ph.textContent = 'Mapa no disponible (coloca ../assets/img/mapa_mundo.png)';
        wrapper.appendChild(ph);
      }
    });
  }

  // hotspots
  mapHotspots.forEach(h => {
    h.addEventListener('click', () => {
      const id = h.dataset.location;
      goToScenarioById(id);
      closeMap();
    });
  });

  // Esc para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMap();
  });

});
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  async function checkAvailability(url) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { json = text; }

      // log detallado para debugging (muestra el JSON real)
      console.log("CHECK", url, "status:", res.status, "body:", typeof json === "object" ? JSON.stringify(json) : json);

      if (!res.ok) throw new Error("Server responded with " + res.status);

      // Si es booleano directo
      if (typeof json === 'boolean') return json;

      // Si es string con true/false
      if (typeof json === 'string') {
        const s = json.toLowerCase();
        if (s === 'true') return true;
        if (s === 'false') return false;
        // si el servidor devuelve un mensaje tipo "exists" / "taken"
        if (s.includes('exists') || s.includes('taken') || s.includes('ocupado')) return true;
      }

      // Si es objeto, buscar campos comunes
      if (typeof json === 'object' && json !== null) {
        // campos esperados
        if (json.exists !== undefined) return !!json.exists;
        if (json.available !== undefined) return json.available === false; // available:false -> está en uso
        if (json.taken !== undefined) return !!json.taken;
        if (json.count !== undefined) return Number(json.count) > 0;
        if (json.user || json.username) return true; // devolvió el usuario encontrado
        if (Array.isArray(json) && json.length > 0) return true;
        // revisar cualquier propiedad que parezca indicar existencia
        for (const k of Object.keys(json)) {
          const v = String(json[k]).toLowerCase();
          if (v === 'true' || v === 'false') {
            if (v === 'true') return true;
          }
          if (v.includes('exists') || v.includes('taken') || v.includes('ocupado')) return true;
        }
      }

      // por defecto asumimos que NO existe (no queremos bloquear por formato desconocido)
      return false;
    } catch (err) {
      console.error("Error en checkAvailability:", err);
      // null = error de comunicación; el caller puede diferenciarlo
      return null;
    }
  }

  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = signupForm.querySelector('input[name="username"]').value.trim();
    const email = signupForm.querySelector('input[name="email"]').value.trim();
    const password = signupForm.querySelector('input[name="password"]').value.trim();
    const confirmPassword = signupForm.querySelector('input[name="confirm_password"]').value.trim();
    const age = signupForm.querySelector('input[name="edad"]').value;

    if (!username || !email || !password || !confirmPassword || !age) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (!validarEmail(email)) {
      alert("Ingresá un email válido.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 25) {
      alert("La edad debe estar entre 12 y 25 años.");
      return;
    }

    try {
      const userCheck = await checkAvailability(`http://localhost:5000/api/check-username?username=${encodeURIComponent(username)}`);
      if (userCheck === true) { alert("Ese nombre de usuario ya está en uso."); return; }
      if (userCheck === null) { alert("No se pudo verificar el nombre de usuario. Revisá el servidor (ver consola)."); return; }

      const emailCheck = await checkAvailability(`http://localhost:5000/api/check-email?email=${encodeURIComponent(email)}`);
      if (emailCheck === true) { alert("Ese email ya está en uso."); return; }
      if (emailCheck === null) { alert("No se pudo verificar el email. Revisá el servidor (ver consola)."); return; }

      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, edad: ageNum })
      });

      const data = await res.json();
      if (!res.ok || !data.mensaje) {
        alert(data.error || "Error al registrarse.");
        return;
      }

      alert("¡Registro exitoso! Ahora iniciá sesión.");
      signupForm.reset();
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = loginForm.querySelector('input[name="username"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!username || !password) {
      alert("Completa ambos campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("clubex_username", username);
        alert("¡Sesión iniciada!");
        window.location.href = "/html/mundo.html";
      } else {
        alert(data.error || "Credenciales incorrectas.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    }
  });

  // Borra los formularios si el usuario vuelve con el botón "atrás"
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      signupForm?.reset();
      loginForm?.reset();
    }
  });
});

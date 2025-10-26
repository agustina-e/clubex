document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

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

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 25) {
      alert("La edad debe estar entre 12 y 25 años.");
      return;
    }

    try {
      // Check username availability
      const checkUser = await fetch(`http://localhost:5000/api/check-username?username=${encodeURIComponent(username)}`);
      const userExists = await checkUser.json();

      if (userExists.exists) {
        alert("Ese nombre de usuario ya está en uso.");
        return;
      }

      // Check email availability
      const checkEmail = await fetch(`http://localhost:5000/api/check-email?email=${encodeURIComponent(email)}`);
      const emailExists = await checkEmail.json();

      if (emailExists.exists) {
        alert("Ese email ya está en uso.");
        return;
      }

      // Submit registration request
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
        // Guardamos el username para el mundo
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
});

  // Borra los formularios si el usuario vuelve con el botón "atrás"
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      signupForm?.reset();
      loginForm?.reset();
    }
  });
  


// game.js
async function cargarEstadoTamagotchi() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/tamagotchi/estado");
    if (!respuesta.ok) throw new Error("No se pudo obtener el estado del Tamagotchi");
    const data = await respuesta.json();

    console.log("🐱 Estado del Tamagotchi:", data);

    // Ejemplo de actualización del HUD (ajustá los IDs a los que tengas en tu HTML)
    document.getElementById("nombre").textContent = data.nombre;
    document.getElementById("vida").textContent = data.vida;
    document.getElementById("hambre").textContent = data.hambre;
    document.getElementById("sed").textContent = data.sed;
    document.getElementById("aburrimiento").textContent = data.aburrimiento;
    document.getElementById("monedas").textContent = data.monedas;

  } catch (error) {
    console.error("Error al cargar el estado del Tamagotchi:", error);
  }
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", cargarEstadoTamagotchi);

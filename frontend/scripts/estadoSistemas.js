// frontend/scripts/estadoSistemas.js
window.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:5000/estado-sistemas")
    .then(response => response.json())
    .then(data => {
      if (data.flask) {
        console.log("✅ Flask está funcionando correctamente.");
        mostrarEstado("🟢 Flask OK");
      } else {
        console.log("❌ Flask no está funcionando.");
        mostrarEstado("🔴 Flask falló");
      }
    })
    .catch(error => {
      console.error("Error al obtener el estado de los servicios:", error);
      mostrarEstado("🔴 Error de conexión");
    });
});

function mostrarEstado(mensaje) {
  const estadoDiv = document.createElement("div");
  estadoDiv.style.position = "fixed";
  estadoDiv.style.bottom = "10px";
  estadoDiv.style.right = "10px";
  estadoDiv.style.background = "#222";
  estadoDiv.style.color = "#fff";
  estadoDiv.style.padding = "10px 20px";
  estadoDiv.style.borderRadius = "8px";
  estadoDiv.style.fontSize = "14px";
  estadoDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  estadoDiv.textContent = mensaje;
  document.body.appendChild(estadoDiv);
}

  
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sequelize from "./database/sequelize.js";
import userRoutes from "./routes/userRoutes.js";
import tamagotchiRoutes from "./routes/tamagotchiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas API
app.use("/api/users", userRoutes);
app.use("/api/tamagotchi", tamagotchiRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend/html")));
app.use("/styles", express.static(path.join(__dirname, "../frontend/styles")));
app.use("/scripts", express.static(path.join(__dirname, "../frontend/scripts")));
app.use("/img", express.static(path.join(__dirname, "../frontend/img")));

// Rutas de frontend
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/html/index.html")));
app.get("/index", (req, res) => res.sendFile(path.join(__dirname, "../frontend/html/index.html")));

// Iniciar servidor
sequelize.sync().then(() => {
  console.log("📦 Base de datos sincronizada");
  app.listen(port, () => console.log(`🚀 Servidor escuchando en http://localhost:${port}`));
});

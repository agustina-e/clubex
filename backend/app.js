import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import userRoutes from "./routes/userRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🔧 Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());  // Esta línea permite las peticiones desde cualquier origen


// Configuración de Sequelize y SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
});

const Tamagotchi = sequelize.define('Tamagotchi', {
    hambre: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    sed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    aburrimiento: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    vida: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    monedas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo',
    },
});

sequelize.sync()
    .then(() => console.log('📦 Base de datos SQLite sincronizada'))
    .catch((err) => console.log('❌ Error al sincronizar la base de datos:', err));

app.use(express.json());
app.use("/api/users", userRoutes);

// 🌐 Servir archivos estáticos desde frontend/html
app.use(express.static(path.join(__dirname, "../frontend/html")));
app.use("/styles", express.static(path.join(__dirname, "../frontend/styles")));
app.use("/scripts", express.static(path.join(__dirname, "../frontend/scripts")));
app.use("/img", express.static(path.join(__dirname, "../frontend/img")));

// 🏠 Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});


// 📊 Ruta para obtener el estado del Tamagotchi
app.get('/estado', async (req, res) => {
    try {
        const tamagotchi = await Tamagotchi.findOne();
        if (!tamagotchi) {
            return res.status(404).json({ mensaje: 'No se encontró el Tamagotchi' });
        }
        res.json(tamagotchi);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el estado del Tamagotchi', error });
    }
});

// 💾 Ruta para guardar el estado
app.post('/guardar', async (req, res) => {
    const { hambre, sed, aburrimiento, vida, monedas, estado } = req.body;

    try {
        const tamagotchi = await Tamagotchi.create({
            hambre,
            sed,
            aburrimiento,
            vida,
            monedas,
            estado,
        });

        res.json({ mensaje: 'Estado del Tamagotchi guardado', tamagotchi });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al guardar el estado', error });
    }
});

// ➕ Ruta para crear un nuevo Tamagotchi
app.post('/crear', async (req, res) => {
    try {
        const tamagotchiData = req.body;
        const nuevoTamagotchi = await Tamagotchi.create(tamagotchiData);
        res.status(201).json({ mensaje: 'Tamagotchi creado exitosamente', tamagotchi: nuevoTamagotchi });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el Tamagotchi', error: error.message });
    }
});

// 🧪 Ruta para verificar estado de los servicios
// app.get("/estado-sistemas", async (req, res) => {
//     const estados = { flask: false };

//     try {
//         const response = await fetch("http://localhost:5000/ping"); ///ping
//         const json = await response.json();
//         estados.flask = json.success === true;
//     } catch (err) {}

//     res.send(`
//         <h2>Estado de los servicios</h2>
//         <ul>
//             <li>Flask (Tamagotchi): ${estados.flask ? "🟢 OK" : "🔴 Error"}</li>
//         </ul>
//         <p><a href="/">⬅ Volver al inicio</a></p>
//     `);
// });

app.listen(port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

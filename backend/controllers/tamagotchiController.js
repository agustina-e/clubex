// backend/controllers/tamagotchiController.js
import Tamagotchi from "../models/tamagotchiModel.js";

export const getEstado = async (req, res) => {
  try {
    const tamagotchi = await Tamagotchi.findOne();
    if (!tamagotchi) return res.status(404).json({ mensaje: "No se encontró el Tamagotchi" });
    res.json(tamagotchi);
  } catch (e) {
    console.error("getEstado error:", e);
    res.status(500).json({ mensaje: "Error al obtener el estado", error: e.message });
  }
};

export const guardarEstado = async (req, res) => {
  try {
    const nuevo = await Tamagotchi.create(req.body);
    res.json({ mensaje: "Estado guardado", tamagotchi: nuevo });
  } catch (e) {
    console.error("guardarEstado error:", e);
    res.status(500).json({ mensaje: "Error al guardar el estado", error: e.message });
  }
};

export const crearTamagotchi = async (req, res) => {
  try {
    const nuevo = await Tamagotchi.create(req.body);
    res.status(201).json({ mensaje: "Tamagotchi creado exitosamente", tamagotchi: nuevo });
  } catch (e) {
    console.error("crearTamagotchi error:", e);
    res.status(500).json({ mensaje: "Error al crear el Tamagotchi", error: e.message });
  }
};

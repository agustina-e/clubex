import express from "express";
import { getEstado, guardarEstado, crearTamagotchi } from "../controllers/tamagotchiController.js";
const router = express.Router();

router.get("/estado", getEstado);
router.post("/guardar", guardarEstado);
router.post("/crear", crearTamagotchi);

export default router;

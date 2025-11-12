import Tamagotchi from "../models/tamagotchiModel.js";

export const obtenerEstado = async () => {
  const tamagotchi = await Tamagotchi.findOne();
  return tamagotchi;
};

export const crearTamagotchi = async (data) => {
  const nuevo = await Tamagotchi.create(data);
  return nuevo;
};

export const guardarEstado = async (data) => {
  const tamagotchi = await Tamagotchi.create(data);
  return tamagotchi;
};

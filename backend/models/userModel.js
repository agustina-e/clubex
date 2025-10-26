import sequelize from '../sequelize.js';
import Tamagotchi from './tamagotchiModel.js';

async function actualizarTamagotchis() {
  try {
    await sequelize.sync();

    const tamagotchis = await Tamagotchi.findAll();
    const ahora = new Date();

    for (const t of tamagotchis) {
      const horasDesdeCreacion = (ahora - new Date(t.fechaCreacion)) / (1000 * 60 * 60);
      const incremento = Math.floor(horasDesdeCreacion);

      t.hambre += incremento * 2;
      t.sed += incremento * 2;

      const incrementoAburrimiento = Math.floor(horasDesdeCreacion / 3);
      t.aburrimiento += incrementoAburrimiento * 5;

      if (t.hambre > 50 || t.sed > 50) {
        t.vida -= 5;
      }

      if (t.vida <= 0 && t.estado === 'vivo') {
        t.estado = 'en coma';
        t.fechaComa = ahora;
      } else if (t.estado === 'en coma' && t.fechaComa && !t.fechaRecuperacion) {
        const horasEnComa = (ahora - new Date(t.fechaComa)) / (1000 * 60 * 60);
        if (horasEnComa >= 3) {
          // Avisa que puede revivir
          console.log(`💬 Tamagotchi ${t.id} puede ser revivido`);
        }
      } else if (t.estado === 'recuperacion' && t.fechaRecuperacion) {
        const horasRecuperacion = (ahora - new Date(t.fechaRecuperacion)) / (1000 * 60 * 60);
        if (horasRecuperacion >= 5) {
          t.estado = 'vivo';
          t.vida = 100;
          t.hambre = 0;
          t.sed = 0;
          t.aburrimiento = 30;
        }
      }

      await t.save();
      console.log(`✅ Tamagotchi actualizado: ${t.nombre}`);
    }

    console.log('🔁 Actualización completada');
    process.exit();
  } catch (error) {
    console.error('❌ Error en cron:', error);
    process.exit(1);
  }
}

actualizarTamagotchis();


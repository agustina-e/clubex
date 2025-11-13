// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('./config');

// // Definimos el modelo Tamagotchi con Sequelize
// const Tamagotchi = sequelize.define('Tamagotchi', {
//     hambre: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     sed: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     aburrimiento: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     vida: {
//         type: DataTypes.INTEGER,
//         defaultValue: 100,
//     },
//     monedas: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     estado: {
//         type: DataTypes.STRING,
//         defaultValue: 'activo', // Activo, Coma, Recuperación
//     },
//     fechaCreacion: {
//         type: DataTypes.DATE,
//         defaultValue: Sequelize.NOW,
//     },
//     fechaComa: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     fechaRecuperacion: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     }
// });

// // Conexión y ejecución de la actualización de Tamagotchis
// sequelize.sync()
//     .then(() => {
//         console.log('🟢 Conectado a la base de datos SQLite');
//         // Ejecutar la actualización de Tamagotchis de inmediato
//         actualizarTamagotchis();

//         // Configuramos el setInterval para ejecutar la función cada 60 minutos (1 hora)
//         setInterval(actualizarTamagotchis, 3600000); // 3600000ms = 1 hora
//     })
//     .catch(err => {
//         console.error('🔴 Error al conectar a la base de datos:', err);
//     });

// // Función que actualiza todos los Tamagotchis
// async function actualizarTamagotchis() {
//     try {
//         const tamagotchis = await Tamagotchi.findAll();
//         const ahora = new Date();

//         for (const t of tamagotchis) {
//             const horasDesdeCreacion = (ahora - t.fechaCreacion) / (1000 * 60 * 60);

//             // Actualización de hambre y sed cada hora (2 puntos por hora)
//             const incremento = Math.floor(horasDesdeCreacion);
//             t.hambre += incremento * 2;
//             t.sed += incremento * 2;

//             // Aburrimiento cada 3 horas (5 puntos cada 3 horas)
//             const incrementoAburrimiento = Math.floor(horasDesdeCreacion / 3);
//             t.aburrimiento += incrementoAburrimiento * 5;

//             // Baja de vida si hambre o sed son mayores a 50
//             if (t.hambre > 50 || t.sed > 50) {
//                 t.vida -= 5;
//             }

//             // Si la vida baja a 0 y está vivo, pasa a "en coma"
//             if (t.vida <= 0 && t.estado === 'activo') {
//                 t.estado = 'en coma';
//                 t.fechaComa = ahora;
//                 console.log(`💀 Tamagotchi ${t.id} ha entrado en coma`);
//             }

//             // Si está en coma y pasaron 3 horas, puede revivir si paga
//             else if (t.estado === 'en coma' && t.fechaComa && !t.fechaRecuperacion) {
//                 const horasEnComa = (ahora - t.fechaComa) / (1000 * 60 * 60);

//                 if (horasEnComa >= 3) {
//                     console.log(`💬 Tamagotchi ${t.id} puede ser revivido. Esperando confirmación del jugador para pagar hospital.`);
//                     // No hacemos nada todavía. Aquí deberías mostrar el mensaje en el frontend.
//                 }
//             }

//             // Si está en recuperación y pasaron 5 horas, se cura
//             else if (t.estado === 'recuperacion' && t.fechaRecuperacion) {
//                 const horasRecuperacion = (ahora - t.fechaRecuperacion) / (1000 * 60 * 60);
//                 if (horasRecuperacion >= 5) {
//                     t.estado = 'activo';
//                     t.vida = 100;
//                     t.hambre = 0;
//                     t.sed = 0;
//                     t.aburrimiento = 30;
//                     console.log(`💚 Tamagotchi ${t.id} ha salido de recuperación`);
//                 }
//             }

//             await t.save();
//             console.log(`✅ Tamagotchi actualizado: ${t.id}`);
//         }

//         console.log('✅ Todos los Tamagotchis han sido actualizados.');
//     } catch (error) {
//         console.error('❌ Error actualizando Tamagotchis:', error);
//     }
// }
// ...existing code...
const path = require('path');
const { Sequelize: Seq, DataTypes } = require('sequelize');

let sequelize;
let TamagotchiModel;

// Intentar reutilizar la configuración / modelos del backend (ajusta la ruta si tu proyecto exporta distinto)
try {
  // Muchos proyectos exportan un objeto desde backend/models o backend/index
  const projectModels = require('../models'); // prueba 1
  if (projectModels && projectModels.sequelize) sequelize = projectModels.sequelize;
  if (projectModels && projectModels.Tamagotchi) TamagotchiModel = projectModels.Tamagotchi;
} catch (err) {
  // ignore
}

if (!sequelize) {
  try {
    const cfg = require('../config'); // prueba 2: si tenés un módulo config que exporta sequelize
    if (cfg && cfg.sequelize) sequelize = cfg.sequelize;
  } catch (err) {
    // ignore
  }
}

// Si no encontró ninguna instancia, crea una local (fallback)
if (!sequelize) {
  sequelize = new Seq({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
  console.log('⚠️ Cron: usando conexión fallback SQLite en backend/database.sqlite');
}

// Si no existe el modelo importado, definilo localmente
if (!TamagotchiModel) {
  TamagotchiModel = sequelize.define('Tamagotchi', {
    hambre: { type: DataTypes.INTEGER, defaultValue: 0 },
    sed: { type: DataTypes.INTEGER, defaultValue: 0 },
    aburrimiento: { type: DataTypes.INTEGER, defaultValue: 0 },
    vida: { type: DataTypes.INTEGER, defaultValue: 100 },
    monedas: { type: DataTypes.INTEGER, defaultValue: 0 },
    estado: { type: DataTypes.STRING, defaultValue: 'activo' },
    fechaCreacion: { type: DataTypes.DATE, defaultValue: Seq.NOW },
    fechaComa: { type: DataTypes.DATE, allowNull: true },
    fechaRecuperacion: { type: DataTypes.DATE, allowNull: true }
  });
  console.log('⚠️ Cron: modelo Tamagotchi definido localmente (fallback).');
}

// Conexión y ejecución de la actualización de Tamagotchis
sequelize.sync()
  .then(() => {
    console.log('🟢 Conectado a la base de datos (cron)');
    actualizarTamagotchis();
    // Ejecutar cada hora
    setInterval(actualizarTamagotchis, 3600000);
  })
  .catch(err => {
    console.error('🔴 Error al conectar a la base de datos (cron):', err);
  });

// Función que actualiza todos los Tamagotchis
async function actualizarTamagotchis() {
  try {
    const tamagotchis = await TamagotchiModel.findAll();
    const ahora = new Date();

    for (const t of tamagotchis) {
      const horasDesdeCreacion = (ahora - t.fechaCreacion) / (1000 * 60 * 60);

      const incremento = Math.floor(horasDesdeCreacion);
      t.hambre = (t.hambre || 0) + incremento * 2;
      t.sed = (t.sed || 0) + incremento * 2;

      const incrementoAburrimiento = Math.floor(horasDesdeCreacion / 3);
      t.aburrimiento = (t.aburrimiento || 0) + incrementoAburrimiento * 5;

      if (t.hambre > 50 || t.sed > 50) {
        t.vida = (t.vida || 0) - 5;
      }

      if (t.vida <= 0 && t.estado === 'activo') {
        t.estado = 'en coma';
        t.fechaComa = ahora;
        console.log(`💀 Tamagotchi ${t.id} ha entrado en coma`);
      } else if (t.estado === 'en coma' && t.fechaComa && !t.fechaRecuperacion) {
        const horasEnComa = (ahora - t.fechaComa) / (1000 * 60 * 60);
        if (horasEnComa >= 3) {
          console.log(`💬 Tamagotchi ${t.id} puede ser revivido. Esperando confirmación del jugador.`);
        }
      } else if (t.estado === 'recuperacion' && t.fechaRecuperacion) {
        const horasRecuperacion = (ahora - t.fechaRecuperacion) / (1000 * 60 * 60);
        if (horasRecuperacion >= 5) {
          t.estado = 'activo';
          t.vida = 100;
          t.hambre = 0;
          t.sed = 0;
          t.aburrimiento = 30;
          console.log(`💚 Tamagotchi ${t.id} ha salido de recuperación`);
        }
      }

      await t.save();
      console.log(`✅ Tamagotchi actualizado: ${t.id}`);
    }

    console.log('✅ Todos los Tamagotchis han sido actualizados.');
  } catch (error) {
    console.error('❌ Error actualizando Tamagotchis:', error);
  }
}
const { Sequelize } = require('sequelize');

// Configuración de Sequelize para SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Ruta al archivo SQLite
});

sequelize.authenticate()
    .then(() => console.log('🟢 Conexión exitosa con la base de datos SQLite'))
    .catch(err => console.log('🔴 Error en la conexión con la base de datos:', err));

module.exports = sequelize;

import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Esto reemplaza __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base de datos SQLite guardada en /data/tamagotchis.db
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/tamagotchis.db'),
  logging: false
});

export default sequelize;

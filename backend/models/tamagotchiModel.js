import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const Tamagotchi = sequelize.define('Tamagotchi', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  hambre: { type: DataTypes.INTEGER, defaultValue: 0 },
  sed: { type: DataTypes.INTEGER, defaultValue: 0 },
  aburrimiento: { type: DataTypes.INTEGER, defaultValue: 30 },
  vida: { type: DataTypes.INTEGER, defaultValue: 100 },
  estado: { type: DataTypes.STRING, defaultValue: 'vivo' },
  monedas: { type: DataTypes.INTEGER, defaultValue: 0 },
  fechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fechaComa: { type: DataTypes.DATE, allowNull: true },
  fechaRecuperacion: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'tamagotchis',
  timestamps: false
});

export default Tamagotchi;

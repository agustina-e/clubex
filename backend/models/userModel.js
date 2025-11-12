// backend/models/userModel.js
import { DataTypes } from "sequelize";
import sequelize from "../database/sequelize.js";

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, unique: true },
  edad: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: "users",
  timestamps: true
});

export default User;

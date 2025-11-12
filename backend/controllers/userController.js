// backend/controllers/userController.js
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

/**
 * Registro de usuario
 */
export const register = async (req, res) => {
  const { username, password, email, edad } = req.body;

  try {
    if (edad < 12 || edad > 25) {
      return res.json({ success: false, message: "La edad debe estar entre 12 y 25 años." });
    }

    // Verificar usuario y email existentes (Sequelize)
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.json({ success: false, message: "Ese nombre de usuario ya está en uso." });
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.json({ success: false, message: "Ese email ya está en uso." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, password: hashedPassword, email, edad });
    return res.json({ success: true, message: "Registro exitoso", user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ success: false, message: "Error al registrar usuario." });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Contraseña incorrecta." });
    }

    // TODO: aquí podés emitir un token JWT si querés más adelante
    return res.json({ success: true, message: "Login exitoso", user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ success: false, message: "Error al iniciar sesión." });
  }
};

/**
 * Check username (consulta por query ?username=)
 */
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ where: { username } });
    res.json({ exists: !!user });
  } catch (e) {
    console.error("checkUsername error:", e);
    res.status(500).json({ exists: false });
  }
};

/**
 * Check email (consulta por query ?email=)
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ where: { email } });
    res.json({ exists: !!user });
  } catch (e) {
    console.error("checkEmail error:", e);
    res.status(500).json({ exists: false });
  }
};

import "../models/userModel.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    const { username, password, email, edad } = req.body;

    try {
        if (edad < 12 || edad > 25) {
            return res.json({ success: false, message: "La edad debe estar entre 12 y 25 años." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: "Ese nombre de usuario ya está en uso." });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.json({ success: false, message: "Ese email ya está en uso." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, email, edad });
        await newUser.save();
        res.json({ success: true, message: "Registro exitoso" });
    } catch (error) {
        res.json({ success: false, message: "Error al registrar usuario." });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, message: "Usuario no encontrado." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.json({ success: false, message: "Contraseña incorrecta." });
        }

        res.json({ success: true, message: "Login exitoso" });
    } catch (error) {
        res.json({ success: false, message: "Error al iniciar sesión." });
    }
};

export const checkUsername = async (req, res) => {
    const { username } = req.query;
    const user = await User.findOne({ username });
    res.json({ exists: !!user });
};

export const checkEmail = async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
};

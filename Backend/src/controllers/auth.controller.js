const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const register = async (req, res) => {
    try {
        const {email, username, password } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({email, username, password: hashedPassword });
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};

module.exports = {
    register,
    login,
    logout
};
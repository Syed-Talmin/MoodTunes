const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const router = express.Router()

const { register, login, logout } = require("../controllers/auth.controller")

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/user", authMiddleware, (req, res) => res.json(req.user))


module.exports = router

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'

const router = express.Router()

// ===============================
// 🛠 CREATE DEFAULT ADMIN (run once)
// ===============================
router.post('/setup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const exists = await adminModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: "Admin already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = new adminModel({ name, email, password: hashedPassword })
    await admin.save()

    res.json({ success: true, message: "Admin created successfully" })
  } catch (error) {
    console.error("Setup admin error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ===============================
// 🔑 ADMIN LOGIN
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await adminModel.findOne({ email })
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" })

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" })

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ===============================
// 🔐 ADMIN TOKEN VERIFICATION
// ===============================
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" })

    const token = authHeader.split(" ")[1] // Expect: "Bearer <token>"
    if (!token) return res.status(401).json({ success: false, message: "Invalid token format" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const admin = await adminModel.findById(decoded.id).select('-password')

    if (!admin) return res.status(401).json({ success: false, message: "Admin not found" })

    res.json({ success: true, admin })
  } catch (error) {
    console.error("Verify token error:", error)
    res.status(401).json({ success: false, message: "Invalid or expired token" })
  }
})

export default router
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'

const router = express.Router()

// Create default admin (run once)
router.post('/setup', async (req, res) => {
    try {
        const { email, password, name } = req.body
        
        // Check if admin exists
        const exists = await adminModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "Admin already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create admin
        const admin = new adminModel({
            name,
            email,
            password: hashedPassword
        })

        await admin.save()
        res.json({ success: true, message: "Admin created successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if admin exists
        const admin = await adminModel.findOne({ email })
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }

        // Create token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// Verify admin token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.token
        if (!token) {
            return res.status(401).json({ success: false, message: "No token" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await adminModel.findById(decoded.id).select('-password')
        
        if (!admin) {
            return res.status(401).json({ success: false, message: "Admin not found" })
        }

        res.json({ success: true, admin })
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" })
    }
})

export default router
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import restaurantModel from '../models/restaurantModel.js'

const router = express.Router()

// Middleware to verify admin token
const adminAuth = (req, res, next) => {
    const token = req.headers.token
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.adminId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" })
    }
}

// GET all restaurants
router.get('/restaurants', adminAuth, async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({}).sort('-createdAt')
        res.json({ 
            success: true, 
            restaurants 
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

// POST add new restaurant
router.post('/restaurants', adminAuth, async (req, res) => {
    try {
        const { name, email, password, phone, address, cuisineTypes } = req.body

        // Check if restaurant exists
        const exists = await restaurantModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant already exists" 
            })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create restaurant
        const restaurant = new restaurantModel({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            cuisineTypes: cuisineTypes || []
        })

        await restaurant.save()

        res.status(201).json({ 
            success: true, 
            message: "Restaurant created successfully",
            restaurant 
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

// PUT update restaurant
router.put('/restaurants/:id', adminAuth, async (req, res) => {
    try {
        const { name, email, password, phone, address, cuisineTypes, isActive } = req.body
        const updateData = { name, email, phone, address, cuisineTypes, isActive }

        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10)
            updateData.password = await bcrypt.hash(password, salt)
        }

        const restaurant = await restaurantModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: "Restaurant not found" 
            })
        }

        res.json({ 
            success: true, 
            message: "Restaurant updated successfully",
            restaurant 
        })

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

// DELETE restaurant
router.delete('/restaurants/:id', adminAuth, async (req, res) => {
    try {
        const restaurant = await restaurantModel.findByIdAndDelete(req.params.id)
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: "Restaurant not found" 
            })
        }

        res.json({ 
            success: true, 
            message: "Restaurant deleted successfully" 
        })

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

// PUT toggle restaurant status
router.put('/restaurants/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body
        const restaurant = await restaurantModel.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        )

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: "Restaurant not found" 
            })
        }

        res.json({ 
            success: true, 
            message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
            restaurant 
        })

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

export default router
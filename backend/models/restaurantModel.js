import mongoose from 'mongoose'

const restaurantSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    cuisineTypes: [{ 
        type: String 
    }],
    logo: { 
        type: String,
        default: 'default-restaurant-logo.png'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema)
export default restaurantModel
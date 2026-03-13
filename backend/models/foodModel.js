import mongoose from 'mongoose'

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    
    // NEW FIELD - Link food to a restaurant
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',  // References the restaurant model
        required: true
    }
})

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)
export default foodModel
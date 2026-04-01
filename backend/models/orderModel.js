import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [{
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        restaurantId: { type: String, required: false },
        restaurantName: { type: String }
    }],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    // ✅ ADD THESE NEW FIELDS
    paymentMethod: { 
        type: String, 
        enum: ['paypal', 'cash', 'mpesa'],
        default: 'cash' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['paid', 'pending', 'failed'],
        default: 'pending' 
    },
    paymentDetails: {
        transactionId: { type: String },
        email: { type: String },
        fee: { type: Number }
    }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
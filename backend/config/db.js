import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://manumallu81:2024Mallu@cluster0.i7leh.mongodb.net/food-delivery-app').then(()=>console.log("DB Connected"));
}

/*export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://collinskiptoo:<Password10>@foodcluster.2mkw3er.mongodb.net/?retryWrites=true&w=majority&appName=FoodCluster')
    }*/
/*import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://manumallu81:2024Mallu@cluster0.i7leh.mongodb.net/food-delivery-app').then(()=>console.log("DB Connected"));
}
*/

import mongoose from "mongoose";
import 'dotenv/config';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit the app if DB connection fails
  }
};


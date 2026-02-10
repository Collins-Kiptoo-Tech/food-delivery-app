import 'dotenv/config';
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"




//app config
const app = express()
const port = 4000

//middleware 
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
})) // Enable CORS for your React app

//app.get()-http method, used to request the data from server 
app.get("/",(req,res)=>{
    res.send("API Working")
}) 

//db connection
connectDB();

//api endpoints
app.use('/api/food',foodRouter);
app.use("/uploads", express.static("uploads"));
app.use('/api/user',userRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)



//run server
app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
    console.log(`📱 M-Pesa API available at: http://localhost:${port}/api/mpesa/stkpush`)
})

//mongodb+srv://manumallu81:2024Mallu@cluster0.i7leh.mongodb.net/?
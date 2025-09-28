import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
//app config
const app = express()
const port = 4000

//middleware 
app.use(express.json())//whenever we get request from frontend to backend that will be passed using middleware express.json()
app.use(cors())//connect backend and frontend to access.

//app.get()-http method, used to request the data from server 
app.get("/",(req,res)=>{
    res.send("API Working")
}) 

//db connection
connectDB();

//api endpoints
app.use('/api/food',foodRouter);
app.use("/images",express.static('uploads'))
app.use('/api/user',userRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

//run server
app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

//mongodb+srv://manumallu81:2024Mallu@cluster0.i7leh.mongodb.net/?
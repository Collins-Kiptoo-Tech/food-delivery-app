//import orderModel from "../models/orderModel.js";
//import userModel from '../models/userModel.js';
//import Stripe from 'stripe'
//import axios from "axios";
//import dotenv from "dotenv";

/*const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)




//placing user order for frontend
const placeOrder = async (req,res) => {

    const frontend_url = 'https://mern-food-delivery-frontend-xb9s.onrender.com/'

   try{
     const newOrder = new orderModel({
        userId:req.body.userId,
        items:req.body.items,
        amount:req.body.amount,
        address:req.body.address
     })
     await newOrder.save();
     await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

     const customer = await stripe.customers.create({
      name: req.body.address.name, // Assuming req.body.address contains name
      address: {
        line1: req.body.address.line1,
        postal_code: req.body.address.postal_code,
        city: req.body.address.city,
        state: req.body.address.state,
        country: req.body.address.country
      },
    });

     const line_items = req.body.items.map((item)=>({
        price_data:{
            currency:"kes",
            product_data:{
                name:item.name,
            },
            unit_amount:item.price*100*1//80
        },
        quantity:item.quantity
     }))

     line_items.push({
        price_data:{
            currency:"kes",
            product_data:{
                name:"Delivery Charges"
            },
            unit_amount:2*100*1//80
        },
        quantity:1
     });


     // Step 3: Create a payment intent
  
 
     const session = await stripe.checkout.sessions.create({
        line_items:line_items,
        mode:'payment',
        customer: customer.id, // Link the customer to the checkout session
        shipping_address_collection: {
        allowed_countries: ['KE',]  // Specify allowed countries
        },
        success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
     }) 
     res.json({success:true,session_url:session.url})
   }catch(error){
     console.log(error);
     res.json({success:false,message:"Error"})
   }
}

const verifyOrder = async (req,res) => {
      const {orderId,success} = req.body;
      try{
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
      } catch(error){
            console.log(error);
            res.json({success:false,message:"Error"})
      }
}

//user orders for frontend
const userOrders = async (req,res) => {
  try{

     const orders = await orderModel.find({userId:req.body.userId})
     res.json({success:true,data:orders})

  } catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

//Listing orders for admin panel
const listOrders = async(req,res) => {
    try{
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
    }
}

//api for updating order status
const updateStatus = async (req,res) => {
   try{
     await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
     res.json({success:true,message:"Status updated"})
   }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
   }
}

export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}*/


import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Generate M-Pesa access token
const generateToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

// Place order with M-Pesa payment
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Clear cart after placing order
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // M-Pesa STK Push
    const token = await generateToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: req.body.amount,
        PartyA: req.body.phone, // Customer phone number (2547XXXXXXXX)
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: req.body.phone,
        CallBackURL: `${process.env.BACKEND_URL}/api/order/mpesa/callback`,
        AccountReference: "FoodDelivery",
        TransactionDesc: "Payment for food order",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      success: true,
      orderId: newOrder._id,
      mpesaResponse: response.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({ success: false, message: "Error placing order" });
  }
};

// Callback to verify payment
const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;

    if (Body.stkCallback.ResultCode === 0) {
      const checkoutRequestID = Body.stkCallback.CheckoutRequestID;

      // Find the order linked to this transaction (you can store checkoutRequestID in DB if needed)
      // For now, we just mark it paid for testing
      await orderModel.findOneAndUpdate(
        { _id: req.query.orderId }, // match orderId
        { payment: true }
      );

      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error in callback" });
  }
};

// Get user orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// List all orders (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Update order status (admin)
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, mpesaCallback, userOrders, listOrders, updateStatus };


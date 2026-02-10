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
import jwt from "jsonwebtoken";

dotenv.config();

// Helper to extract user ID from token
const getUserIdFromToken = (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

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
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Invalid token" 
      });
    }

    const newOrder = new orderModel({
      userId: userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      status: "Food Processing",
      payment: false,
      date: new Date()
    });
    
    await newOrder.save();

    // Clear cart after placing order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // If M-Pesa payment
    if (req.body.paymentMethod === "mpesa") {
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
          PartyA: req.body.phone,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: req.body.phone,
          CallBackURL: `${process.env.BACKEND_URL}/api/order/mpesa/callback?orderId=${newOrder._id}`,
          AccountReference: "FoodDelivery",
          TransactionDesc: "Payment for food order",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.json({
        success: true,
        orderId: newOrder._id,
        mpesaResponse: response.data,
        message: "Order placed. Please complete M-Pesa payment."
      });
    }

    // For cash on delivery
    res.json({
      success: true,
      orderId: newOrder._id,
      message: "Order placed successfully!"
    });

  } catch (error) {
    console.error("Place order error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error placing order",
      error: error.message 
    });
  }
};

// Callback to verify payment
const mpesaCallback = async (req, res) => {
  try {
    console.log("MPESA Callback received:", req.body);
    const { Body } = req.body;
    const { orderId } = req.query;

    if (Body.stkCallback.ResultCode === 0) {
      // Update order payment status
      await orderModel.findByIdAndUpdate(
        orderId,
        { 
          payment: true,
          status: "Processing"
        }
      );

      console.log(`✅ Payment successful for order: ${orderId}`);
      
      // Send success response to M-Pesa
      res.json({ 
        ResultCode: 0, 
        ResultDesc: "Success" 
      });
    } else {
      console.log(`❌ Payment failed for order: ${orderId}`);
      
      await orderModel.findByIdAndUpdate(
        orderId,
        { 
          payment: false,
          status: "Payment Failed"
        }
      );
      
      res.json({ 
        ResultCode: 0, 
        ResultDesc: "Success"
      });
    }
  } catch (error) {
    console.error("Callback error:", error.message);
    res.json({ 
      ResultCode: 0, 
      ResultDesc: "Success"
    });
  }
};

// Get user orders - FIXED FOR YOUR MODEL
const userOrders = async (req, res) => {
  try {
    console.log("📦 Fetching user orders...");
    
    // Get userId from token
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      console.log("❌ No user ID found in token");
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Invalid or missing token" 
      });
    }

    console.log("🔍 Looking for orders with userId:", userId);
    
    // Find orders and sort by latest first
    const orders = await orderModel.find({ userId: userId })
      .sort({ date: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    // If no orders found
    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: "No orders found"
      });
    }
    
    // Format orders to match frontend expectations
    const formattedOrders = orders.map(order => {
      console.log("Processing order:", order._id);
      console.log("Order items type:", typeof order.items);
      console.log("Order items:", order.items);
      
      // Ensure items is an array and has proper structure
      let itemsArray = [];
      if (Array.isArray(order.items)) {
        itemsArray = order.items.map(item => {
          // Handle different item structures
          if (typeof item === 'object') {
            return {
              name: item.name || "Unknown Item",
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image || "",
              _id: item._id || item.itemId || ""
            };
          }
          return {
            name: "Item",
            price: 0,
            quantity: 1,
            image: "",
            _id: ""
          };
        });
      }
      
      return {
        _id: order._id,
        orderId: `#${order._id.toString().slice(-8).toUpperCase()}`,
        items: itemsArray,
        amount: order.amount || 0,
        status: order.status || "Food Processing",
        address: order.address || {},
        payment: order.payment || false,
        createdAt: order.date || order.createdAt || new Date(),
        updatedAt: order.updatedAt || order.date || new Date()
      };
    });
    
    console.log("Formatted orders:", formattedOrders.length);
    
    res.json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders
    });
    
  } catch (error) {
    console.error("❌ Error in userOrders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// List all orders (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
      .sort({ date: -1 });
    
    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (error) {
    console.log("List orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders" 
    });
  }
};

// Update order status (admin)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }
    
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({ 
      success: true, 
      message: "Status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    console.log("Update status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating status" 
    });
  }
};

export { placeOrder, mpesaCallback, userOrders, listOrders, updateStatus };
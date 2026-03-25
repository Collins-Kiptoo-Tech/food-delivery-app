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

// ----------------------------
// Helper: extract user ID from token (supports multiple header formats)
// ----------------------------
const getUserIdFromToken = (req) => {
  try {
    // Try different ways to get the token
    let token = null;
    
    // Method 1: Check Authorization header (Bearer token)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // Method 2: Check direct 'token' header (your frontend uses this)
    if (!token && req.headers['token']) {
      token = req.headers['token'];
    }
    
    // Method 3: Check body for token (fallback)
    if (!token && req.body.token) {
      token = req.body.token;
    }
    
    if (!token) {
      console.log('❌ No token found in headers');
      return null;
    }
    
    console.log('✅ Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded, user ID:', decoded.id);
    return decoded.id;
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return null;
  }
};

// ----------------------------
// Helper: generate M-Pesa token
// ----------------------------
const generateToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error generating M-Pesa token:", error.message);
    throw error;
  }
};

// ----------------------------
// Place Order
// ----------------------------
const placeOrder = async (req, res) => {
  try {
    console.log('\n========== PLACE ORDER DEBUG ==========');
    console.log('Headers received:', JSON.stringify(req.headers, null, 2));
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    
    const userId = getUserIdFromToken(req);
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('❌ No userId found, returning 401');
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please login again" 
      });
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    console.log('✅ User found:', user.email);

    // Validate request body
    const { items, amount, address, paymentMethod, phone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Invalid or missing items');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing items" 
      });
    }
    
    if (!amount || amount <= 0) {
      console.log('❌ Invalid order amount');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order amount" 
      });
    }
    
    if (!address || Object.keys(address).length === 0) {
      console.log('❌ Missing delivery address');
      return res.status(400).json({ 
        success: false, 
        message: "Delivery address is required" 
      });
    }
    
    if (paymentMethod === "mpesa" && (!phone || phone.length < 10)) {
      console.log('❌ Invalid phone number for M-Pesa');
      return res.status(400).json({ 
        success: false, 
        message: "Valid phone number required for M-Pesa" 
      });
    }

    // Process items
    const processedItems = items.map(item => ({
      foodId: item._id || item.foodId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName || "Unknown Restaurant"
    }));

    console.log('Creating order with:', {
      userId,
      itemsCount: processedItems.length,
      amount,
      paymentMethod: paymentMethod || 'COD'
    });

    const newOrder = new orderModel({
      userId,
      items: processedItems,
      amount,
      address,
      status: "Food Processing",
      payment: false,
      date: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log('✅ Order saved successfully, ID:', savedOrder._id);

    // Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    console.log('✅ Cart cleared for user');

    // M-Pesa payment flow
    if (paymentMethod === "mpesa") {
      try {
        console.log('🔄 Processing M-Pesa payment...');
        const mpesaToken = await generateToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
        const password = Buffer.from(
          `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString("base64");

        const mpesaResponse = await axios.post(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/order/mpesa/callback?orderId=${savedOrder._id}`,
            AccountReference: "FoodDelivery",
            TransactionDesc: "Payment for food order"
          },
          { headers: { Authorization: `Bearer ${mpesaToken}` } }
        );

        console.log('✅ M-Pesa STK push initiated');
        console.log('========== PLACE ORDER END ==========\n');

        return res.json({
          success: true,
          orderId: savedOrder._id,
          mpesaResponse: mpesaResponse.data,
          message: "Order placed. Please complete M-Pesa payment on your phone."
        });
      } catch (mpesaError) {
        console.error('❌ M-Pesa error:', mpesaError.response?.data || mpesaError.message);
        // Order is saved but payment failed
        return res.json({
          success: true,
          orderId: savedOrder._id,
          message: "Order placed but payment initiation failed. Please complete payment manually.",
          mpesaError: mpesaError.response?.data || mpesaError.message
        });
      }
    }

    // Cash on Delivery
    console.log('✅ Order placed with COD');
    console.log('========== PLACE ORDER END ==========\n');
    
    res.json({ 
      success: true, 
      orderId: savedOrder._id, 
      message: "Order placed successfully!" 
    });

  } catch (error) {
    console.error('\n========== PLACE ORDER ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========== PLACE ORDER ERROR END ==========\n');
    
    res.status(500).json({ 
      success: false, 
      message: "Error placing order", 
      error: error.message 
    });
  }
};

// ----------------------------
// M-Pesa Callback
// ----------------------------
const mpesaCallback = async (req, res) => {
  try {
    console.log('\n========== M-PESA CALLBACK ==========');
    console.log('Callback body:', JSON.stringify(req.body, null, 2));
    console.log('Query params:', req.query);
    
    const { Body } = req.body;
    const { orderId } = req.query;

    if (!orderId) {
      console.log('❌ No orderId in callback');
      return res.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    if (Body && Body.stkCallback) {
      const { ResultCode, ResultDesc } = Body.stkCallback;
      
      if (ResultCode === 0) {
        await orderModel.findByIdAndUpdate(orderId, { 
          payment: true, 
          status: "Processing" 
        });
        console.log(`✅ Payment successful for order: ${orderId}`);
      } else {
        await orderModel.findByIdAndUpdate(orderId, { 
          payment: false, 
          status: "Payment Failed" 
        });
        console.log(`❌ Payment failed for order: ${orderId} - ${ResultDesc}`);
      }
    }

    console.log('========== M-PESA CALLBACK END ==========\n');
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("❌ Callback error:", error.message);
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// ----------------------------
// Get Orders for Logged-in User
// ----------------------------
const userOrders = async (req, res) => {
  try {
    console.log('\n========== USER ORDERS DEBUG ==========');
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      console.log('❌ No userId found');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log('Fetching orders for user:', userId);
    const orders = await orderModel.find({ userId }).sort({ date: -1 }).lean();

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: `#${order._id.toString().slice(-8).toUpperCase()}`,
      items: Array.isArray(order.items)
        ? order.items.map(item => ({
            _id: item._id || item.foodId || "",
            name: item.name || "Unknown Item",
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || "",
            restaurantId: item.restaurantId || "",
            restaurantName: item.restaurantName || "Unknown"
          }))
        : [],
      amount: order.amount || 0,
      status: order.status || "Food Processing",
      address: order.address || {},
      payment: order.payment || false,
      createdAt: order.date || new Date(),
      updatedAt: order.updatedAt || order.date || new Date()
    }));

    console.log(`✅ Found ${formattedOrders.length} orders`);
    console.log('========== USER ORDERS END ==========\n');

    res.json({ 
      success: true, 
      count: formattedOrders.length, 
      data: formattedOrders 
    });

  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
};

// ----------------------------
// Admin: List all orders
// ----------------------------
const listOrders = async (req, res) => {
  try {
    console.log('Fetching all orders for admin...');
    const orders = await orderModel.find({}).sort({ date: -1 });

    const processedOrders = orders.map(order => {
      const itemsByRestaurant = {};
      order.items.forEach(item => {
        const restId = item.restaurantId || "unknown";
        if (!itemsByRestaurant[restId]) {
          itemsByRestaurant[restId] = { 
            restaurantName: item.restaurantName || "Unknown", 
            items: [] 
          };
        }
        itemsByRestaurant[restId].items.push(item);
      });
      return { ...order.toObject(), itemsByRestaurant };
    });

    console.log(`✅ Found ${processedOrders.length} total orders`);
    res.json({ 
      success: true, 
      count: processedOrders.length, 
      data: processedOrders 
    });

  } catch (error) {
    console.error("❌ List orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders" 
    });
  }
};

// ----------------------------
// Admin: Get Orders by Restaurant
// ----------------------------
const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`Fetching orders for restaurant: ${restaurantId}`);
    
    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: "Restaurant ID required" 
      });
    }

    const orders = await orderModel.find({ 
      "items.restaurantId": restaurantId 
    }).sort({ date: -1 });

    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => item.restaurantId === restaurantId)
    }));

    console.log(`✅ Found ${filteredOrders.length} orders for restaurant`);
    res.json({ 
      success: true, 
      count: filteredOrders.length, 
      data: filteredOrders 
    });

  } catch (error) {
    console.error("❌ Restaurant orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching restaurant orders" 
    });
  }
};

// ----------------------------
// Admin: Update Order Status
// ----------------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log(`Updating order ${orderId} to status: ${status}`);
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID and status are required" 
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    console.log(`✅ Order ${orderId} updated to ${status}`);
    res.json({ 
      success: true, 
      message: "Status updated successfully", 
      data: updatedOrder 
    });

  } catch (error) {
    console.error("❌ Update status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating status" 
    });
  }
};

export {
  placeOrder,
  mpesaCallback,
  userOrders,
  listOrders,
  updateStatus,
  getRestaurantOrders
};
import express from 'express'
import orderModel from "../models/orderModel.js";
import { placeOrder, mpesaCallback, userOrders, listOrders, updateStatus } from "../controller/orderController.js";

const router = express.Router();

// IMPORTANT: Change from POST to GET for userOrders
router.get("/userorders", userOrders); // CHANGED FROM POST TO GET

router.post("/place", placeOrder);
router.post("/mpesa/callback", mpesaCallback);
router.get("/list", listOrders);
router.post("/status", updateStatus);

// ============ DEBUG ROUTES ============

// Test route 1: Get all orders (no auth required for testing)
router.get("/test-all", async (req, res) => {
  try {
    console.log("🔍 Test: Fetching all orders from database...");
    
    const orders = await orderModel.find({});
    
    console.log(`✅ Test: Found ${orders.length} orders in database`);
    
    if (orders.length === 0) {
      console.log("⚠️ Test: No orders found in database");
    }
    
    // Display first order details if exists
    if (orders.length > 0) {
      console.log("📋 Sample order structure:");
      console.log("Order ID:", orders[0]._id);
      console.log("User ID:", orders[0].userId);
      console.log("Items count:", orders[0].items?.length || 0);
      console.log("Amount:", orders[0].amount);
      console.log("Status:", orders[0].status);
    }
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders,
      message: orders.length > 0 ? "Orders found" : "No orders in database"
    });
    
  } catch (error) {
    console.error("❌ Test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

// Test route 2: Create a test order
router.get("/test-create", async (req, res) => {
  try {
    console.log("🔍 Test: Creating test order...");
    
    // Use a test user ID (get one from your users collection)
    const testOrders = [
      {
        userId: "test-user-123", // Use a simple test ID
        items: [
          {
            name: "Chicken Burger",
            price: 850,
            quantity: 2,
            image: "burger.jpg"
          },
          {
            name: "French Fries",
            price: 300,
            quantity: 1,
            image: "fries.jpg"
          }
        ],
        amount: 2000,
        address: {
          street: "123 Test Street",
          city: "Nairobi",
          country: "Kenya"
        },
        status: "Delivered",
        payment: true,
        date: new Date()
      },
      {
        userId: "test-user-123",
        items: [
          {
            name: "Pizza",
            price: 1200,
            quantity: 1,
            image: "pizza.jpg"
          }
        ],
        amount: 1200,
        address: "456 Another Street, Nairobi",
        status: "Food Processing",
        payment: false,
        date: new Date(Date.now() - 86400000) // Yesterday
      }
    ];
    
    const createdOrders = [];
    for (const orderData of testOrders) {
      const order = new orderModel(orderData);
      await order.save();
      createdOrders.push(order);
    }
    
    console.log(`✅ Test: Created ${createdOrders.length} test orders`);
    
    res.json({
      success: true,
      message: "Test orders created",
      count: createdOrders.length,
      orders: createdOrders
    });
    
  } catch (error) {
    console.error("❌ Test create error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test orders",
      error: error.message
    });
  }
});

// Test route 3: Check endpoint availability
router.get("/test-endpoint", (req, res) => {
  console.log("✅ Test endpoint hit successfully");
  res.json({
    success: true,
    message: "Order routes are working!",
    endpoints: [
      { method: "GET", path: "/api/order/userorders", description: "Get user orders" },
      { method: "POST", path: "/api/order/place", description: "Place new order" },
      { method: "GET", path: "/api/order/list", description: "List all orders (admin)" },
      { method: "POST", path: "/api/order/status", description: "Update order status" }
    ]
  });
});

export default router;
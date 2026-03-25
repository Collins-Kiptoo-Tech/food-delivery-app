import express from 'express'
import orderModel from "../models/orderModel.js";
import { 
  placeOrder, 
  mpesaCallback, 
  userOrders, 
  listOrders, 
  updateStatus,
  getRestaurantOrders
} from "../controller/orderController.js";

const router = express.Router();
// DEBUG: Simple test endpoint
router.post("/debug", (req, res) => {
  console.log('✅ DEBUG: Order endpoint hit');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: "Debug endpoint working",
    headers: req.headers,
    body: req.body
  });
});

// IMPORTANT: Change from POST to GET for userOrders
router.get("/userorders", userOrders); // CHANGED FROM POST TO GET

router.post("/place", placeOrder);
router.post("/mpesa/callback", mpesaCallback);
router.get("/list", listOrders);
router.post("/status", updateStatus);

// NEW ROUTE: Get orders for a specific restaurant
router.get("/restaurant/:restaurantId", getRestaurantOrders);

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
      
      // Log restaurant info if available
      if (orders[0].items && orders[0].items.length > 0) {
        console.log("Restaurant ID from first item:", orders[0].items[0].restaurantId);
        console.log("Restaurant Name from first item:", orders[0].items[0].restaurantName);
      }
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

// Test route 2: Create a test order with restaurant info - FIXED VERSION
router.get("/test-create", async (req, res) => {
  try {
    console.log("🔍 Test: Creating test order with restaurant info...");
    
    // Get restaurant IDs from query params or use defaults
    const restaurant1Id = req.query.rest1 || "69b338e1d367126156ee851a"; // LITMUS HOTEL
    const restaurant2Id = req.query.rest2 || "69b338e1d367126156ee851b"; // KING'S HOTEL
    
    const testOrders = [
      {
        userId: "test-user-123",
        items: [
          {
            foodId: "food123456",
            name: "Chicken Burger",
            price: 850,
            quantity: 2,
            restaurantId: restaurant1Id,
            restaurantName: "LITMUS HOTEL"
          },
          {
            foodId: "food789012",
            name: "French Fries",
            price: 300,
            quantity: 1,
            restaurantId: restaurant1Id,
            restaurantName: "LITMUS HOTEL"
          }
        ],
        amount: 2000,
        address: {
          street: "123 Test Street",
          city: "Nairobi",
          country: "Kenya",
          phone: "+254700000000"
        },
        status: "Food Processing",
        payment: false,
        date: new Date()
      },
      {
        userId: "test-user-123",
        items: [
          {
            foodId: "food345678",
            name: "Beef Wellington",
            price: 1200,
            quantity: 1,
            restaurantId: restaurant2Id,
            restaurantName: "KING'S HOTEL"
          }
        ],
        amount: 1200,
        address: {
          street: "456 Another Street",
          city: "Nairobi",
          country: "Kenya",
          phone: "+254711111111"
        },
        status: "Food Processing",
        payment: false,
        date: new Date(Date.now() - 86400000) // Yesterday
      }
    ];
    
    const createdOrders = [];
    for (const orderData of testOrders) {
      console.log("Creating order with data:", JSON.stringify(orderData, null, 2));
      const order = new orderModel(orderData);
      await order.save();
      createdOrders.push(order);
    }
    
    console.log(`✅ Test: Created ${createdOrders.length} test orders with restaurant info`);
    
    res.json({
      success: true,
      message: "Test orders created with restaurant info",
      count: createdOrders.length,
      orders: createdOrders
    });
    
  } catch (error) {
    console.error("❌ Test create error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test orders",
      error: error.message,
      errors: error.errors
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
      { method: "POST", path: "/api/order/status", description: "Update order status" },
      { method: "GET", path: "/api/order/restaurant/:restaurantId", description: "Get orders for specific restaurant" }
    ]
  });
});

// Test route 4: Test restaurant orders endpoint
router.get("/test-restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`🔍 Testing restaurant orders for ID: ${restaurantId}`);
    
    const orders = await orderModel.find({
      "items.restaurantId": restaurantId
    });
    
    console.log(`✅ Found ${orders.length} orders for restaurant ${restaurantId}`);
    
    res.json({
      success: true,
      restaurantId,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("❌ Test restaurant error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test route 5: Clear all test orders (optional)
router.get("/test-clear", async (req, res) => {
  try {
    const result = await orderModel.deleteMany({ userId: "test-user-123" });
    console.log(`✅ Cleared ${result.deletedCount} test orders`);
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} test orders`
    });
  } catch (error) {
    console.error("❌ Clear error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
/*import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Initialize token from localStorage immediately
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const url = "http://localhost:4000";

  // Fetch food list from backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (err) {
      console.error("Failed to fetch food list:", err);
    }
  };

  // Load cart from backend
  const loadCartData = async (tokenValue, userId) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        { userId },
        { headers: { token: tokenValue } }
      );
      setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  // Add item to cart (optimistic update + login check)
  const addToCart = (itemId) => {
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("Please log in to add items to cart");
      return;
    }

    // Optimistic UI update
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));

    // Send request in the background
    axios
      .post(url + "/api/cart/add", { itemId, userId }, { headers: { token } })
      .catch((err) => {
        console.error("Error adding to cart:", err);
        // Optional rollback if backend fails
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0,
        }));
      });
  };

  // Remove item from cart (optimistic update)
  const removeFromCart = (itemId) => {
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    // Optimistic UI update
    setCartItems((prev) => {
      const newQty = prev[itemId] - 1;
      return { ...prev, [itemId]: newQty > 0 ? newQty : 0 };
    });

    // Send request in the background
    axios
      .post(
        url + "/api/cart/remove",
        { itemId, userId },
        { headers: { token } }
      )
      .catch((err) => {
        console.error("Error removing from cart:", err);
        // Optional rollback if backend fails
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
        }));
      });
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = food_list.find((f) => f._id === itemId);
      if (item) total += item.price * cartItems[itemId];
    }
    return total;
  };

  // Calculate total cart count
  const getTotalCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  // Load food and cart on mount
  useEffect(() => {
    fetchFoodList();

    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserId) {
      loadCartData(storedToken, storedUserId);
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalCartCount,
        url,
        token,
        setToken,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;  */

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Initialize token from localStorage immediately
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [userData, setUserData] = useState(null);
  const url = "http://localhost:4000";

  // ==================== USER DATA FUNCTIONS ====================

  // Load user from localStorage
  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        console.log("✅ Loaded user from localStorage:", parsedUser);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    }
  };

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      if (!token) {
        console.log("⚠️ No token, cannot fetch user data");
        loadUserFromLocalStorage(); // Fallback to localStorage
        return;
      }

      console.log("🔄 Fetching user data with token...");
      
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });
      
      console.log("📦 User data response:", response.data);
      
      if (response.data.success) {
        const userDataFromServer = {
          name: response.data.user.name,
          email: response.data.user.email,
          _id: response.data.user._id
        };
        
        setUserData(userDataFromServer);
        localStorage.setItem("user", JSON.stringify(userDataFromServer));
        console.log("✅ User data set from server:", userDataFromServer);
      } else {
        console.log("⚠️ Backend fetch failed, using localStorage");
        loadUserFromLocalStorage();
      }
    } catch (err) {
      console.error("❌ Failed to fetch user data:", err);
      loadUserFromLocalStorage(); // Fallback to localStorage on error
    }
  };

  // ==================== ORDER FUNCTIONS ====================

  // Fetch user orders function
  const fetchUserOrders = async () => {
    try {
      if (!token) {
        console.error("No token found");
        return { success: false, data: [] };
      }

      const response = await axios.get(`${url}/api/order/userorders`, {
        headers: { token },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      return { success: false, message: err.message };
    }
  };

  // Fetch order details by ID
  const fetchOrderDetails = async (orderId) => {
    try {
      if (!token) {
        console.error("No token found");
        return { success: false, data: null };
      }

      const response = await axios.get(`${url}/api/order/details/${orderId}`, {
        headers: { token },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      return { success: false, message: err.message };
    }
  };

  // Update order status (for cancelling orders)
  const updateOrderStatus = async (orderId, status) => {
    try {
      if (!token) {
        console.error("No token found");
        return { success: false };
      }

      const response = await axios.put(
        `${url}/api/order/update/${orderId}`,
        { status },
        { headers: { token } }
      );
      return response.data;
    } catch (err) {
      console.error("Failed to update order:", err);
      return { success: false, message: err.message };
    }
  };

  // Reorder functionality - add all items from an order to cart
  const reorderItems = async (orderId) => {
    try {
      const orderDetails = await fetchOrderDetails(orderId);
      if (orderDetails.success && orderDetails.data) {
        orderDetails.data.items.forEach((item) => {
          // Add each item to cart with its quantity
          for (let i = 0; i < item.quantity; i++) {
            addToCart(item._id || item.itemId);
          }
        });
        return { success: true, message: "Items added to cart" };
      }
      return { success: false, message: "Failed to load order details" };
    } catch (err) {
      console.error("Failed to reorder:", err);
      return { success: false, message: err.message };
    }
  };

  // ==================== FOOD FUNCTIONS ====================

  // Fetch food list from backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
      console.log("✅ Food list loaded");
    } catch (err) {
      console.error("Failed to fetch food list:", err);
    }
  };

  // ==================== CART FUNCTIONS ====================

  // Load cart from backend
  const loadCartData = async (tokenValue, userId) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        { userId },
        { headers: { token: tokenValue } }
      );
      setCartItems(response.data.cartData || {});
      console.log("✅ Cart data loaded");
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  // Add item to cart (optimistic update + login check)
  const addToCart = (itemId) => {
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("Please log in to add items to cart");
      return;
    }

    // Optimistic UI update
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));

    // Send request in the background
    axios
      .post(url + "/api/cart/add", { itemId, userId }, { headers: { token } })
      .catch((err) => {
        console.error("Error adding to cart:", err);
        // Optional rollback if backend fails
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0,
        }));
      });
  };

  // Remove item from cart (optimistic update)
  const removeFromCart = (itemId) => {
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    // Optimistic UI update
    setCartItems((prev) => {
      const newQty = prev[itemId] - 1;
      return { ...prev, [itemId]: newQty > 0 ? newQty : 0 };
    });

    // Send request in the background
    axios
      .post(
        url + "/api/cart/remove",
        { itemId, userId },
        { headers: { token } }
      )
      .catch((err) => {
        console.error("Error removing from cart:", err);
        // Optional rollback if backend fails
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
        }));
      });
  };

  // Clear cart after successful order
  const clearCart = () => {
    setCartItems({});
    const userId = localStorage.getItem("userId");
    
    if (token && userId) {
      axios
        .post(url + "/api/cart/clear", { userId }, { headers: { token } })
        .catch((err) => console.error("Error clearing cart:", err));
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = food_list.find((f) => f._id === itemId);
      if (item && cartItems[itemId] > 0) {
        total += item.price * cartItems[itemId];
      }
    }
    return total;
  };

  // Calculate total cart count
  const getTotalCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  // ==================== INITIALIZATION EFFECTS ====================

  // Load food, cart, and user data on mount
  useEffect(() => {
    console.log("🔄 Initializing app...");
    
    // Load food list
    fetchFoodList();

    // Always try to load user from localStorage first (for instant display)
    loadUserFromLocalStorage();

    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserId) {
      console.log("🔄 Token found, loading cart and user data...");
      setToken(storedToken); // Ensure token is set in state
      loadCartData(storedToken, storedUserId);
      // Try to fetch fresh user data from backend
      fetchUserData();
    }
  }, []);

  // Fetch user data when token changes (login/logout)
  useEffect(() => {
    if (token) {
      console.log("🔄 Token changed, fetching user data...");
      // Try to fetch fresh user data
      fetchUserData();
      // Also load from localStorage as fallback
      loadUserFromLocalStorage();
    } else {
      console.log("🚪 No token, clearing user data");
      setUserData(null);
      localStorage.removeItem("user");
      setCartItems({}); // Clear cart on logout
    }
  }, [token]);

  // ==================== CONTEXT PROVIDER ====================

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalCartAmount,
        getTotalCartCount,
        url,
        token,
        setToken,
        userData,
        setUserData,
        fetchUserOrders,
        fetchOrderDetails,
        updateOrderStatus,
        reorderItems,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

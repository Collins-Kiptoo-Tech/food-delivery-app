import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
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
  const loadCartData = async (token, userId) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        { userId },
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  // Add item to cart (wait for backend)
  const addToCart = async (itemId) => {
    if (!token) {
      alert("Please log in to add items to cart");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId, userId },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
        }));
      } else {
        alert(response.data.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add item. Check console.");
    }
  };

  // Remove item from cart (wait for backend)
  const removeFromCart = async (itemId) => {
    if (!token) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId, userId },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems((prev) => {
          const newQty = prev[itemId] - 1;
          return { ...prev, [itemId]: newQty > 0 ? newQty : 0 };
        });
      } else {
        alert(response.data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = food_list.find((f) => f._id === itemId);
      if (item) total += item.price * cartItems[itemId];
    }
    return total;
  };

  const getTotalCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  // Load food and cart on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    fetchFoodList();
    if (storedToken && storedUserId) {
      setToken(storedToken);
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

export default StoreContextProvider;

import { createContext, useEffect, useState } from "react";
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

export default StoreContextProvider;

import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import axios from "axios";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const { url, token } = useContext(StoreContext);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        url + "/api/order/userorders",
        {}, // no need to send userId, backend uses token
        { headers: { token } }
      );

      console.log("Fetched orders:", response.data);

      setOrders(response.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  if (!orders.length) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <p>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {orders.map((order, index) => {
          const items = order.items || [];
          const amount = order.amount || 0;
          const status = order.status || "Pending";

          return (
            <div key={order._id || index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="Parcel" />
              <p>
                {items.map((item, i) => (
                  <span key={i}>
                    {item.name} x {item.quantity}
                    {i < items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <p>Total: Ksh {amount}.00</p>
              <p>Items: {items.length}</p>
              <p>
                <span
                  style={{ color: status === "Pending" ? "orange" : "green" }}
                >
                  &#x25cf;
                </span>{" "}
                <b>{status}</b>
              </p>
              <button onClick={fetchOrders}>Refresh Orders</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;

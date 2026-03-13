import React from "react";
import "./Orders.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(url + "/api/order/list", {
        headers: { token }
      });
      
      console.log("Orders API Response:", response.data);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
        if (response.data.data.length === 0) {
          console.log("No orders found in database");
        }
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(url + "/api/order/status", 
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated");
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  if (loading) {
    return (
      <div className="order add">
        <h3>Order Page</h3>
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <img src={assets.parcel_icon} alt="No orders" />
            <h4>No Orders Yet</h4>
            <p>When customers place orders, they will appear here</p>
            <small>Try placing a test order from the customer app</small>
          </div>
        ) : (
          orders.map((order, index) => (
            <div key={index} className="order-item">
              <img src={assets.parcel_icon} alt="" />
              <div>
                <p className="order-item-food">
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " x " + item.quantity;
                    } else {
                      return item.name + " x " + item.quantity + ", ";
                    }
                  })}
                </p>
                <p className="order-item-name">
                  {order.address?.firstName + " " + order.address?.lastName}
                </p>
                <div className="order-item-address">
                  <p>{order.address?.street + ","}</p>
                  <p>
                    {order.address?.city + ", " +
                     order.address?.state + ", " +
                     order.address?.country + ", " +
                     order.address?.zipcode}
                  </p>
                </div>
                <p className="order-item-phone">{order.address?.phone}</p>
              </div>
              <p>Items: {order.items?.length || 0}</p>
              <p>KES {order.amount}</p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
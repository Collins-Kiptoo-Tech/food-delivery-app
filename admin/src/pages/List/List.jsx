import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all food items
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (error) {
      toast.error("Error fetching food list");
    }
  };

  // Fetch all restaurants
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${url}/api/admin/restaurants`,
        { headers: { token } }
      );
      if (response.data.success) {
        setRestaurants(response.data.restaurants);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove food item
  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error("Error removing food");
      }
    }
  };

  // Helper function to get restaurant name by ID
  const getRestaurantName = (restaurantId) => {
    if (!restaurantId) return "Not Assigned";
    const restaurant = restaurants.find(r => r._id === restaurantId);
    return restaurant ? restaurant.name : "Unknown";
  };

  useEffect(() => {
    fetchList();
    fetchRestaurants();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Food Types</p>
      
      {loading ? (
        <div className="loading">Loading restaurants...</div>
      ) : (
        <div className="list-table">
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Restaurant</b>
            <b>Action</b>
          </div>
          
          {list.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                <img src={`${url}/images/` + item.image} alt="" />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>KES {item.price}</p>
                <p>
                  <span className="restaurant-badge">
                    {getRestaurantName(item.restaurantId)}
                  </span>
                </p>
                <p 
                  onClick={() => removeFood(item._id)} 
                  className="cursor"
                >
                  x
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default List;

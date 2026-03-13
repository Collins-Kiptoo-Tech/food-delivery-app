import React, { useState, useEffect } from "react";
import "./Restaurants.css";
import axios from "axios";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    cuisineTypes: ""
  });

  // Fetch restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Fetching restaurants with token:", token ? "Present" : "Missing");
      
      if (!token) {
        console.error("No token found - please login");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/restaurants`,
        { headers: { token } }
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setRestaurants(response.data.restaurants);
        setFilteredRestaurants(response.data.restaurants);
        console.log("Restaurants loaded:", response.data.restaurants.length);
      } else {
        console.error("API error:", response.data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants based on search and status
  useEffect(() => {
    let filtered = restaurants;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisineTypes?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(r => r.isActive === isActive);
    }
    
    setFilteredRestaurants(filtered);
  }, [searchTerm, statusFilter, restaurants]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Stats calculations
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.isActive).length;
  const inactiveRestaurants = restaurants.filter(r => !r.isActive).length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format cuisine types
    const restaurantData = {
      ...formData,
      cuisineTypes: formData.cuisineTypes.split(',').map(c => c.trim())
    };

    try {
      if (editingRestaurant) {
        // Update existing restaurant
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/restaurants/${editingRestaurant._id}`,
          restaurantData,
          { headers: { token: localStorage.getItem('token') } }
        );
        alert("Restaurant updated successfully!");
      } else {
        // Add new restaurant
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/restaurants`,
          restaurantData,
          { headers: { token: localStorage.getItem('token') } }
        );
        alert("Restaurant added successfully!");
      }
      
      setShowForm(false);
      setEditingRestaurant(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        cuisineTypes: ""
      });
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      email: restaurant.email,
      password: "",
      phone: restaurant.phone,
      address: restaurant.address,
      cuisineTypes: restaurant.cuisineTypes?.join(', ') || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/admin/restaurants/${id}`,
          { headers: { token: localStorage.getItem('token') } }
        );
        alert("Restaurant deleted successfully!");
        fetchRestaurants();
      } catch (error) {
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/restaurants/${id}/status`,
        { isActive: !currentStatus },
        { headers: { token: localStorage.getItem('token') } }
      );
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="restaurants add">
      <div className="flex-col">
        <div className="add-header">
          <h3>Restaurant Management</h3>
          <button 
            className="add-btn"
            onClick={() => {
              setEditingRestaurant(null);
              setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                cuisineTypes: ""
              });
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add Restaurant"}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="restaurant-stats">
          <div className="stat-card">
            <h4>Total Restaurants</h4>
            <p className="stat-number">{totalRestaurants}</p>
          </div>
          <div className="stat-card">
            <h4>Active</h4>
            <p className="stat-number active">{activeRestaurants}</p>
          </div>
          <div className="stat-card">
            <h4>Inactive</h4>
            <p className="stat-number inactive">{inactiveRestaurants}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Restaurants</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="flex-col">
            <div className="add-img-upload">
              <p>Restaurant Logo (Optional)</p>
              <input type="file" accept="image/*" />
            </div>

            <div className="add-product-name">
              <p>Restaurant Name *</p>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Type here" 
                required 
              />
            </div>

            <div className="add-product-name">
              <p>Email *</p>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="restaurant@email.com" 
                required 
              />
            </div>

            <div className="add-product-name">
              <p>Password {editingRestaurant && "(Leave blank to keep current)"} *</p>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********" 
                required={!editingRestaurant}
              />
            </div>

            <div className="add-product-name">
              <p>Phone Number *</p>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+254 XXX XXX XXX" 
                required 
              />
            </div>

            <div className="add-product-description">
              <p>Address *</p>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Full restaurant address" 
                required
              />
            </div>

            <div className="add-product-name">
              <p>Cuisine Types (comma separated)</p>
              <input 
                type="text" 
                name="cuisineTypes"
                value={formData.cuisineTypes}
                onChange={handleInputChange}
                placeholder="e.g., Italian, Chinese, Fast Food" 
              />
            </div>

            <button type="submit" className="add-btn">
              {editingRestaurant ? "UPDATE RESTAURANT" : "ADD RESTAURANT"}
            </button>
          </form>
        )}

        <div className="list-table">
          <div className="list-table-format title">
            <b>Name</b>
            <b>Email</b>
            <b>Phone</b>
            <b>Cuisine</b>
            <b>Status</b>
            <b>Actions</b>
          </div>

          {loading ? (
            <div className="loading-state">Loading restaurants...</div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="empty-state">
              <p>No restaurants found</p>
              {searchTerm && <p>Try adjusting your search or filter</p>}
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <div key={restaurant._id} className="list-table-format">
                <p>{restaurant.name}</p>
                <p>{restaurant.email}</p>
                <p>{restaurant.phone}</p>
                <p>{restaurant.cuisineTypes?.slice(0, 2).join(', ')}</p>
                <p>
                  <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <div className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(restaurant)}
                  >
                    Edit
                  </button>
                  <button 
                    className="status-btn"
                    onClick={() => handleToggleStatus(restaurant._id, restaurant.isActive)}
                  >
                    {restaurant.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(restaurant._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
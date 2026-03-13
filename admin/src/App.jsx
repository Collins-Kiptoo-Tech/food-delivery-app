import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import List from "./pages/List/List";
import Add from "./pages/Add/Add";
import Orders from "./pages/Orders/Orders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddCategory from "./pages/AddCategory/AddCategory";
import Restaurants from "./pages/Restaurants/Restaurants";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log("📍 ProtectedRoute - Token:", token ? "YES ✅" : "NO ❌");
  
  if (!token) {
    console.log("📍 ProtectedRoute - No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout component
const AdminLayout = ({ url }) => {
  console.log("📍 AdminLayout - Rendering with token present");
  
  return (
    <div>
      <Navbar />
      <hr />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-category" element={<AddCategory url={url} />} />
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const url = "http://localhost:4000";
  const token = localStorage.getItem('token');
  
  console.log("📍 App.jsx - Initial render");
  console.log("📍 App.jsx - Token from localStorage:", token ? "YES ✅" : "NO ❌");
  if (token) {
    console.log("📍 App.jsx - Token preview:", token.substring(0, 20) + "...");
  }

  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Public route - always accessible */}
        <Route path="/login" element={<Login />} />
        
        {/* All other routes - protected */}
        <Route
          path="/*"
          element={
            token ? (
              <AdminLayout url={url} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
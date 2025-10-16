import React, { useState } from "react";
import axios from "axios";
import "./AddFood.css";

const AddFood = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("All");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("image", image);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/food/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(res.data.message || "Food added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add food. Check backend.");
    }
  };

  return (
    <div className="add-food">
      <h2>Add New Food</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Food Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All</option>
          <option value="Chicken">Chicken</option>
          <option value="Rolls">Rolls</option>
          <option value="Burger">Burger</option>
          <option value="Dessert">Dessert</option>
          <option value="Drinks">Drinks</option>
        </select>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit">Add Food</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddFood;

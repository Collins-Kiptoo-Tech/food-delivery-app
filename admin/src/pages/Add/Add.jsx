import React, { useState } from "react";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);
    const response = await axios.post(`${url}/api/food/add`, formData);
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "Salad",
      });
      setImage(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: '"Poppins", sans-serif',
        paddingRight: "60px",
      }}
    >
      <form
        onSubmit={onSubmitHandler}
        style={{
          background: "white",
          width: "100%",
          maxWidth: "400px",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginRight: "40px",
        }}
      >
        {/* Image Upload */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#2d3748",
              margin: 0,
            }}
          >
            Upload Image
          </p>
          <label htmlFor="image" style={{ cursor: "pointer" }}>
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "8px",
                border: "2px dashed #c9a36a",
                objectFit: "cover",
                backgroundColor: "#fff7ee",
              }}
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </div>

        {/* Product Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#2d3748",
              margin: 0,
            }}
          >
            Product name
          </p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            style={{
              padding: "11px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: '"Poppins", sans-serif',
              backgroundColor: "#f7fafc",
              outline: "none",
            }}
          />
        </div>

        {/* Product Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#2d3748",
              margin: 0,
            }}
          >
            Product Description
          </p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            placeholder="Write content here"
            required
            style={{
              padding: "11px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: '"Poppins", sans-serif',
              backgroundColor: "#f7fafc",
              minHeight: "80px",
              resize: "vertical",
              outline: "none",
            }}
          ></textarea>
        </div>

        {/* Category and Price */}
        <div style={{ display: "flex", gap: "15px" }}>
          {/* Category */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
              minWidth: "0",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
                margin: 0,
              }}
            >
              Product Category
            </p>
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
              required
              style={{
                padding: "11px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: '"Poppins", sans-serif',
                backgroundColor: "#f7fafc",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">-- Select Category --</option>
              <option value="Chicken">Chicken</option>
              <option value="Beef">Beef</option>
              <option value="Fish">Fish</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Ugali Dishes">Ugali Dishes</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          {/* Price */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
                margin: 0,
              }}
            >
              Product Price
            </p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="Ksh 550"
              style={{
                padding: "11px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: '"Poppins", sans-serif',
                backgroundColor: "#f7fafc",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* ADD Button */}
        <button
          type="submit"
          style={{
            backgroundColor: "#8b5e34",
            color: "white",
            padding: "13px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "5px",
            fontFamily: '"Poppins", sans-serif',
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;

import React, { useState } from "react";
import "./AddCategory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const AddCategory = ({ url }) => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      toast.error("Please provide category name and image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/category/add`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setImage(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Error adding category");
      console.log(err);
    }
  };

  return (
    <div className="add-category">
      <form onSubmit={onSubmitHandler} className="flex-col">
        <div className="add-category-image flex-col">
          <p>Upload Category Image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
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

        <div className="add-category-name flex-col">
          <p>Category Name</p>
          <input
            type="text"
            value={name}
            placeholder="Enter category name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button type="submit" className="add-category-btn">
          ADD CATEGORY
        </button>
      </form>
    </div>
  );
};

export default AddCategory;

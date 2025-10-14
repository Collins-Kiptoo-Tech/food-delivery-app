import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes to you</h2>

      {/* ✅ New grouped-by-category section */}
      {category === "All" ? (
        // Show all categories with their foods
        [...new Set(food_list.map((item) => item.category))].map((cat) => (
          <div key={cat} className="category-section">
            <h3 className="category-title">{cat}</h3>
            <div className="food-display-list">
              {food_list
                .filter((item) => item.category === cat)
                .map((item) => (
                  <FoodItem
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    image={item.image}
                  />
                ))}
            </div>
          </div>
        ))
      ) : (
        // Show only selected category foods
        <div className="category-section">
          <h3 className="category-title">{category}</h3>
          <div className="food-display-list">
            {food_list
              .filter((item) => item.category === category)
              .map((item) => (
                <FoodItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;

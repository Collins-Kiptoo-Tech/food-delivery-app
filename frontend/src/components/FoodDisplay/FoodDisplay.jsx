/*import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes to you</h2>

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

export default FoodDisplay;*/

import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const ITEMS_PER_BATCH = 5;

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  // Track how many items are visible per category
  const [visiblePerCategory, setVisiblePerCategory] = useState({});

  // Initialize visible count when food_list changes
  useEffect(() => {
    const initialVisible = {};
    [...new Set(food_list.map((item) => item.category))].forEach(
      (cat) => (initialVisible[cat] = ITEMS_PER_BATCH)
    );
    setVisiblePerCategory(initialVisible);
  }, [food_list]);

  const categories =
    category === "All"
      ? [...new Set(food_list.map((item) => item.category))]
      : [category];

  const handleLoadMore = (cat) => {
    setVisiblePerCategory((prev) => ({
      ...prev,
      [cat]: (prev[cat] || ITEMS_PER_BATCH) + ITEMS_PER_BATCH,
    }));
  };

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes for you</h2>

      {categories.map((cat) => {
        const foodsInCategory = food_list.filter(
          (item) => item.category === cat
        );
        const isAllView = category === "All";

        // Decide how many items to show
        const visibleCount = isAllView
          ? visiblePerCategory[cat] || ITEMS_PER_BATCH
          : foodsInCategory.length; // Show all items in single category view

        const currentFoods = foodsInCategory.slice(0, visibleCount);

        return (
          <div key={cat} className="category-section">
            <h3 className="category-title">{cat}</h3>
            <div className="food-display-list">
              {currentFoods.map((item) => (
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

            {/* Load More button */}
            {isAllView &&
              foodsInCategory.length > ITEMS_PER_BATCH &&
              visibleCount < foodsInCategory.length && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={() => handleLoadMore(cat)}
                  >
                    Load More
                  </button>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default FoodDisplay;

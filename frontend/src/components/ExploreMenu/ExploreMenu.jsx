import React, { useContext } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../context/StoreContext";

// Import all menu images
import menu1 from "../../assets/menu_1.png";
import menu2 from "../../assets/menu_2.png";
import menu3 from "../../assets/menu_3.png";
import menu4 from "../../assets/menu_4.png";
import menu5 from "../../assets/menu_5.png";
import menu6 from "../../assets/menu_6.png";
import menu7 from "../../assets/menu_7.png";
import menu8 from "../../assets/menu_8.png";

const ExploreMenu = ({ category, setCategory }) => {
  const { food_list } = useContext(StoreContext);

  // Friendly category names
  const categoryNameMap = {
    Chicken: "Chicken",
    Beef: "Beef",
    Fish: "Fish",
    Sandwich: "Sandwich",
    UgaliDishes: "Ugali Dishes",
    Pizza: "Pizza",
    Pasta: "Pasta",
    Snacks: "Snacks",
    Specials: "Specials",
  };

  // All menu images in order
  const images = [menu1, menu2, menu3, menu4, menu5, menu6, menu7, menu8];

  // Get unique categories from food_list
  const categories = [...new Set(food_list.map((item) => item.category))];

  // Get image for category by index
  const getCategoryImage = (index) => {
    return images[index] || menu1; // fallback to first image
  };

  const handleCategoryClick = (cat) => {
    if (category === cat) {
      setCategory("All");
    } else {
      setCategory(cat);
    }
  };

  // Calculate stats
  const totalDishes = food_list.length;
  const uniqueRestaurants = [...new Set(food_list.map(item => item.restaurant || "FreshFeast"))].length;

  // Get top rated dishes
  const topDishes = food_list
    .sort((a, b) => (b.rating || 4) - (a.rating || 4))
    .slice(0, 4);

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="menu-header">
        <h1>Explore our menu</h1>
        <p className="menu-description">
          Choose from a diverse menu featuring a delectable array of dishes. 
          Our mission is to satisfy your craving and elevate your dining experience, 
          one delicious meal at a time.
        </p>
      </div>

      {/* Stats Section - Larger & Prominent */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{totalDishes}+</div>
          <div className="stat-label">DISHES</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <div className="stat-number">{uniqueRestaurants}</div>
          <div className="stat-label">RESTAURANTS</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <div className="stat-number">30min</div>
          <div className="stat-label">AVG DELIVERY</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-section">
        <h3 className="section-title">Popular Categories</h3>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-card ${category === cat ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="category-image-container">
                <img
                  src={getCategoryImage(index)}
                  alt={cat}
                  className="category-image"
                />
              </div>
              <h4 className="category-name">{categoryNameMap[cat] || cat}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Top Dishes Section */}
      <div className="top-dishes-section">
        <div className="section-header">
          <h3 className="section-title">Top dishes for you</h3>
          <button className="view-all-btn">
            View All Categories →
          </button>
        </div>
        <div className="dishes-grid">
          {topDishes.map((dish, index) => (
            <div key={index} className="dish-card">
              <img src={dish.image} alt={dish.name} className="dish-image" />
              <div className="dish-content">
                <h4>{dish.name}</h4>
                <div className="dish-details">
                  <span className="dish-rating">⭐ {dish.rating || 4.5}</span>
                  <span className="dish-price">KSh {dish.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreMenu;

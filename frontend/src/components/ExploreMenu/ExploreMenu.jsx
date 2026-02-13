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
    return images[index % images.length] || menu1;
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

  return (
    <div className="explore-menu" id="explore-menu">
      {/* Header Section */}
      <div className="explore-header">
        <span className="badge">MENU</span>
        <h1>Explore Our <span className="highlight">Menu</span></h1>
        <p className="subtitle">
          Choose from a diverse menu featuring a delectable array of dishes. 
          Our mission is to satisfy your craving and elevate your dining experience.
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-value">{totalDishes}+</span>
          <span className="stat-label">Dishes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{uniqueRestaurants}</span>
          <span className="stat-label">Restaurants</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">30</span>
          <span className="stat-label">Min Delivery</span>
        </div>
      </div>

      {/* Categories Section - ENLARGED IMAGES */}
      <div className="categories-wrapper">
        <div className="section-header">
          <h2>Popular Categories</h2>
          <p>Browse your favorite categories</p>
        </div>
        
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-item ${category === cat ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="category-icon">
                <img
                  src={getCategoryImage(index)}
                  alt={cat}
                />
              </div>
              <span className="category-name">{categoryNameMap[cat] || cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreMenu;
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

  // Friendly category names (optional)
  const categoryNameMap = {
    Salad: "Chicken",
    Rolls: "Beef",
    Sandwiches: "Gourmet Sandwiches",
    Beverages: "Drinks",
    Pizza: "Pizza Specials",
    Pasta: "Pasta Dishes",
    Snacks: "Quick Bites",
    Specials: "Chef Specials",
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
      setCategory("All"); // if clicked again, reset to show all
    } else {
      setCategory(cat);
    }
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes. Our
        mission is to satisfy your craving and elevate your dining experience,
        one delicious meal at a time.
      </p>

      <div className="explore-menu-list">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`explore-menu-list-item ${
              category === cat ? "active-item" : ""
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            <img
              src={getCategoryImage(index)}
              alt={cat}
              className="category-image"
            />
            <p>{categoryNameMap[cat] || cat}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;

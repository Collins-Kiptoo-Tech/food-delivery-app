import React from "react";
import "./Header.css";
import WhyChooseUs from "../../WhyChooseUs/WhyChooseUs";

const Header = () => {
  return (
    <div className="header">
      {/* Wrapper to hold both content and WhyChooseUs side by side */}
      <div className="header-contents-wrapper">
        {/* Left side: Text content */}
        <div className="header-contents">
          <h2>Fresh, Fast & Full of Flavor</h2>
          <p>
            Discover meals made with locally sourced ingredients, crafted with
            love, and delivered straight to your door — fresh every time.
          </p>
          <button>Order Now 🍽️</button>
        </div>

        
        <div className="header-whychooseus">
          <WhyChooseUs />
        </div>
      </div>
    </div>
  );
};

export default Header;

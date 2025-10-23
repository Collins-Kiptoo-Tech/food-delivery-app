import React from "react";
import "./WhyChooseUs.css";
import { Truck, Utensils, Clock } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <div className="why-choose-us-side">
      <h3>Why Choose Us</h3>

      <div className="why-side-grid">
        <div className="why-item">
          <Truck size={20} className="why-icon" />
          <div>
            <h5>Fast Delivery</h5>
            <p>We bring your food fresh and hot, right on time.</p>
          </div>
        </div>

        <div className="why-item">
          <Utensils size={20} className="why-icon" />
          <div>
            <h5>Fresh Ingredients</h5>
            <p>Every dish is crafted from farm-fresh produce daily.</p>
          </div>
        </div>

        <div className="why-item">
          <Clock size={20} className="why-icon" />
          <div>
            <h5>Always Available</h5>
            <p>We’re here whenever you’re hungry — day or night.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;

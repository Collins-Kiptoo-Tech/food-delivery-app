import React from "react";
import "./WhyChooseUs.css";
import { Truck, Clock, Utensils } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <div className="why-choose-us-side">
      <h3>Why Choose Us</h3>

      <div className="why-side-grid">
        <div className="why-item">
          <Truck size={20} className="why-icon" />
          <div>
            <h5>Fast Delivery</h5>
            <p>Hot meals on time, every time.</p>
          </div>
        </div>

        <div className="why-item">
          <Utensils size={20} className="why-icon" />
          <div>
            <h5>Fresh Ingredients</h5>
            <p>Cooked daily with farm-fresh produce.</p>
          </div>
        </div>

        <div className="why-item">
          <Clock size={20} className="why-icon" />
          <div>
            <h5>24/7 Service</h5>
            <p>We’re open whenever you’re hungry.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;

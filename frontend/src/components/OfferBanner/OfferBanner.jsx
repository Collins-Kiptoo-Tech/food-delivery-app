import React from "react";
import "./OfferBanner.css";
import { Gift, Truck } from "lucide-react";

const OfferBanner = () => {
  return (
    <div className="offer-banner">
      <div className="offer-content">
        <Gift className="offer-icon" />
        <p className="offer-text">
          🎉 <strong>Welcome to FreshFeast!</strong> Enjoy{" "}
          <span>free delivery</span> on orders above <strong>KSh 1,000</strong>.
        </p>
        <Truck className="offer-icon" />
      </div>
    </div>
  );
};

export default OfferBanner;

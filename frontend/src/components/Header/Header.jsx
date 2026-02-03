/*import React from "react";
import "./Header.css";
import WhyChooseUs from "../../WhyChooseUs/WhyChooseUs";

const Header = () => {
  return (
    <div className="header">
      
      <div className="header-contents-wrapper">
    
        <div className="header-contents">
          <h2>Fresh, Fast & Full of Flavor</h2>
        </div>

        
        <div className="header-whychooseus">
          <WhyChooseUs />
        </div>
      </div>
    </div>
  );
};

export default Header;   */
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
          {/* Promotional Banner */}
          <div className="promo-badge">
            🚚 FREE Delivery on orders above KSh 1,000
          </div>
          
          {/* Main Headline */}
          <h1 className="main-headline">
            Fresh, Fast & <span className="highlight">Full of Flavor</span>
          </h1>
          
          {/* Subtitle */}
          <p className="subtitle">
            Experience the freshest ingredients and fastest delivery in town. 
            Your satisfaction is our recipe!
          </p>
          
          {/* Call to Action Buttons */}
          <div className="cta-buttons">
            <button className="btn-primary">
              🍽️ Order Now
            </button>
            <button className="btn-secondary">
              📖 View Menu
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <span>Rated 4.8/5 by 2,000+ customers</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⏰</span>
              <span>30-min delivery guarantee</span>
            </div>
          </div>
        </div>
        
        {/* Right side: WhyChooseUs component */}
        <div className="header-whychooseus">
          <WhyChooseUs />
        </div>
      </div>
    </div>
  );
};

export default Header;

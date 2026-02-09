import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  const navigate = useNavigate();

  
  const cartProducts =
    food_list?.filter((item) => cartItems[item._id] > 0) || [];

  return (
    <div className="cart">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-count">
            {cartProducts.length} {cartProducts.length === 1 ? "item" : "items"}
          </p>
        </div>

        {cartProducts.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items to get started!</p>
            <button 
              className="browse-button"
              onClick={() => navigate("/")}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-content">
              <div className="cart-items">
                <div className="cart-items-header">
                  <div className="header-product">Product</div>
                  <div className="header-price">Price</div>
                  <div className="header-quantity">Quantity</div>
                  <div className="header-total">Total</div>
                  <div className="header-remove"></div>
                </div>

                <div className="cart-items-list">
                  {cartProducts.map((item) => {
                    const itemImage = `${url}/uploads/${item.image}`;
                    return (
                      <div className="cart-item-card" key={item._id}>
                        <div className="item-info">
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="item-image"
                            onError={(e) => (e.target.src = "/uploads/default.png")}
                          />
                          <div className="item-details">
                            <h3 className="item-name">{item.name}</h3>
                            {item.category && (
                              <span className="item-category">{item.category}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="item-price">Ksh {item.price}</div>
                        
                        <div className="item-quantity">
                          <span className="quantity-display">{cartItems[item._id]}</span>
                        </div>
                        
                        <div className="item-total">
                          <span className="total-amount">
                            Ksh {item.price * cartItems[item._id]}
                          </span>
                        </div>
                        
                        <div className="item-remove">
                          <button 
                            className="remove-button"
                            onClick={() => removeFromCart(item._id)}
                            aria-label="Remove item"
                            title="Remove from cart"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-actions">
                  <button 
                    className="continue-shopping-btn"
                    onClick={() => navigate("/")}
                  >
                    ← Continue Shopping
                  </button>
                </div>
              </div>

              
              <div className="order-summary">
                <div className="summary-card">
                  <h2 className="summary-title">Order Summary</h2>
                  
                  <div className="summary-details">
                    <div className="summary-row">
                      <span className="row-label">Subtotal</span>
                      <span className="row-value">Ksh {getTotalCartAmount()}</span>
                    </div>
                    
                    <div className="summary-row">
                      <span className="row-label">Delivery Fee</span>
                      <span className="row-value">
                        Ksh {getTotalCartAmount() === 0 ? 0 : 75}
                      </span>
                    </div>
                    
                    <div className="summary-divider"></div>
                    
                    <div className="summary-row total-row">
                      <span className="row-label">Total Amount</span>
                      <span className="total-value">
                        Ksh {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 75}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className="checkout-button"
                    onClick={() => navigate("/order")}
                  >
                    Proceed to Checkout
                  </button>
                  
                  <div className="secure-checkout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

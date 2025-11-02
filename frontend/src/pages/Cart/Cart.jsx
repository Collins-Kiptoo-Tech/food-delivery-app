import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  const navigate = useNavigate();

  // Filter only items that are in the cart
  const cartProducts =
    food_list?.filter((item) => cartItems[item._id] > 0) || [];

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Image</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {cartProducts.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "30px", color: "#777" }}>
            🛒 Your cart is empty.
          </p>
        ) : (
          cartProducts.map((item) => {
            const itemImage = `${url}/uploads/${item.image}`;
            return (
              <div className="cart-items-item" key={item._id}>
                <img
                  src={itemImage}
                  alt={item.name}
                  onError={(e) => (e.target.src = "/uploads/default.png")}
                />
                <p>{item.name}</p>
                <p>Ksh {item.price}</p>
                <p>{cartItems[item._id]}</p>
                <p>Ksh {item.price * cartItems[item._id]}</p>
                <p
                  onClick={() => removeFromCart(item._id)}
                  className="cross"
                  title="Remove from cart"
                >
                  ×
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Total Section */}
      {cartProducts.length > 0 && (
        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>Ksh {getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>Ksh {getTotalCartAmount() === 0 ? 0 : 250}</p>
              </div>
              <hr />
              <div className="cart-total-details total-amount">
                <p>Total</p>
                <b>
                  Ksh{" "}
                  {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 250}
                </b>
              </div>
            </div>
            <button onClick={() => navigate("/order")}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

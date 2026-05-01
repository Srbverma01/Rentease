import React from "react";

const Cart = ({ cart, addToCart, decreaseQty, removeFromCart }) => {
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white p-4 rounded shadow mb-4"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p>Rs {item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => decreaseQty(item)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>

              <div>Rs {item.price * item.qty}</div>

              <button
                onClick={() => removeFromCart(item)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <h2 className="text-xl font-bold mt-6">Total: Rs {totalPrice}</h2>

          <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded">
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;

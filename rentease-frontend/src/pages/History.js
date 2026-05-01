import { useEffect, useState } from "react";

import API from "../api";

function History() {
  const [history, setHistory] = useState({ orders: [], rentals: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/api/history/")
      .then((response) => {
        setHistory(response.data);
      })
      .catch(() => {
        setError("Unable to load your history right now.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <span className="section-kicker">History</span>
        <h1 className="section-title">Track orders and active rentals in one place.</h1>
        <p className="section-subtitle">
          Every checkout creates a rental-ready order trail so your account stays easy to follow.
        </p>
      </div>

      {isLoading ? (
        <div className="account-card">
          <h2 className="account-card-title">Loading history...</h2>
        </div>
      ) : error ? (
        <div className="account-card">
          <p className="auth-error">{error}</p>
        </div>
      ) : (
        <div className="history-grid">
          <section className="account-card">
            <h2 className="account-card-title">Order history</h2>
            {history.orders.length === 0 ? (
              <p className="account-copy">You have not placed any orders yet.</p>
            ) : (
              <div className="history-stack">
                {history.orders.map((order) => (
                  <article className="history-card" key={order.id}>
                    <div className="history-card-top">
                      <div>
                        <span className="section-kicker">Order #{order.id}</span>
                        <h3>{order.status}</h3>
                      </div>
                      <strong>Rs {order.total_price}</strong>
                    </div>
                    <p className="account-copy">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <div className="history-item-list">
                      {order.items.map((item) => (
                        <div className="history-item" key={item.id}>
                          <span>{item.product_name}</span>
                          <span>
                            {item.quantity} x Rs {item.monthly_price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="account-card">
            <h2 className="account-card-title">Rental history</h2>
            {history.rentals.length === 0 ? (
              <p className="account-copy">Your rental timeline will appear here after checkout.</p>
            ) : (
              <div className="history-stack">
                {history.rentals.map((rental) => (
                  <article className="history-card" key={rental.id}>
                    <div className="history-card-top">
                      <div>
                        <span className="section-kicker">{rental.status}</span>
                        <h3>{rental.product_name}</h3>
                      </div>
                      <strong>Rs {rental.price}</strong>
                    </div>
                    <div className="history-item-list">
                      <div className="history-item">
                        <span>Start date</span>
                        <span>{new Date(rental.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="history-item">
                        <span>End date</span>
                        <span>{new Date(rental.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default History;

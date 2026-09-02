import { useState } from "react";

const whatsappUrl =
  "https://wa.me/919340558874?text=Hi%20RentEase%2C%20I%20want%20to%20know%20more%20about%20rentals.";

function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="whatsapp-widget">
      {isOpen ? (
        <section className="whatsapp-panel" aria-label="WhatsApp support chat">
          <div>
            <strong>Chat with RentEase</strong>
            <p>Ask about products, delivery, refundable deposits, or checkout help.</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-link">
            Continue on WhatsApp
          </a>
        </section>
      ) : null}

      <button
        className="whatsapp-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Open WhatsApp chat"
      >
        Need help
      </button>
    </div>
  );
}

export default WhatsAppChat;

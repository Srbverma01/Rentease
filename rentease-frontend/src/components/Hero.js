import { Link } from "react-router-dom";

const heroStats = [
  { title: "Flexible monthly plans", detail: "Upgrade room by room instead of buying upfront." },
  { title: "Furniture plus essentials", detail: "Build a complete setup from one curated catalog." },
  { title: "Easy for fast moves", detail: "Stay nimble when your address or needs change." },
];

function Hero() {
  return (
    <section className="section-shell hero-shell">
      <div className="hero-panel">
        <div className="hero-copy-column">
          <p className="hero-eyebrow">Styled spaces without the commitment of buying</p>
          <h1 className="hero-title">Rent the pieces that make a place feel finished.</h1>
          <p className="hero-copy">
            Move in with confidence using flexible rentals for living rooms, bedrooms, and work
            setups. RentEase helps you build a polished home on your own timeline.
          </p>

          <div className="hero-actions">
            <a href="#catalog" className="hero-button">
              Explore rentals
            </a>
            <Link to="/register" className="hero-button--secondary">
              Start your account
            </Link>
          </div>

          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div className="hero-stat" key={stat.title}>
                <strong>{stat.title}</strong>
                <span>{stat.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />

          <div className="hero-card hero-card--large">
            <div className="hero-card-top">
              <span>Signature setup</span>
              <span>Curated</span>
            </div>
            <h2 className="hero-card-title">Modern Apartment Starter Pack</h2>
            <p className="hero-card-copy">
              Pair a clean-lined sofa, smart storage, and a focused work nook without filling your
              move with large one-time purchases.
            </p>

            <div className="hero-room">
              <div className="hero-room-item">
                <span>Living room</span>
                <span>Soft seating</span>
              </div>
              <div className="hero-room-item">
                <span>Bedroom</span>
                <span>Calm essentials</span>
              </div>
              <div className="hero-room-item">
                <span>Workspace</span>
                <span>Focus ready</span>
              </div>
            </div>
          </div>

          <div className="hero-card hero-card--small">
            <p className="hero-card-note">
              Thoughtful rentals make it easier to live well now and adjust later.
            </p>
            <span className="hero-pill">Designed for real-life flexibility</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

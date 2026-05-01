const features = [
  {
    label: "Flexible",
    title: "Plans that move with your life",
    copy: "Choose rentals that suit the season you are in, then adapt as your space changes.",
  },
  {
    label: "Curated",
    title: "Pieces that work well together",
    copy: "The catalog is designed to help rooms feel considered instead of stitched together.",
  },
  {
    label: "Simple",
    title: "Less upfront pressure",
    copy: "Bring home the essentials you need now without large one-time furniture costs.",
  },
  {
    label: "Support",
    title: "A smoother setup experience",
    copy: "From finding the right fit to managing your cart, the journey stays straightforward.",
  },
];

function WhyUs() {
  return (
    <section className="section-shell">
      <div className="section-head">
        <span className="section-kicker">Why RentEase</span>
        <h2 className="section-title">Built for people who want homes that feel elevated, fast.</h2>
        <p className="section-subtitle">
          The experience is designed around flexibility and thoughtful presentation, not just a
          long list of products.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-eyebrow">{feature.label}</span>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-copy">{feature.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WhyUs;

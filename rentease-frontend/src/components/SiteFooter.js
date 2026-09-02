import { Link } from "react-router-dom";

const browseGroups = [
  {
    label: "Browse by Type",
    links: [
      "Package on Rent",
      "Furniture on Rent",
      "Appliance on Rent",
      "Electronics on Rent",
      "Baby Furniture",
      "Fitness Equipment",
    ],
  },
  {
    label: "Browse by Appliances Type",
    links: [
      "Refrigerator and Freezer",
      "Washing Machine",
      "Air Conditioner",
      "Microwaves and Induction",
      "Television",
      "Air Cooler",
      "Dishwasher",
      "Water Purifiers",
      "Air Purifier",
    ],
  },
  {
    label: "Choose by Furniture Type",
    links: [
      "Bedroom Furniture",
      "Work From Home Furniture",
      "Living Room Furniture",
      "Kitchen and Dining Room",
      "Baby Furniture",
    ],
  },
  {
    label: "Choose Electronic Items",
    links: ["Smart Phones", "Smart Devices", "Laptop", "Tablets"],
  },
  {
    label: "Types of AC on Rent",
    links: ["1 ton AC", "1.5 ton AC", "2 ton AC"],
  },
];

const footerColumns = [
  {
    title: "RentEase",
    links: [
      { label: "About Us", to: "/about-us" },
      { label: "Benefits", to: "/benefits" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Sitemap", to: "/sitemap" },
      { label: "RentEase for Business", to: "/business" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Support Home", to: "/support" },
      { label: "Documents Required", to: "/documents-required" },
      { label: "Annual Returns", to: "/annual-returns" },
      { label: "Investor Relations", to: "/investor-relations" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping Policy", to: "/shipping-policy" },
      { label: "Cancellation & Return", to: "/cancellation-return" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Rental Terms & Conditions", to: "/rental-terms" },
      { label: "Referral Terms & Conditions", to: "/referral-terms" },
    ],
  },
];

const toSlug = (label) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toCatalogLink = (label) => `/browse/${toSlug(label)}`;

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-browse" aria-label="Popular rental searches">
        {browseGroups.map((group) => (
          <p key={group.label}>
            <strong>{group.label}:</strong>{" "}
            {group.links.map((link, index) => (
              <span key={link}>
                <Link to={toCatalogLink(link)}>{link} in Indore</Link>
                {index < group.links.length - 1 ? " | " : ""}
              </span>
            ))}
          </p>
        ))}
      </div>

      <div className="footer-grid">
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2>{column.title}</h2>
            {column.links.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}

        <section className="footer-help" aria-label="Need help">
          <h2>Need Help</h2>
          <a href="mailto:support@rentease.local">support@rentease.local</a>
          <a
            href="https://wa.me/919340558874?text=Hi%20RentEase%2C%20I%20need%20help%20with%20a%20rental."
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp: +91 9340558874
          </a>
          <h2>Download App</h2>
          <div className="footer-store-row">
            <Link to="/download/app-store" aria-label="Download on the App Store">
              App Store
            </Link>
            <Link to="/download/google-play" aria-label="Get it on Google Play">
              Google Play
            </Link>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <p>© 2026. RentEase rental services. Flexible furniture, appliances, and essentials.</p>
        <div className="footer-socials" aria-label="Social links">
          {[
            { label: "f", name: "Facebook", to: "/social/facebook" },
            { label: "x", name: "X", to: "/social/x" },
            { label: "in", name: "LinkedIn", to: "/social/linkedin" },
            { label: "yt", name: "YouTube", to: "/social/youtube" },
          ].map((social) => (
            <Link key={social.label} to={social.to} aria-label={`RentEase ${social.name}`}>
              {social.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

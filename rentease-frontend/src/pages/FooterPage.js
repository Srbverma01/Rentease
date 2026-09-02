import { Link, useLocation, useParams } from "react-router-dom";

const footerPages = {
  "/about-us": {
    kicker: "About RentEase",
    title: "Rent essentials without the heavy commitment.",
    intro:
      "RentEase helps customers in Indore rent furniture, appliances, electronics, and daily essentials on simple monthly plans.",
    sections: [
      {
        title: "What we do",
        body:
          "We make it easier to set up a home, student room, office corner, or temporary stay without buying everything upfront.",
      },
      {
        title: "How RentEase helps",
        items: [
          "Monthly rentals for furniture, appliances, electronics, and useful essentials.",
          "A growing catalog with flexible products for homes, students, and working professionals.",
          "Support through email and WhatsApp for product, delivery, and checkout questions.",
        ],
      },
    ],
    actions: [{ label: "Browse rentals", to: "/home#catalog" }],
  },
  "/benefits": {
    kicker: "Benefits",
    title: "Rent more flexibly and spend smarter.",
    intro:
      "RentEase is built for people who want useful products now without long-term ownership pressure.",
    sections: [
      {
        title: "Why customers choose RentEase",
        items: [
          "Lower upfront cost than buying new products.",
          "Easy monthly pricing shown clearly on every product.",
          "Useful options across furniture, appliances, electronics, and packages.",
          "Simple cart and checkout flow for quick rental booking.",
        ],
      },
    ],
    actions: [{ label: "Start browsing", to: "/home#catalog" }],
  },
  "/careers": {
    kicker: "Careers",
    title: "Build practical rental experiences with RentEase.",
    intro:
      "We are always interested in people who care about customer service, operations, design, and reliable technology.",
    sections: [
      {
        title: "Teams we hire for",
        items: [
          "Customer support and rental operations.",
          "Delivery coordination and catalog management.",
          "Product, design, and software development.",
        ],
      },
      {
        title: "Apply",
        body:
          "Send your profile and the role you are interested in to support@rentease.local.",
      },
    ],
    actions: [{ label: "Email RentEase", href: "mailto:support@rentease.local" }],
  },
  "/contact": {
    kicker: "Contact",
    title: "Need help with a rental?",
    intro:
      "Reach out for product availability, delivery questions, checkout support, account help, or rental guidance.",
    sections: [
      {
        title: "Support channels",
        items: [
          "Email: support@rentease.local",
          "WhatsApp: +91 9340558874",
          "Service focus: Indore rental customers.",
        ],
      },
    ],
    actions: [
      { label: "Email support", href: "mailto:support@rentease.local" },
      {
        label: "Open WhatsApp",
        href: "https://wa.me/919340558874?text=Hi%20RentEase%2C%20I%20need%20help%20with%20a%20rental.",
        external: true,
      },
    ],
  },
  "/sitemap": {
    kicker: "Sitemap",
    title: "Find the main RentEase pages.",
    intro: "Use this page to jump to catalog, account, support, policy, and company pages.",
    sections: [
      {
        title: "Main pages",
        links: [
          { label: "Home catalog", to: "/home#catalog" },
          { label: "Cart", to: "/cart" },
          { label: "Profile", to: "/profile" },
          { label: "Order history", to: "/history" },
        ],
      },
      {
        title: "Company and support",
        links: [
          { label: "About Us", to: "/about-us" },
          { label: "Benefits", to: "/benefits" },
          { label: "Support Home", to: "/support" },
          { label: "Contact", to: "/contact" },
        ],
      },
    ],
  },
  "/business": {
    kicker: "Business",
    title: "Rental support for teams, offices, and business needs.",
    intro:
      "RentEase for Business supports bulk or recurring rental needs for office setups, employee housing, and temporary projects.",
    sections: [
      {
        title: "Business use cases",
        items: [
          "Furniture and appliance packages for teams.",
          "Short-term setups for events, projects, and office moves.",
          "Catalog and pricing help through RentEase support.",
        ],
      },
    ],
    actions: [{ label: "Contact business support", to: "/contact" }],
  },
  "/blog": {
    kicker: "Blog",
    title: "Rental ideas, setup tips, and RentEase updates.",
    intro:
      "The RentEase blog shares practical guidance for choosing rental products and setting up comfortable spaces.",
    sections: [
      {
        title: "Featured topics",
        items: [
          "How to choose furniture for a rented home.",
          "When renting appliances makes more sense than buying.",
          "Starter packages for students and working professionals.",
        ],
      },
    ],
  },
  "/support": {
    kicker: "Support",
    title: "Help for browsing, checkout, and rentals.",
    intro:
      "Support Home brings together the most common RentEase questions in one place.",
    sections: [
      {
        title: "Common help topics",
        items: [
          "Choosing the right product or rental package.",
          "Understanding monthly rental prices.",
          "Checkout, order history, and rental status.",
          "Account email and password recovery help.",
        ],
      },
    ],
    actions: [{ label: "Contact support", to: "/contact" }],
  },
  "/documents-required": {
    kicker: "Documents",
    title: "Documents required for a smooth rental.",
    intro:
      "RentEase may request basic details to verify orders and coordinate delivery.",
    sections: [
      {
        title: "Typical requirements",
        items: [
          "Customer name and contact number.",
          "Delivery address and rental duration.",
          "Identity or address confirmation when needed.",
        ],
      },
    ],
  },
  "/annual-returns": {
    kicker: "Annual Returns",
    title: "Annual business updates and returns.",
    intro:
      "This page is reserved for annual RentEase business updates, filings, and company notices.",
    sections: [
      {
        title: "Current status",
        body:
          "No annual return documents are published in this demo catalog yet. RentEase will update this page when documents are available.",
      },
    ],
  },
  "/investor-relations": {
    kicker: "Investor Relations",
    title: "Company information for future partners.",
    intro:
      "Investor Relations is a placeholder for RentEase company updates, growth notes, and partner information.",
    sections: [
      {
        title: "Contact",
        body:
          "For partnership or investor queries, contact support@rentease.local with your organization details.",
      },
    ],
    actions: [{ label: "Email RentEase", href: "mailto:support@rentease.local" }],
  },
  "/shipping-policy": {
    kicker: "Policy",
    title: "Shipping and delivery policy.",
    intro:
      "RentEase delivery is planned to help customers receive rental products safely and on schedule.",
    sections: [
      {
        title: "Delivery basics",
        items: [
          "Delivery timing depends on product availability and service location.",
          "Support may contact you to confirm address and timing.",
          "Large products may require accessible building entry and customer availability.",
        ],
      },
    ],
  },
  "/cancellation-return": {
    kicker: "Policy",
    title: "Cancellation and return policy.",
    intro:
      "RentEase aims to keep cancellation and return requests simple, fair, and support-led.",
    sections: [
      {
        title: "How it works",
        items: [
          "Contact support as early as possible for cancellation requests.",
          "Return timing depends on product type, pickup availability, and rental status.",
          "Support will guide you through the next step for active orders.",
        ],
      },
    ],
  },
  "/privacy-policy": {
    kicker: "Policy",
    title: "Privacy policy.",
    intro:
      "RentEase uses customer information to support accounts, orders, rentals, and service communication.",
    sections: [
      {
        title: "Information use",
        items: [
          "Account details help with login, support, and order history.",
          "Contact details help coordinate rentals and support requests.",
          "RentEase does not need sensitive payment details inside this demo flow.",
        ],
      },
    ],
  },
  "/rental-terms": {
    kicker: "Terms",
    title: "Rental terms and conditions.",
    intro:
      "These terms explain the expected basics for renting products through RentEase.",
    sections: [
      {
        title: "Rental expectations",
        items: [
          "Monthly prices are shown with each product before checkout.",
          "Customers should keep rented products in usable condition.",
          "Order history records checkout details and rental status.",
        ],
      },
    ],
  },
  "/referral-terms": {
    kicker: "Terms",
    title: "Referral terms and conditions.",
    intro:
      "Referral offers may be introduced by RentEase for eligible customers and campaigns.",
    sections: [
      {
        title: "Referral basics",
        items: [
          "Referral benefits depend on the active campaign.",
          "RentEase may verify referred accounts and rental activity.",
          "Support can confirm whether a referral offer is currently available.",
        ],
      },
    ],
  },
};

const downloadPages = {
  "app-store": {
    kicker: "Download App",
    title: "RentEase for iPhone is coming soon.",
    intro:
      "The RentEase App Store listing is not live yet. You can keep renting from the website today.",
  },
  "google-play": {
    kicker: "Download App",
    title: "RentEase for Android is coming soon.",
    intro:
      "The RentEase Google Play listing is not live yet. You can keep renting from the website today.",
  },
};

const socialPages = {
  facebook: {
    kicker: "Social",
    title: "RentEase on Facebook.",
    intro:
      "The Facebook page is being prepared. For now, use the website or WhatsApp for rental help.",
  },
  x: {
    kicker: "Social",
    title: "RentEase on X.",
    intro:
      "The X profile is being prepared. Product updates and quick announcements will appear here in future.",
  },
  linkedin: {
    kicker: "Social",
    title: "RentEase on LinkedIn.",
    intro:
      "The LinkedIn page is being prepared for company, hiring, and partnership updates.",
  },
  youtube: {
    kicker: "Social",
    title: "RentEase on YouTube.",
    intro:
      "The YouTube channel is being prepared for product explainers and rental setup videos.",
  },
};

const browseTitles = {
  "package-on-rent": "Package on Rent",
  "furniture-on-rent": "Furniture on Rent",
  "appliance-on-rent": "Appliance on Rent",
  "electronics-on-rent": "Electronics on Rent",
  "baby-furniture": "Baby Furniture",
  "fitness-equipment": "Fitness Equipment",
  "refrigerator-and-freezer": "Refrigerator and Freezer",
  "washing-machine": "Washing Machine",
  "air-conditioner": "Air Conditioner",
  "microwaves-and-induction": "Microwaves and Induction",
  television: "Television",
  "air-cooler": "Air Cooler",
  dishwasher: "Dishwasher",
  "water-purifiers": "Water Purifiers",
  "air-purifier": "Air Purifier",
  "bedroom-furniture": "Bedroom Furniture",
  "work-from-home-furniture": "Work From Home Furniture",
  "living-room-furniture": "Living Room Furniture",
  "kitchen-and-dining-room": "Kitchen and Dining Room",
  "smart-phones": "Smart Phones",
  "smart-devices": "Smart Devices",
  laptop: "Laptop",
  tablets: "Tablets",
  "1-ton-ac": "1 ton AC",
  "1-5-ton-ac": "1.5 ton AC",
  "2-ton-ac": "2 ton AC",
};

function PageActions({ actions = [] }) {
  if (!actions.length) {
    return null;
  }

  return (
    <div className="static-page-actions">
      {actions.map((action) =>
        action.href ? (
          <a
            className="static-page-action"
            href={action.href}
            key={action.label}
            rel={action.external ? "noreferrer" : undefined}
            target={action.external ? "_blank" : undefined}
          >
            {action.label}
          </a>
        ) : (
          <Link className="static-page-action" key={action.label} to={action.to}>
            {action.label}
          </Link>
        )
      )}
    </div>
  );
}

function StaticPageContent({ page }) {
  return (
    <div className="page-shell static-page">
      <div className="page-header">
        <span className="section-kicker">{page.kicker}</span>
        <h1 className="section-title">{page.title}</h1>
        <p className="section-subtitle">{page.intro}</p>
        <PageActions actions={page.actions} />
      </div>

      {page.sections?.length ? (
        <div className="static-page-grid">
          {page.sections.map((section) => (
            <section className="account-card static-page-card" key={section.title}>
              <h2 className="account-card-title">{section.title}</h2>
              {section.body ? <p className="account-copy">{section.body}</p> : null}
              {section.items ? (
                <ul className="static-page-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.links ? (
                <div className="static-link-list">
                  {section.links.map((link) => (
                    <Link key={link.label} to={link.to}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FooterPage() {
  const location = useLocation();
  const { browseSlug, downloadSlug, socialSlug } = useParams();

  if (browseSlug) {
    const title = browseTitles[browseSlug] || "Rental Category";
    return (
      <StaticPageContent
        page={{
          kicker: "Browse Rentals",
          title: `${title} in Indore`,
          intro:
            "Explore matching RentEase products from the main catalog and add the right monthly rental items to your cart.",
          sections: [
            {
              title: "What you can do here",
              items: [
                "Review available RentEase products from the catalog.",
                "Compare monthly rental prices before adding items to cart.",
                "Use support if you need help choosing the right item.",
              ],
            },
          ],
          actions: [{ label: "Open catalog", to: "/home#catalog" }],
        }}
      />
    );
  }

  if (downloadSlug) {
    const page = downloadPages[downloadSlug];
    if (page) {
      return (
        <StaticPageContent
          page={{
            ...page,
            sections: [
              {
                title: "Use RentEase today",
                body:
                  "Until the mobile app is available, the RentEase website supports browsing, cart, checkout, profile, and order history.",
              },
            ],
            actions: [{ label: "Browse website catalog", to: "/home#catalog" }],
          }}
        />
      );
    }
  }

  if (socialSlug) {
    const page = socialPages[socialSlug];
    if (page) {
      return (
        <StaticPageContent
          page={{
            ...page,
            sections: [
              {
                title: "Stay connected",
                body:
                  "For current product and rental support, contact RentEase directly by email or WhatsApp.",
              },
            ],
            actions: [{ label: "Contact RentEase", to: "/contact" }],
          }}
        />
      );
    }
  }

  const page = footerPages[location.pathname];

  if (page) {
    return <StaticPageContent page={page} />;
  }

  return (
    <StaticPageContent
      page={{
        kicker: "Page",
        title: "This RentEase page is not available yet.",
        intro: "Use the catalog or support pages to continue browsing RentEase.",
        actions: [
          { label: "Open catalog", to: "/home#catalog" },
          { label: "Support Home", to: "/support" },
        ],
      }}
    />
  );
}

export default FooterPage;

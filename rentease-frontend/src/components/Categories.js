const categories = [
  {
    code: "LV",
    title: "Living Room",
    copy: "Sofas, coffee tables, and accents that make a blank room feel settled.",
    meta: "Comfort-first styling",
    tint: "rgba(201, 111, 74, 0.08)",
  },
  {
    code: "BD",
    title: "Bedroom",
    copy: "Beds, side tables, and calming essentials for restful spaces.",
    meta: "Warm, quiet palettes",
    tint: "rgba(44, 110, 99, 0.08)",
  },
  {
    code: "WK",
    title: "Workspace",
    copy: "Desks and productivity pieces that support focused days at home.",
    meta: "Work-from-home ready",
    tint: "rgba(20, 33, 61, 0.06)",
  },
  {
    code: "AP",
    title: "Appliances",
    copy: "Useful daily hardware for kitchens, laundry corners, and practical living.",
    meta: "Function with flexibility",
    tint: "rgba(233, 190, 149, 0.16)",
  },
];

function Categories() {
  return (
    <section className="section-shell">
      <div className="section-head">
        <span className="section-kicker">Collections</span>
        <h2 className="section-title">Choose by room, mood, or the life stage you are in.</h2>
        <p className="section-subtitle">
          Every category is organized to make moving faster and home styling simpler.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article
            className="category-card"
            key={category.title}
            style={{ "--category-tint": category.tint }}
          >
            <span className="category-chip">{category.code}</span>
            <h3 className="category-title">{category.title}</h3>
            <p className="category-copy">{category.copy}</p>
            <span className="category-meta">{category.meta}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Categories;

import { useMatrixData } from "./useMatrix.js";
import React, { useMemo, useState } from "react";

const TAXONOMY = {
  industries: [
    "FEC / Indoor Play",
    "Theme Parks",
    "Museums & Zoos",
    "Adventure Parks",
    "Trampoline Parks",
    "Climbing Gyms",
  ],
  verticals: ["Payments", "Integrations", "Operations", "Compliance", "Marketing", "Analytics"],
};

const MATRIX_DATA = [
  {
    category: "Pricing",
    color: "bg-orange-500",
    tiles: [
      {
        title: "General Admission",
        summary: "Single-price entry without time slot complexity.",
        tags: ["GA", "Simple"],
        industries: ["FEC / Indoor Play", "Theme Parks"],
        verticals: ["Ticketing"],
        qa: [
          { q: "Is GA capacity-limited or unlimited?", a: "Capture venue max capacity and per-interval throttling to avoid overbooking." },
          { q: "Do you need dynamic or seasonal price changes?", a: "Support for price books and date-driven rules; consider yield toggles." },
        ],
      },
      {
        title: "Dynamic Pricing",
        summary: "Price varies by demand, daypart, and lead time.",
        tags: ["Yield", "Rules"],
        industries: ["FEC / Indoor Play", "Adventure Parks"],
        verticals: ["Revenue Ops"],
        qa: [
          { q: "Which inputs control price?", a: "Demand percentile, weekday/weekend, holidays, lead time, inventory left." },
          { q: "Do you need guardrails?", a: "Configure min/max bands and hard caps per product family." },
        ],
      },
      {
        title: "Holiday Surcharge",
        summary: "Override or uplift for special dates.",
        tags: ["Calendar", "Override"],
        industries: ["Theme Parks", "Museums & Zoos"],
        verticals: ["Revenue Ops"],
        qa: [{ q: "Which calendars apply?", a: "National holidays, school breaks, venue-specific events." }],
      },
    ],
  },
  {
    category: "Ticketing / Bookings",
    color: "bg-orange-500",
    tiles: [
      {
        title: "Standard Session Admission",
        summary: "Time-boxed sessions with fixed duration (e.g., 60 min).",
        tags: ["Timeslots"],
        industries: ["Trampoline Parks", "Adventure Parks"],
        verticals: ["Ticketing"],
        qa: [
          { q: "Is check-in scanning required?", a: "Use POS/VM scan with validation and late-arrival tolerance window." },
          { q: "Do sessions chain together?", a: "If multi-session, enable back-to-back booking with buffer rules." },
        ],
      },
      {
        title: "Multi-Session Bookings",
        summary: "Bundle several activities in one checkout.",
        tags: ["Bundles", "Packs"],
        industries: ["Adventure Parks", "Theme Parks"],
        verticals: ["Ticketing"],
        qa: [
          { q: "Are resources shared?", a: "Define resource pools and block via dynamic slots to avoid conflicts." },
          { q: "Cross-venue booking?", a: "If yes, confirm settlement and capacity sync across sites." },
        ],
      },
      {
        title: "Check In/Out, Timer Based",
        summary: "Open-ended entry with clocked duration and upsells.",
        tags: ["Timer", "Usage"],
        industries: ["FEC / Indoor Play"],
        verticals: ["Ticketing"],
        qa: [{ q: "Grace periods?", a: "Configurable grace at entry/exit for billing fairness." }],
      },
    ],
  },
  {
    category: "Memberships",
    color: "bg-orange-500",
    tiles: [
      {
        title: "Non-Recurring Memberships",
        summary: "Fixed-term passes without auto-renew.",
        tags: ["Passes"],
        industries: ["Museums & Zoos", "Climbing Gyms"],
        verticals: ["Memberships"],
        qa: [{ q: "How is eligibility verified?", a: "Barcode, QR, or account lookup at POS." }],
      },
      {
        title: "Recurring Memberships",
        summary: "Monthly/annual with billing and dunning.",
        tags: ["Auto-renew", "Dunning"],
        industries: ["FEC / Indoor Play", "Trampoline Parks"],
        verticals: ["Memberships"],
        qa: [
          { q: "Pause/suspend rules?", a: "Define pause windows, pro-rations, and reinstatements." },
          { q: "Perks?", a: "Member-only pricing, priority booking, free add-ons." },
        ],
      },
      {
        title: "Group / Family Memberships",
        summary: "Shared entitlements and caps across members.",
        tags: ["Family", "Limits"],
        industries: ["FEC / Indoor Play"],
        verticals: ["Memberships"],
        qa: [{ q: "How many linked members?", a: "Household size, child vs adult permissions." }],
      },
      {
        title: "Multi-Tier Memberships",
        summary: "Bronze/Silver/Gold with benefit ladders.",
        tags: ["Tiers"],
        industries: ["Theme Parks", "Climbing Gyms"],
        verticals: ["Memberships"],
        qa: [{ q: "Upgrade/downgrade path?", a: "Immediate vs next cycle with credit rules." }],
      },
    ],
  },
  {
    category: "CRM",
    color: "bg-orange-500",
    tiles: [
      {
        title: "Guest Records",
        summary: "Unified profile of visits, waivers, orders.",
        tags: ["CDP"],
        industries: TAXONOMY.industries,
        verticals: ["CRM / Marketing"],
        qa: [{ q: "Data retention?", a: "Align with GDPR and local retention policies." }],
      },
      {
        title: "Guest Segmentation",
        summary: "Build audiences by behavior and value.",
        tags: ["Segments", "RFM"],
        industries: TAXONOMY.industries,
        verticals: ["CRM / Marketing"],
        qa: [{ q: "Channels?", a: "Email, SMS, ads; confirm consent and providers." }],
      },
      {
        title: "Loyalty Points",
        summary: "Earn/redeem rules across products.",
        tags: ["Loyalty"],
        industries: TAXONOMY.industries,
        verticals: ["CRM / Marketing"],
        qa: [{ q: "Breakage handling?", a: "Expiry schedules and accounting treatment." }],
      },
      {
        title: "Referral Programs",
        summary: "Track referrers and rewards.",
        tags: ["Growth"],
        industries: TAXONOMY.industries,
        verticals: ["CRM / Marketing"],
        qa: [{ q: "Fraud checks?", a: "Unique codes, velocity limits, K-factor monitoring." }],
      },
      {
        title: "Personalized Marketing",
        summary: "Offers and content by persona.",
        tags: ["1:1"],
        industries: TAXONOMY.industries,
        verticals: ["CRM / Marketing"],
        qa: [{ q: "What data feeds it?", a: "RFM, recency, pass type, last activity, cart abandons." }],
      },
    ],
  },
  {
    category: "Events",
    color: "bg-orange-500",
    tiles: [
      {
        title: "Kids Birthday Parties",
        summary: "Packages with rooms, hosts, and F&B upsells.",
        tags: ["Parties"],
        industries: ["FEC / Indoor Play", "Trampoline Parks"],
        verticals: ["Events", "F&B"],
        qa: [{ q: "Room/host assignment?", a: "Use resource pools; conflict checking on save." }],
      },
      {
        title: "School / Community Trips",
        summary: "Group invoicing and arrival management.",
        tags: ["B2B"],
        industries: ["Museums & Zoos", "Adventure Parks"],
        verticals: ["Events"],
        qa: [{ q: "Payment terms?", a: "Deposits vs post-invoice; AR workflow needed?" }],
      },
      {
        title: "Large Corporate Events",
        summary: "Multi-area holds with contracts.",
        tags: ["Corporate"],
        industries: TAXONOMY.industries,
        verticals: ["Events"],
        qa: [{ q: "Hold policy?", a: "Soft holds, expiry timers, deposit to confirm." }],
      },
      {
        title: "Custom Invoices",
        summary: "Line-itemized pro-formas and tax rules.",
        tags: ["AR"],
        industries: TAXONOMY.industries,
        verticals: ["Events"],
        qa: [{ q: "Tax/VAT IDs?", a: "Capture and validate VAT/NIF with locale labels." }],
      },
      {
        title: "Event Contracts",
        summary: "Templates, e-sign, versioning.",
        tags: ["Docs"],
        industries: TAXONOMY.industries,
        verticals: ["Events"],
        qa: [{ q: "Approval steps?", a: "Redlines, signature order, and audit trail." }],
      },
    ],
  },
  {
    category: "F&B",
    color: "bg-orange-500",
    tiles: [
      {
        title: "Pre-packaged / Grab & Go",
        summary: "Quick-serve kiosks or POS lanes.",
        tags: ["QSR"],
        industries: TAXONOMY.industries,
        verticals: ["F&B"],
        qa: [{ q: "Inventory needs?", a: "Decrement on sale; low-stock alerts." }],
      },
      {
        title: "Counter Service / Light Kitchen",
        summary: "Simple prep with modifiers.",
        tags: ["Modifiers"],
        industries: TAXONOMY.industries,
        verticals: ["F&B"],
        qa: [{ q: "Order routing?", a: "Kitchen tickets by station; expo screen optional." }],
      },
      {
        title: "Counter Service / Full Kitchen",
        summary: "Cook times and course pacing.",
        tags: ["KDS"],
        industries: TAXONOMY.industries,
        verticals: ["F&B"],
        qa: [{ q: "Allergens?", a: "Flag on menu; require acknowledgment in checkout." }],
      },
      {
        title: "Counter + Bar",
        summary: "Age-restricted beverages with ID checks.",
        tags: ["Bar"],
        industries: TAXONOMY.industries,
        verticals: ["F&B"],
        qa: [{ q: "ID policy?", a: "Manual verify vs scanner; incident logging." }],
      },
      {
        title: "Table Service / Reservations",
        summary: "Seated service with table turns.",
        tags: ["Tables", "Resy"],
        industries: TAXONOMY.industries,
        verticals: ["F&B"],
        qa: [{ q: "Floor map?", a: "Zones, capacity, and server sections for pacing." }],
      },
    ],
  },
];

const classNames = (...xs) => xs.filter(Boolean).join(" ");

function useFilteredTiles(query, category, industry, vertical, DATA) {
  const all = useMemo(() => {
    return MATRIX_DATA.flatMap((col) => col.tiles.map((t) => ({ ...t, __category: col.category })));
  }, []);
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((t) => {
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchC = !category || t.__category === category;
      const matchI = !industry || (t.industries || []).includes(industry);
      const matchV = !vertical || new Set([...(t.verticals||[]), ({ "Pricing":"Analytics","Ticketing / Bookings":"Operations","Memberships":"Marketing","CRM":"Marketing","Events":"Operations","F&B":"Operations" }[t.__category])].filter(Boolean)).has(vertical);
      return matchQ && matchC && matchI && matchV;
    });
  }, [all, query, category, industry, vertical]);
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function QAItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200">
      <button className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50" onClick={() => setOpen((s) => !s)}>
        <span className="font-medium">{q}</span>
        <span className="text-slate-400">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-slate-700">{a}</div>}
    </div>
  );
}

function Tile({ tile, onOpen }) {
  return (
    <button onClick={onOpen} className="block h-full w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
      <div className="text-sm font-semibold leading-snug">{tile.title}</div>
      <div className="mt-1 line-clamp-2 text-xs text-slate-600">{tile.summary}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {tile.tags?.map((t) => (
          <span key={t} className="rounded-full border px-2 py-0.5 text-[10px] text-slate-600">{t}</span>
        ))}
      </div>
    </button>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="rounded-xl border border-slate-700/40 bg-slate-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt || placeholder}
        </option>
      ))}
    </select>
  );
}

export default function RollerDiscoveryMatrix() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [vertical, setVertical] = useState("");
  const [active, setActive] = useState(null);

  const DATA = useMatrixData(MATRIX_DATA);
  const filtered = useFilteredTiles(query, category, industry, vertical, DATA);

  return (
    <div className="min-h-screen w-full bg-slate-100 p-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-lg">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold tracking-tight">ROLLER Discovery Matrix</h1>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scenarios, tags, or notes…"
                className="col-span-2 rounded-xl border border-slate-700/40 bg-slate-800/60 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 md:col-span-1"
              />
              <Select value={category} onChange={setCategory} placeholder="Category" options={["", ...DATA.map((c) => c.category)]} />
              <Select value={industry} onChange={setIndustry} placeholder="Industry" options={["", ...TAXONOMY.industries]} />
              <Select value={vertical} onChange={setVertical} placeholder="Vertical" options={["", ...TAXONOMY.verticals]} />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {filtered.length} scenario{filtered.length === 1 ? "" : "s"} match your filters.
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {DATA.map((col) => (
            <div key={col.category} className="flex flex-col gap-3">
              <div className={classNames("rounded-xl px-3 py-2 text-center text-sm font-bold text-white shadow", col.color)}>{col.category}</div>
              {col.tiles.map((tile) => {
                const visible = filtered.some((t) => t.title === tile.title && t.__category === col.category);
                return (
                  <div key={tile.title} className={classNames(visible ? "" : "opacity-30 grayscale")}>
                    <Tile tile={tile} onOpen={() => setActive({ ...tile, category: col.category })} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <Modal open={!!active} onClose={() => setActive(null)}>
          {active && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{active.category}</div>
              <h2 className="text-xl font-bold leading-tight">{active.title}</h2>
              <p className="mt-1 text-slate-600">{active.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {active.tags?.map((t) => (
                  <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{t}</span>
                ))}
                {active.industries?.length ? <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Industries: {active.industries.join(", ")}</span> : null}
                {active.verticals?.length ? <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Verticals: {active.verticals.join(", ")}</span> : null}
              </div>
              <div className="mt-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">Discovery Q&A</h3>
                {(active.qa?.length ? active.qa : []).map((row, i) => (
                  <QAItem key={i} q={row.q} a={row.a} />
                ))}
                {!active.qa?.length && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No Q&A yet. Use this space during discovery to capture needs, constraints, and integrations.
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setActive(null)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90">Close</button>
                <button onClick={() => navigator.clipboard.writeText(`${active.category} › ${active.title}`)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">Copy title</button>
              </div>
            </div>
          )}
        </Modal>

        <footer className="mt-8 pb-6 text-center text-xs text-slate-500">ROLLER – Discovery Matrix • Click any tile to open Q&A</footer>
      </div>
    </div>
  );
}

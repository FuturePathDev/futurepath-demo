// src/pages/ResourcesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  searchResources,
  listBookmarks,
  addBookmark,
  removeBookmark,
  getResource,
} from "../api/Resources.js";

/* ======= Filters / Data Constants ======= */
const FORMATS = ["Guide", "Checklist", "Video", "Worksheet"];
const AUDIENCE = ["Students", "Parents"];
const GRADES = ["9", "10", "11", "12"];

/* ---------- Quick Actions (search presets) ---------- */
const SHORTCUTS = [
  { label: "FAFSA", set: { query: "FAFSA", audience: ["Students", "Parents"] } },
  { label: "FAFSA Checklist", set: { query: "FAFSA Quick Checklist" } },
  { label: "Scholarships", set: { query: "Scholarship" } },
  { label: "SAT Prep", set: { query: "SAT", formats: ["Guide"] } },
  { label: "ACT Prep", set: { query: "ACT" } },
  { label: "Apprenticeships", set: { query: "Apprenticeships" } },
  { label: "CSS Profile", set: { query: "CSS Profile" } },
  { label: "CC Transfer", set: { query: "Transfer Guide" } },
  { label: "Healthcare Shadowing", set: { query: "Shadowing" } },
];

/* ---------- Direct Links (jump to detail) ---------- */
const QUICK_LINKS = [
  { label: "FAFSA Walkthrough", id: "faFsa-walkthrough-2025" },
  { label: "FAFSA Quick Checklist", id: "fafsa-quick-checklist-2025" },
  { label: "FAFSA Video", id: "fafsa-video-walkthrough-2025" },
  { label: "Scholarship Essay Template", id: "scholarship-essay-template" },
  { label: "SAT Quickstart", id: "sat-prep-quickstart" },
  { label: "ACT 8-Week Plan", id: "act-prep-8-week-plan" },
  { label: "Apprenticeships 101", id: "apprenticeships-101" },
  { label: "CSS Profile Guide", id: "css-profile-guide-2025" },
  { label: "CC → Univ Transfer", id: "cc-transfer-guide" },
  { label: "Healthcare Shadowing", id: "healthcare-shadowing-checklist" },
];

/* ---------- Featured (curated) ---------- */
const FEATURED = [
  { id: "faFsa-walkthrough-2025", blurb: "Best starting point for federal aid." },
  { id: "fafsa-quick-checklist-2025", blurb: "Everything you need before you start." },
  { id: "scholarship-search-starter", blurb: "How to find scholarships, weekly." },
  { id: "scholarship-essay-template", blurb: "Template + examples to move fast." },
  { id: "sat-prep-quickstart", blurb: "10-min plan to kick things off." },
  { id: "apprenticeships-101", blurb: "Earn-while-you-learn pathways." },
];

/* =====================================================
   Inner content of the Resources page (original UI)
   ===================================================== */
function ResourcesContent() {
  const navigate = useNavigate();

  // Query + filters
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState(["Students", "Parents"]);
  const [grades, setGrades] = useState([]);
  const [formats, setFormats] = useState([]);

  // Data
  const [items, setItems] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Bookmarks (resourceId set)
  const [saved, setSaved] = useState(() => new Set());
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const bms = await listBookmarks();
        const arr = Array.isArray(bms?.items) ? bms.items : Array.isArray(bms) ? bms : [];
        if (!ignore) setSaved(new Set(arr.map((b) => b.resourceId)));
      } catch {
        // ignore for demo
      }
    })();
    return () => { ignore = true; };
  }, []);

  const params = useMemo(
    () => ({
      query: query.trim() || undefined,
      audience,
      grades,
      formats,
    }),
    [query, audience, grades, formats]
  );

  // keys to satisfy eslint on complex deps
  const audienceKey = useMemo(() => audience.join(","), [audience]);
  const gradesKey = useMemo(() => grades.join(","), [grades]);
  const formatsKey = useMemo(() => formats.join(","), [formats]);

  async function runSearch(reset = true, tokenOverride = null) {
    setLoading(true);
    setErr("");
    try {
      const { items: page = [], nextToken: nt } = await searchResources({
        ...params,
        nextToken: tokenOverride ?? undefined,
      });
      setItems((prev) => (reset ? page : [...prev, ...page]));
      setNextToken(nt ?? null);
    } catch (e) {
      setErr(e?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  // Fetch on filters change
  useEffect(() => {
    runSearch(true, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query, audienceKey, gradesKey, formatsKey]);

  function toggleSel(list, setList, value) {
    setList((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  }

  async function toggleBookmark(id) {
    const isSaved = saved.has(id);
    try {
      if (!isSaved) {
        await addBookmark(id);
        setSaved((s) => new Set([...s, id]));
      } else {
        await removeBookmark(id);
        setSaved((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    } catch {
      // no-op for demo
    }
  }

  // Quick actions
  function applyShortcut(preset) {
    setQuery(preset.query ?? "");
    setAudience(preset.audience ?? []);
    setGrades(preset.grades ?? []);
    setFormats(preset.formats ?? []);
    setNextToken(null);
  }
  function goToResource(id) {
    navigate(`/resources/${encodeURIComponent(id)}`);
  }

  /* ---------- Load Featured ---------- */
  const [featured, setFeatured] = useState([]);
  const [featuredErr, setFeaturedErr] = useState("");
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const results = await Promise.all(
          FEATURED.map(async (f) => {
            try {
              const r = await getResource(f.id);
              return r ? { ...r, _blurb: f.blurb } : null;
            } catch {
              return null;
            }
          })
        );
        if (!ignore) setFeatured(results.filter(Boolean));
      } catch (e) {
        if (!ignore) setFeaturedErr(e?.message || "Failed to load featured");
      }
    })();
    return () => { ignore = true; };
  }, []);

  const showFeatured = !query.trim(); // show when not actively searching

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Resources</h1>

        {/* Search */}
        <div style={styles.searchRow}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (e.g., FAFSA, scholarships, SAT)…"
            style={styles.input}
          />
        </div>

        {/* Quick actions */}
        <section style={styles.quickWrap}>
          <div style={styles.quickGroup}>
            <div style={styles.quickLabel}>Popular</div>
            <div style={styles.quickRow}>
              {SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => applyShortcut(s.set)}
                  style={styles.quickBtn}
                  title={`Search: ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.quickGroup}>
            <div style={styles.quickLabel}>Direct Links</div>
            <div style={styles.quickRow}>
              {QUICK_LINKS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goToResource(q.id)}
                  style={{ ...styles.quickBtn, ...styles.quickBtnHollow }}
                  title={`Open: ${q.label}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <div style={styles.filters}>
          <FilterGroup label="Audience">
            {AUDIENCE.map((a) => (
              <Chip
                key={a}
                active={audience.includes(a)}
                onClick={() => toggleSel(audience, setAudience, a)}
              >
                {a}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Grades">
            {GRADES.map((g) => (
              <Chip
                key={g}
                active={grades.includes(g)}
                onClick={() => toggleSel(grades, setGrades, g)}
              >
                {g}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Formats">
            {FORMATS.map((f) => (
              <Chip
                key={f}
                active={formats.includes(f)}
                onClick={() => toggleSel(formats, setFormats, f)}
              >
                {f}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </header>

      {/* Featured */}
      {showFeatured && (
        <section style={styles.featuredWrap}>
          <div style={styles.rowHeader}>
            <h2 style={styles.h2}>Featured Resources</h2>
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Curated picks for the season
            </span>
          </div>

          {featuredErr ? (
            <div style={styles.err}>{featuredErr}</div>
          ) : (
            <div style={styles.grid}>
              {featured.map((r) => (
                <article key={r.id} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <Link to={`/resources/${encodeURIComponent(r.id)}`} style={styles.titleLink}>
                      {r.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(r.id)}
                      style={{ ...styles.bookmarkBtn, ...(saved.has(r.id) ? styles.bookmarkOn : null) }}
                      title={saved.has(r.id) ? "Remove bookmark" : "Save bookmark"}
                    >
                      {saved.has(r.id) ? "★" : "☆"}
                    </button>
                  </div>
                  <p style={styles.sum}>{r.summary}</p>
                  {r._blurb ? (
                    <div style={{ fontSize: 12, color: "#0369a1" }}>• {r._blurb}</div>
                  ) : null}
                  <div style={styles.metaRow}>
                    <Badge>Featured</Badge>
                    {r.audience?.map((x) => <Badge key={x}>{x}</Badge>)}
                    {r.grades?.length ? <Badge>Grades {r.grades.join(", ")}</Badge> : null}
                    {r.formats?.map((x) => <Badge key={x}>{x}</Badge>)}
                    {typeof r.durationMin === "number" ? <Badge>{r.durationMin} min</Badge> : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {err ? <div style={styles.err}>{err}</div> : null}

      {/* Results */}
      <section style={styles.grid}>
        {items.map((r) => (
          <article key={r.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <Link to={`/resources/${encodeURIComponent(r.id)}`} style={styles.titleLink}>
                {r.title}
              </Link>
              <button
                type="button"
                onClick={() => toggleBookmark(r.id)}
                style={{ ...styles.bookmarkBtn, ...(saved.has(r.id) ? styles.bookmarkOn : null) }}
                title={saved.has(r.id) ? "Remove bookmark" : "Save bookmark"}
              >
                {saved.has(r.id) ? "★" : "☆"}
              </button>
            </div>

            <p style={styles.sum}>{r.summary}</p>

            <div style={styles.metaRow}>
              {r.audience?.map((x) => (
                <Badge key={x}>{x}</Badge>
              ))}
              {r.grades?.length ? <Badge>Grades {r.grades.join(", ")}</Badge> : null}
              {r.costType ? <Badge>{r.costType}</Badge> : null}
              {r.formats?.map((x) => (
                <Badge key={x}>{x}</Badge>
              ))}
              {typeof r.durationMin === "number" ? (
                <Badge>{r.durationMin} min</Badge>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        {nextToken ? (
          <button
            disabled={loading}
            onClick={() => runSearch(false, nextToken)}
            style={styles.loadMore}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : items.length && !loading ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>No more results</div>
        ) : null}
      </div>
    </div>
  );
}

/* ======= Small subcomponents used above ======= */
function FilterGroup({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        border: `1px solid ${active ? "#0ea5e9" : "#cbd5e1"}`,
        background: active ? "rgba(14,165,233,0.1)" : "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        fontSize: 12,
        border: "1px solid #e2e8f0",
        padding: "2px 8px",
        borderRadius: 999,
        background: "#f8fafc",
      }}
    >
      {children}
    </span>
  );
}

/* ======= Inline styles for the inner content ======= */
const styles = {
  wrap: { maxWidth: 1000, margin: "0 auto", padding: "20px 16px 40px", display: "grid", gap: 12 },
  header: { display: "grid", gap: 10 },
  h1: { margin: 0, fontSize: 24, color: "#0f172a" },
  searchRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    minWidth: 260,
    fontSize: 14,
  },

  /* Quick actions */
  quickWrap: {
    display: "grid",
    gap: 10,
    padding: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "linear-gradient(180deg,#ffffff, #f8fafc)",
  },
  quickGroup: { display: "grid", gap: 6 },
  quickLabel: { fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  quickRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  quickBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  quickBtnHollow: {
    borderColor: "#cbd5e1",
    background: "#ffffff",
  },

  /* Filters + results */
  filters: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    padding: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "white",
  },

  /* Featured */
  featuredWrap: { display: "grid", gap: 10, marginTop: 6 },
  rowHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  h2: { margin: 0, fontSize: 18, color: "#0f172a" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
    marginTop: 6,
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gap: 8,
  },
  titleLink: { color: "#0f172a", textDecoration: "none", fontWeight: 700 },
  bookmarkBtn: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 10,
    padding: "4px 8px",
    cursor: "pointer",
    lineHeight: 1,
  },
  bookmarkOn: { borderColor: "#fde68a", background: "#fffbeb" },
  sum: { margin: 0, color: "#334155", fontSize: 14 },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  loadMore: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  err: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
  },
};

/* =====================================================
   Export: just the inner content (no layout wrapper)
   ===================================================== */
export default function ResourcesPage() {
  return <ResourcesContent />;
}










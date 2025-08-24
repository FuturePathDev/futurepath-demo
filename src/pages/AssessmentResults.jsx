import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx"; // ⬅️ prefer context

/** Resolve API base */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

const CAT_INFO = {
  R: { name: "Realistic", color: "#10b981" },
  I: { name: "Investigative", color: "#06b6d4" },
  A: { name: "Artistic", color: "#a855f7" },
  S: { name: "Social", color: "#f59e0b" },
  E: { name: "Enterprising", color: "#ef4444" },
  C: { name: "Conventional", color: "#6366f1" },
};
const ORDER = ["R", "I", "A", "S", "E", "C"];

/** Lightweight program suggestions by category (demo content) */
const PROGRAMS = {
  R: [
    { name: "Advanced Manufacturing", school: "Riverside HS CTE", type: "CTE Pathway" },
    { name: "Automotive Service", school: "Valley Charter", type: "CTE Pathway" },
  ],
  I: [
    { name: "Computer Science", school: "Metro North HS", type: "AP/IB + Clubs" },
    { name: "Bio & Lab Science", school: "Hillcrest Prep", type: "STEM Focus" },
  ],
  A: [
    { name: "Digital Media & Design", school: "Central Magnet", type: "Arts Academy" },
    { name: "UX / Product Design", school: "Metro Tech", type: "CTE + Portfolio" },
  ],
  S: [
    { name: "Health Science", school: "Riverside HS", type: "Health Academy" },
    { name: "Education & Leadership", school: "Ramona Academy", type: "Service Track" },
  ],
  E: [
    { name: "Entrepreneurship", school: "Canyon HS", type: "Incubator Program" },
    { name: "Marketing & DECA", school: "Valley Charter", type: "CTE + CTSO" },
  ],
  C: [
    { name: "Business Operations", school: "Riverside USD", type: "CTE Pathway" },
    { name: "Accounting / Finance", school: "Metro USD", type: "Dual-enroll" },
  ],
};

/** Demo degrees/certificates by category (expand/replace with real data later) */
const DEGREES_BY_CAT = {
  R: [
    { level: "Certificate", name: "Welding Technology" },
    { level: "Certificate", name: "HVAC/R Technician" },
    { level: "A.A.S.", name: "Industrial Maintenance" },
    { level: "A.A.S.", name: "Automotive Technology" },
    { level: "B.S.", name: "Construction Management" },
    { level: "B.S.", name: "Mechatronics" },
  ],
  I: [
    { level: "Certificate", name: "Cybersecurity" },
    { level: "Certificate", name: "Data Analytics" },
    { level: "A.S.", name: "Computer Science" },
    { level: "A.S.", name: "Biotechnology" },
    { level: "B.S.", name: "Software Engineering" },
    { level: "B.S.", name: "Mechanical Engineering" },
  ],
  A: [
    { level: "Certificate", name: "Digital Media" },
    { level: "Certificate", name: "UX/UI Foundations" },
    { level: "A.A.", name: "Graphic Design" },
    { level: "A.A.", name: "Film & Video" },
    { level: "B.A.", name: "Design (Product/Visual)" },
    { level: "B.F.A.", name: "Animation" },
  ],
  S: [
    { level: "Certificate", name: "Community Health Worker" },
    { level: "Certificate", name: "Paraeducator/Instructional Aide" },
    { level: "A.S.", name: "Nursing (Pre-RN)" },
    { level: "A.A.", name: "Early Childhood Education" },
    { level: "B.S.", name: "Nursing (BSN)" },
    { level: "B.A.", name: "Education" },
  ],
  E: [
    { level: "Certificate", name: "Entrepreneurship" },
    { level: "Certificate", name: "Sales Operations" },
    { level: "A.S.", name: "Business Administration" },
    { level: "A.S.", name: "Marketing" },
    { level: "B.S.", name: "Management" },
    { level: "B.S.", name: "Finance/Accounting" },
  ],
  C: [
    { level: "Certificate", name: "Bookkeeping" },
    { level: "Certificate", name: "Project Coordination" },
    { level: "A.S.", name: "Information Systems" },
    { level: "A.S.", name: "Paralegal Studies" },
    { level: "B.S.", name: "Operations/Logistics" },
    { level: "B.S.", name: "Accounting" },
  ],
};

function barPct(v, max) {
  if (!max) return 0;
  const pct = Math.round((v / max) * 100);
  return Math.max(0, Math.min(100, pct));
}

export default function AssessmentResults() {
  const { profile: ctxProfile } = useProfile(); // ⬅️ prefer context
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo identity (same as assessment uses)
  const demoEmail = (() => {
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  })();

  // 1) Use context if present; else 2) local cache; else 3) fetch from /user
  useEffect(() => {
    if (ctxProfile && (ctxProfile.hollandCode || ctxProfile.focusCareers || ctxProfile.tallies)) {
      setProfile(ctxProfile);
      setLoading(false);
      return;
    }

    let cached = null;
    try {
      const raw = localStorage.getItem("fp_user");
      cached = raw ? JSON.parse(raw) : null;
    } catch {}

    if (cached) {
      setProfile(cached);
      setLoading(false);
    } else {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/user?email=${encodeURIComponent(demoEmail)}`);
          const json = await res.json();
          if (json?.profile) {
            setProfile(json.profile);
            try {
              localStorage.setItem("fp_user", JSON.stringify(json.profile));
            } catch {}
          }
        } catch {
          // swallow in demo
        }
        setLoading(false);
      })();
    }
  }, [ctxProfile, demoEmail]);

  const tallies = useMemo(() => {
    // Expected shape from assessment: { R: n, I: n, ... }
    const t = profile?.tallies || {};
    const base = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const k of Object.keys(base)) base[k] = Number(t[k] || 0);
    return base;
  }, [profile]);

  const ranked = useMemo(() => {
    return [...ORDER].sort((a, b) => {
      if (tallies[b] !== tallies[a]) return tallies[b] - tallies[a];
      return a.localeCompare(b);
    });
  }, [tallies]);

  const hollandCode = profile?.hollandCode || ranked.join("");

  const bestFitCareers = Array.isArray(profile?.focusCareers) ? profile.focusCareers : [];

  const maxVal = Math.max(...ORDER.map((k) => tallies[k] || 0), 0);

  // Combine program suggestions from the top two categories
  const programRecs = useMemo(() => {
    const picks = ranked.slice(0, 2);
    const out = [];
    picks.forEach((c) => {
      (PROGRAMS[c] || []).forEach((p) => {
        if (!out.find((x) => x.name === p.name && x.school === p.school)) out.push(p);
      });
    });
    return out.slice(0, 6);
  }, [ranked]);

  // Degrees/certs from top two categories
  const degreeRecs = useMemo(() => {
    const picks = ranked.slice(0, 2);
    const out = [];
    picks.forEach((c) => {
      (DEGREES_BY_CAT[c] || []).forEach((d) => {
        if (!out.find((x) => x.level === d.level && x.name === d.name)) out.push(d);
      });
    });
    return out.slice(0, 8);
  }, [ranked]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your Results</h1>
          <div className="text-sm text-gray-600">
            {profile?.name ? `${profile.name} • ` : ""}
            {profile?.district ? `${profile.district} • ` : ""}
            {profile?.grade ? `Grade ${profile.grade}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/career" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Retake Assessment
          </Link>
          <Link to="/dashboard" className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white">
            Go to Dashboard
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border p-6 text-sm text-gray-600">Loading…</div>
      ) : !profile ? (
        <div className="rounded-2xl border p-6 text-sm text-red-700 bg-red-50">
          No results yet. Please complete the{" "}
          <Link to="/career" className="underline">
            Career Assessment
          </Link>
          .
        </div>
      ) : (
        <>
          {/* Summary card */}
          <section className="rounded-2xl border p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500">Holland Code</div>
                <div className="font-mono text-xl font-bold">{hollandCode}</div>
              </div>
              <div className="text-sm text-gray-600">
                Checked statements:{" "}
                <span className="font-semibold">
                  {Array.isArray(profile?.answers) ? profile.answers.length : "—"}
                </span>
              </div>
            </div>

            {/* Category bars */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ORDER.map((k) => {
                const v = tallies[k] || 0;
                const pct = barPct(v, maxVal);
                const label = CAT_INFO[k]?.name || k;
                const color = CAT_INFO[k]?.color || "#0ea5e9";
                return (
                  <div key={k} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">
                        {label} ({k})
                      </div>
                      <div className="font-mono">{v}</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded bg-gray-100">
                      <div
                        style={{ width: `${pct}%`, background: color }}
                        className="h-2 rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Best-fit careers */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Best-fit careers</h2>
              <Link to="/dashboard" className="text-sm text-blue-600 underline">
                Set Focus Career in Dashboard
              </Link>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              {bestFitCareers.length ? (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {bestFitCareers.map((c, i) => (
                    <li key={`${c}-${i}`} className="rounded-lg border px-3 py-2 text-sm">
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">
                  No career list saved yet — submit the assessment to generate matches.
                </div>
              )}
            </div>
          </section>

          {/* Suggested programs & schools */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Suggested programs & schools</h2>
              <Link to="/leaderboard/schools" className="text-sm text-blue-600 underline">
                View Schools Leaderboard
              </Link>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              {programRecs.length ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {programRecs.map((p, i) => (
                    <li key={`${p.name}-${p.school}-${i}`} className="rounded-xl border p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-600">{p.school}</div>
                      <div className="mt-1 text-xs text-gray-500">{p.type}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">No program suggestions available yet.</div>
              )}
            </div>
          </section>

          {/* Degrees & certificates */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Degrees & certificates</h2>
              <span className="text-xs text-gray-500">
                Based on your top categories ({ranked.slice(0, 2).join(", ")})
              </span>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              {degreeRecs.length ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {degreeRecs.map((d, i) => (
                    <li key={`${d.level}-${d.name}-${i}`} className="rounded-xl border p-3">
                      <div className="font-medium">{d.name}</div>
                      <div className="mt-1 text-xs text-gray-600">{d.level}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">No degree suggestions yet.</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}


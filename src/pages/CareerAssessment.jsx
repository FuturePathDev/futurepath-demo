// src/pages/CareerAssessment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";

/** RIASEC buckets */
const CATS = ["R", "I", "A", "S", "E", "C"];

/** Display info and header gradient for each category */
const CAT_INFO = {
  R: { name: "Realistic", tone: "from-emerald-500 to-teal-500" },
  I: { name: "Investigative", tone: "from-cyan-500 to-blue-500" },
  A: { name: "Artistic", tone: "from-fuchsia-500 to-rose-500" },
  S: { name: "Social", tone: "from-amber-500 to-orange-500" },
  E: { name: "Enterprising", tone: "from-pink-500 to-red-500" },
  C: { name: "Conventional", tone: "from-violet-500 to-indigo-500" },
};

/** 72 statements (12 per category). “Check all that describe you.” */
const STATEMENTS = [
  // ========================= Realistic (R) =========================
  { id: "R1", cat: "R", text: "I enjoy using tools, machines, or equipment." },
  { id: "R2", cat: "R", text: "I like building, fixing, or assembling things." },
  { id: "R3", cat: "R", text: "I prefer hands-on work over desk work." },
  { id: "R4", cat: "R", text: "I’m comfortable working outdoors and being physically active." },
  { id: "R5", cat: "R", text: "I can operate or learn to operate mechanical devices." },
  { id: "R6", cat: "R", text: "I’m practical and like seeing tangible results." },
  { id: "R7", cat: "R", text: "I like troubleshooting how things are put together." },
  { id: "R8", cat: "R", text: "I enjoy working with my hands (e.g., repairing, crafting)." },
  { id: "R9", cat: "R", text: "I’m patient when following steps to assemble or install." },
  { id: "R10", cat: "R", text: "I don’t mind getting a bit dirty to get the job done." },
  { id: "R11", cat: "R", text: "I’m interested in vehicles, construction, or electronics." },
  { id: "R12", cat: "R", text: "I like jobs with clear physical outcomes." },

  // ====================== Investigative (I) ========================
  { id: "I1", cat: "I", text: "I enjoy solving problems using facts and data." },
  { id: "I2", cat: "I", text: "I’m curious and like figuring out how things work." },
  { id: "I3", cat: "I", text: "I like science, research, or experiments." },
  { id: "I4", cat: "I", text: "I’m comfortable with abstract ideas and analysis." },
  { id: "I5", cat: "I", text: "I prefer tasks that require critical thinking." },
  { id: "I6", cat: "I", text: "I can work independently for long periods." },
  { id: "I7", cat: "I", text: "I enjoy using technology to solve problems." },
  { id: "I8", cat: "I", text: "I like learning new concepts deeply and systematically." },
  { id: "I9", cat: "I", text: "I’m drawn to data patterns and insights." },
  { id: "I10", cat: "I", text: "I prefer evidence over opinions when deciding." },
  { id: "I11", cat: "I", text: "I enjoy math, logic puzzles, or coding challenges." },
  { id: "I12", cat: "I", text: "I like testing ideas and iterating based on results." },

  // ======================== Artistic (A) ===========================
  { id: "A1", cat: "A", text: "I like expressing myself through writing, art, music, or design." },
  { id: "A2", cat: "A", text: "I prefer flexible tasks without strict rules." },
  { id: "A3", cat: "A", text: "I’m imaginative and enjoy brainstorming new ideas." },
  { id: "A4", cat: "A", text: "I like creating or designing visually appealing things." },
  { id: "A5", cat: "A", text: "I enjoy performing or presenting creative work." },
  { id: "A6", cat: "A", text: "I’m drawn to storytelling, visuals, or aesthetics." },
  { id: "A7", cat: "A", text: "I like to experiment and try new creative methods." },
  { id: "A8", cat: "A", text: "I enjoy music, theatre, film, or visual arts." },
  { id: "A9", cat: "A", text: "I like designing layouts, logos, or interfaces." },
  { id: "A10", cat: "A", text: "I value originality over convention." },
  { id: "A11", cat: "A", text: "I enjoy creative writing or content creation." },
  { id: "A12", cat: "A", text: "I notice color, style, and composition in everyday things." },

  // ========================= Social (S) ============================
  { id: "S1", cat: "S", text: "I like helping people learn or succeed." },
  { id: "S2", cat: "S", text: "I’m empathetic and good at understanding others." },
  { id: "S3", cat: "S", text: "I enjoy teamwork and group activities." },
  { id: "S4", cat: "S", text: "I’m comfortable communicating and listening." },
  { id: "S5", cat: "S", text: "I like roles that involve teaching, coaching, or mentoring." },
  { id: "S6", cat: "S", text: "I want my work to make a positive difference for people." },
  { id: "S7", cat: "S", text: "I’m patient and supportive when others need help." },
  { id: "S8", cat: "S", text: "I enjoy community service or volunteering." },
  { id: "S9", cat: "S", text: "I’m energized by working with people, not just tasks." },
  { id: "S10", cat: "S", text: "I’m comfortable leading group discussions." },
  { id: "S11", cat: "S", text: "I like resolving conflicts and finding common ground." },
  { id: "S12", cat: "S", text: "I enjoy organizing events for people." },

  // ====================== Enterprising (E) =========================
  { id: "E1", cat: "E", text: "I like to lead, persuade, or start new projects." },
  { id: "E2", cat: "E", text: "I’m comfortable taking initiative and making decisions." },
  { id: "E3", cat: "E", text: "I enjoy presenting ideas or convincing others." },
  { id: "E4", cat: "E", text: "I’m motivated by goals, results, or recognition." },
  { id: "E5", cat: "E", text: "I like organizing people and resources to get things done." },
  { id: "E6", cat: "E", text: "I’m energized by fast-paced or competitive environments." },
  { id: "E7", cat: "E", text: "I’m interested in business, entrepreneurship, or leadership." },
  { id: "E8", cat: "E", text: "I enjoy pitching ideas and building support." },
  { id: "E9", cat: "E", text: "I like planning strategy and setting direction." },
  { id: "E10", cat: "E", text: "I’m comfortable with calculated risks." },
  { id: "E11", cat: "E", text: "I like coordinating cross-functional teams." },
  { id: "E12", cat: "E", text: "I follow markets, trends, or business news." },

  // ===================== Conventional (C) ==========================
  { id: "C1", cat: "C", text: "I like well-defined tasks with clear instructions." },
  { id: "C2", cat: "C", text: "I’m organized and detail-oriented." },
  { id: "C3", cat: "C", text: "I’m good at following procedures and meeting deadlines." },
  { id: "C4", cat: "C", text: "I enjoy working with data, records, or spreadsheets." },
  { id: "C5", cat: "C", text: "I prefer stability and consistency at work." },
  { id: "C6", cat: "C", text: "I like planning, scheduling, and keeping things on track." },
  { id: "C7", cat: "C", text: "I value accuracy and reliability in my work." },
  { id: "C8", cat: "C", text: "I’m comfortable with documentation and compliance." },
  { id: "C9", cat: "C", text: "I like bookkeeping, record-keeping, or operations tasks." },
  { id: "C10", cat: "C", text: "I enjoy creating checklists and standard processes." },
  { id: "C11", cat: "C", text: "I’m good at quality control and error spotting." },
  { id: "C12", cat: "C", text: "I prefer roles with clear expectations and structure." },
];

/** Expanded example careers per category */
const CAREERS_BY_CAT = {
  R: [
    "Automotive Technician",
    "Electrician",
    "HVAC Technician",
    "Construction Manager",
    "Welder",
    "Carpenter",
    "Field Service Technician",
    "Robotics Technician",
    "Aviation Maintenance Tech",
    "Industrial Mechanic",
  ],
  I: [
    "Software Developer",
    "Data Analyst",
    "Data Scientist",
    "Lab Scientist",
    "Systems Engineer",
    "Cybersecurity Analyst",
    "Bioinformatics Specialist",
    "Mechanical Engineer",
    "Environmental Scientist",
    "Actuary",
  ],
  A: [
    "Graphic Designer",
    "Animator",
    "UX/UI Designer",
    "Product Designer",
    "Copywriter",
    "Art Director",
    "Videographer",
    "Game Designer",
    "Interior Designer",
    "Illustrator",
  ],
  S: [
    "Teacher",
    "School Counselor",
    "Registered Nurse",
    "Social Worker",
    "Community Coordinator",
    "HR Specialist",
    "Physical Therapist Assistant",
    "Speech-Language Pathology Assistant",
    "Trainer/Coach",
    "Nonprofit Program Lead",
  ],
  E: [
    "Marketing Manager",
    "Sales Lead",
    "Entrepreneur",
    "Product Manager",
    "Account Executive",
    "Management Consultant",
    "Real Estate Agent",
    "Business Development Rep",
    "Store/Operations Manager",
    "Event Producer",
  ],
  C: [
    "Accountant",
    "Payroll Specialist",
    "Operations Coordinator",
    "Paralegal",
    "Compliance Analyst",
    "Claims Adjuster",
    "Administrative Manager",
    "Procurement Specialist",
    "Logistics Coordinator",
    "Data Entry Specialist",
  ],
};

/** Blend careers from the top 2 categories to produce a diverse list */
function careersFromRanking(rankedCats, perCat = 5, maxTotal = 10) {
  const top2 = rankedCats.slice(0, 2);
  const pools = top2.map((c) => (CAREERS_BY_CAT[c] || []).slice(0, perCat));
  const out = [];
  let i = 0;
  while (out.length < maxTotal && (pools[0].length || pools[1].length)) {
    const pickIdx = i % pools.length;
    const pull = pools[pickIdx].shift();
    if (pull && !out.includes(pull)) out.push(pull);
    i++;
  }
  if (out.length < maxTotal) {
    for (const c of rankedCats.slice(2)) {
      for (const p of CAREERS_BY_CAT[c] || []) {
        if (!out.includes(p)) out.push(p);
        if (out.length >= maxTotal) break;
      }
      if (out.length >= maxTotal) break;
    }
  }
  return out.length ? out : ["Software Developer"];
}

/** Pretty label like “Realistic (R)” */
function labelFor(cat) {
  const info = CAT_INFO[cat];
  return info ? `${info.name} (${cat})` : cat;
}

export default function CareerAssessment() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  // Demo identity (pick up from stored profile or default email)
  const demoEmail = useMemo(() => {
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  }, []);

  const [profileHints, setProfileHints] = useState({ name: "", grade: "", district: "" });
  useEffect(() => {
    if (profile && (profile.name || profile.grade || profile.district)) {
      setProfileHints({
        name: profile.name || "",
        grade: profile.grade || "",
        district: profile.district || "",
      });
      return;
    }
    try {
      const raw = localStorage.getItem("fp_user");
      if (raw) {
        const p = JSON.parse(raw);
        setProfileHints({
          name: p?.name || "",
          grade: p?.grade || "",
          district: p?.district || "",
        });
      }
    } catch {}
  }, [profile]);

  // answers
  const [checked, setChecked] = useState(() => {
    const init = {};
    for (const s of STATEMENTS) init[s.id] = false;
    return init;
  });

  const totalChecked = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const tallies = useMemo(() => {
    const t = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const s of STATEMENTS) if (checked[s.id]) t[s.cat] += 1;
    return t;
  }, [checked]);

  const rankedCats = useMemo(() => {
    return [...CATS].sort((a, b) => {
      if (tallies[b] !== tallies[a]) return tallies[b] - tallies[a];
      return a.localeCompare(b);
    });
  }, [tallies]);

  const hollandCode = useMemo(() => rankedCats.join(""), [rankedCats]);

  const minRecommended = 30;

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setAllFor(cat, value) {
    const next = { ...checked };
    for (const s of STATEMENTS) if (s.cat === cat) next[s.id] = value;
    setChecked(next);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (totalChecked < minRecommended) return;

    const careers = careersFromRanking(rankedCats, 6, 12);
    const answers = STATEMENTS.filter((s) => checked[s.id]).map((s) => s.id);

    // Save via context → backend + local cache
    await saveProfile({
      hollandCode,
      focusCareers: careers,
      tallies,
      answers,
      name: profileHints.name || undefined,
      grade: profileHints.grade || undefined,
      district: profileHints.district || undefined,
      email: profile?.email || demoEmail, // harmless if backend ignores email
    });

    navigate("/career/results");
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Career Assessment</h1>
        </div>
        <Link
          to="/career/results"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          View Results
        </Link>
      </header>

      {/* Progress + preview */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            Selected: <span className="font-semibold">{totalChecked}</span> / {STATEMENTS.length}
          </div>
          <div className="text-sm text-gray-700">
            Current code:{" "}
            <span className="font-mono font-semibold">{hollandCode}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {CATS.map((c) => (
            <div key={c} className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-600">{labelFor(c)}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{tallies[c]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form grouped by category */}
      <form onSubmit={onSubmit} className="space-y-6">
        {CATS.map((c) => {
          const info = CAT_INFO[c];
          const group = STATEMENTS.filter((s) => s.cat === c);
          return (
            <fieldset key={c} className="rounded-2xl border shadow-sm">
              <div
                className={`flex items-center justify-between gap-3 rounded-t-2xl bg-gradient-to-r ${info.tone} px-4 py-3 text-white`}
              >
                <div className="text-lg font-semibold">{info.name} ({c})</div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAllFor(c, true)}
                    className="rounded bg-white/20 px-2 py-1 hover:bg-white/30"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllFor(c, false)}
                    className="rounded bg-white/20 px-2 py-1 hover:bg-white/30"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {group.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!!checked[s.id]}
                      onChange={() => toggle(s.id)}
                    />
                    <span className="text-sm">{s.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        {/* Submit */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Minimum recommended selections: <strong>{minRecommended}</strong>
          </div>
          <button
            type="submit"
            disabled={totalChecked < minRecommended}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Submit Assessment
          </button>
        </div>
      </form>
    </div>
  );
}

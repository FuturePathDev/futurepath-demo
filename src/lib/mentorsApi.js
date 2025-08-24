// src/lib/mentorsApi.js
// Thin wrapper over the mentors endpoints + a local demo mentor catalog.

import { API_BASE, apiPath } from "./apiBase";

/** ---------------------------
 *  Network helpers
 *  --------------------------*/
async function httpJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...opts,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // ignore parse errors for empty bodies
  }
  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json ?? {};
}

/** Create a mentor invite (student-initiated only). */
export async function createInvite({
  mentorId,
  mentorName,
  studentEmail,
  studentName,
  message = null,
}) {
  const body = {
    mentorId,
    mentorName,
    studentEmail,
    studentName,
    message: message || null,
  };
  const url = `${API_BASE}${apiPath("/mentors/invite")}`;
  const json = await httpJSON(url, { method: "POST", body: JSON.stringify(body) });
  return { invite: json?.invite || null };
}

/** List invites for a student. */
export async function listInvitesByStudent(studentEmail, { limit = 10 } = {}) {
  const qs = new URLSearchParams();
  if (studentEmail) qs.set("studentEmail", studentEmail);
  if (limit) qs.set("limit", String(limit));
  const url = `${API_BASE}${apiPath("/mentors/invite")}${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  const json = await httpJSON(url);
  return {
    invites: Array.isArray(json?.invites) ? json.invites : [],
    total: Number(json?.total || 0),
  };
}

/** ---------------------------
 *  Local mentor catalog (demo)
 *  --------------------------*/
const MENTOR_CATALOG = [
  {
    id: "m-101",
    name: "Dr. Priya Shah",
    title: "Data Scientist @ HealthTech",
    riasec: "I R",
    focus: "IR",
    tags: ["Python", "ML", "Healthcare"],
    bio: "Applied ML in hospital analytics; mentors students on data careers.",
  },
  {
    id: "m-102",
    name: "Jose Alvarez",
    title: "Product Designer @ MobileCo",
    riasec: "A E",
    focus: "AE",
    tags: ["Figma", "UX", "Prototyping"],
    bio: "Design systems, prototyping, and storytelling for mobile products.",
  },
  {
    id: "m-103",
    name: "Kelly Nguyen",
    title: "Field Engineer @ Renewables Inc.",
    riasec: "R I",
    focus: "RI",
    tags: ["Solar", "Electrical", "Field Ops"],
    bio: "Hands-on renewable projects and career advice for field tech roles.",
  },
  {
    id: "m-104",
    name: "Marcus Lee",
    title: "Nurse Educator @ City Hospital",
    riasec: "S C",
    focus: "SC",
    tags: ["Clinical", "Education", "Healthcare"],
    bio: "Clinical practice + teaching; passionate about community health.",
  },
  {
    id: "m-105",
    name: "Ariella Cohen",
    title: "Marketing Manager @ Startup",
    riasec: "E S",
    focus: "ES",
    tags: ["Brand", "Go-To-Market", "DECA"],
    bio: "Leads campaigns and mentors students interested in entrepreneurship.",
  },
  {
    id: "m-106",
    name: "Ben Carter",
    title: "Operations Analyst @ Logistics",
    riasec: "C I",
    focus: "CI",
    tags: ["Ops", "SQL", "Process"],
    bio: "Process optimization; helps students learn structured problem-solving.",
  },
];

/** Normalize a Holland string like "RIASEC" -> compact "RI", "AE", etc. */
function parseFocus(str) {
  const s = String(str || "")
    .toUpperCase()
    .replace(/[^RIASEC]/g, "");
  // keep top 2 letters if available
  return s.slice(0, 2);
}

/** Get mentors filtered by focus (top-2) and/or text query. */
export function getMentors({ focus, q } = {}) {
  const f = parseFocus(focus);
  const query = String(q || "").toLowerCase().trim();

  return MENTOR_CATALOG.filter((m) => {
    let ok = true;

    if (f) {
      // match if mentor focus shares at least one letter with student's top-2
      ok = [...f].some((ch) => m.focus.includes(ch));
    }

    if (ok && query) {
      const hay =
        `${m.name} ${m.title} ${m.riasec} ${m.bio} ${m.tags.join(" ")}`.toLowerCase();
      ok = hay.includes(query);
    }
    return ok;
  });
}

/** Expose catalog for UIs that want all entries. */
export function getAllMentors() {
  return [...MENTOR_CATALOG];
}

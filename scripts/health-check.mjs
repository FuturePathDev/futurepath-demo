// scripts/health-check.mjs
// Usage:
//   API_BASE="https://<api>.execute-api.<region>.amazonaws.com/demo" \
//   ID_TOKEN="<optional id token>" \
//   TUTOR_ID="t-101" STUDENT_ID="s-demo-1" \
//   node scripts/health-check.mjs

const API_BASE   = process.env.API_BASE;
const ID_TOKEN   = process.env.ID_TOKEN || "";
const TUTOR_ID   = process.env.TUTOR_ID || "t-101";
const STUDENT_ID = process.env.STUDENT_ID || "s-demo-1";
const ORIGIN     = process.env.ORIGIN || "https://app.example.com";

if (!API_BASE) {
  console.error("❌ Set API_BASE env (e.g. https://xxx.execute-api.us-east-1.amazonaws.com/demo)");
  process.exit(1);
}

function print(title, result) {
  const ok = result.ok ? "✅" : "❌";
  console.log(`${ok} ${title} → ${result.status}${result.note ? " ("+result.note+")":""}`);
}

async function preflight(path, method="POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "OPTIONS",
    headers: {
      Origin: ORIGIN,
      "Access-Control-Request-Method": method,
      "Access-Control-Request-Headers": "Authorization, Content-Type",
    },
  });
  const alo = res.headers.get("access-control-allow-origin");
  const alm = res.headers.get("access-control-allow-methods") || "";
  const alh = res.headers.get("access-control-allow-headers") || "";
  const ok = res.status === 200 && alo && alm.includes(method) && /Authorization/i.test(alh);
  return { ok, status: res.status, note: `ACAO=${alo} ALM=${alm} ALH=${alh}` };
}

async function call(method, path, withToken=false, body) {
  const headers = { "Content-Type": "application/json" };
  if (withToken && ID_TOKEN) headers.Authorization = `Bearer ${ID_TOKEN}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  let note = "";
  try {
    const j = await res.json();
    note = `keys=${Object.keys(j).join(",")}`;
  } catch {
    note = "non-JSON";
  }
  return { ok: res.ok, status: res.status, note };
}

(async () => {
  console.log(`\n=== Health Check @ ${API_BASE} (origin: ${ORIGIN}) ===\n`);

  print("OPTIONS /tutors (preflight GET)", await preflight("/tutors", "GET"));
  print("OPTIONS /students/me/tutors (preflight GET)", await preflight("/students/me/tutors", "GET"));
  print("OPTIONS /tutors/my-students (preflight GET)", await preflight("/tutors/my-students", "GET"));
  print("OPTIONS /tutors/sessions (preflight POST)", await preflight("/tutors/sessions", "POST"));
  print("OPTIONS /tutors/select (preflight POST)", await preflight("/tutors/select", "POST"));

  print("GET /tutors (no token)", await call("GET", "/tutors", false));
  print("GET /students/me/tutors?studentId=… (no token)", await call("GET", `/students/me/tutors?studentId=${STUDENT_ID}`, false));
  print("GET /tutors/my-students?tutorId=… (no token)", await call("GET", `/tutors/my-students?tutorId=${TUTOR_ID}`, false));
  print("GET /tutors/sessions?tutorId=… (no token)", await call("GET", `/tutors/sessions?tutorId=${TUTOR_ID}`, false));

  if (ID_TOKEN) {
    print("GET /tutors (with token)", await call("GET", "/tutors", true));
    print("GET /students/me/tutors (with token)", await call("GET", "/students/me/tutors", true));
    print("GET /tutors/my-students (with token)", await call("GET", "/tutors/my-students", true));
    print("GET /tutors/sessions?mine=1 (with token)", await call("GET", "/tutors/sessions?mine=1", true));
  } else {
    console.log("\nℹ️  ID_TOKEN not set — skipping authenticated checks.\n");
  }

  console.log("\nDone.\n");
})().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});

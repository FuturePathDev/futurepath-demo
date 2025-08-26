// src/pages/AvatarBuilder.jsx
import React, { useMemo, useRef, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";
import { saveProfile, mergeLocalProfile } from "../lib/userApi";

/** ---------- Config options ---------- */
const SKIN = [
  { key: "s1", hex: "#F9D6B3" },
  { key: "s2", hex: "#F0C29C" },
  { key: "s3", hex: "#D9A072" },
  { key: "s4", hex: "#B97D56" },
  { key: "s5", hex: "#8E5A3A" },
  { key: "s6", hex: "#6A412A" },
];

const HAIR = ["none", "short", "curly", "long", "bun"];
const HAIR_COLORS = ["#2E2E2E", "#5C3B1E", "#8B5E34", "#C17F59", "#D9B48F", "#222222"];

const EYES = ["normal", "happy", "wink"];
const MOUTH = ["smile", "open", "serious"];

const ACCESS = ["none", "glasses", "hat"]; // legacy accessories
const HEADPHONES = ["off", "on"]; // new, separate so it can co-exist with glasses/hat

const BEARDS = ["none", "stubble", "goatee", "full"];
const HIJAB = ["none", "hijab"];
const HIJAB_COLORS = ["#1F2937", "#0EA5E9", "#10B981", "#F97316", "#A855F7", "#DC2626"];

const SHIRTS = ["tee", "hoodie", "collared"];
const SHIRT_COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#6366F1", "#EF4444", "#111827"];

/** Backgrounds: solid or classroom scenes */
const BG_SOLIDS = ["#E5F3FF", "#EAF7F5", "#FDF2F2", "#F6F5FF", "#FFF7ED", "#F1F5F9"];
const BG_SCENES = ["classroom-a", "classroom-b", "classroom-c", "classroom-lab"];
const BG_MODES = ["solid", "classroom"];

const DEFAULT = {
  skin: "s3",
  hair: "short",
  hairColor: "#2E2E2E",
  eyes: "normal",
  mouth: "smile",
  accessory: "none",
  headphones: "off",
  beard: "none",
  hijab: "none",
  hijabColor: "#1F2937",
  shirt: "tee",
  shirtColor: "#0EA5E9",
  bgMode: "solid",
  bgSolid: "#EAF7F5",
  bgScene: "classroom-a", // ignored when bgMode=solid
};

/** Utils */
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** ---------- SVG scene backgrounds ---------- */
function SceneClassroom({ variant }) {
  // simple shapes for a classroom vibe
  return (
    <g>
      {/* wall */}
      <rect x="0" y="0" width="200" height="140" fill="#F8FAFC" />
      {/* floor */}
      <rect x="0" y="140" width="200" height="60" fill="#E5E7EB" />
      {/* chalkboard / whiteboard / lab bench variations */}
      {variant === "classroom-a" && (
        <>
          <rect x="24" y="24" width="152" height="46" rx="4" fill="#1F2937" />
          <rect x="28" y="28" width="144" height="38" fill="#111827" />
          <rect x="24" y="72" width="152" height="6" fill="#9CA3AF" />
          <rect x="30" y="80" width="40" height="30" fill="#E5E7EB" />
          <rect x="130" y="80" width="40" height="30" fill="#E5E7EB" />
        </>
      )}
      {variant === "classroom-b" && (
        <>
          <rect x="22" y="26" width="156" height="44" rx="4" fill="#F1F5F9" stroke="#94A3B8" />
          <line x1="30" y1="40" x2="170" y2="40" stroke="#94A3B8" />
          <line x1="30" y1="54" x2="170" y2="54" stroke="#94A3B8" />
          <rect x="22" y="74" width="156" height="6" fill="#CBD5E1" />
          <rect x="30" y="84" width="30" height="28" fill="#E2E8F0" />
          <rect x="60" y="84" width="30" height="28" fill="#E2E8F0" />
          <rect x="90" y="84" width="30" height="28" fill="#E2E8F0" />
        </>
      )}
      {variant === "classroom-c" && (
        <>
          <rect x="18" y="22" width="164" height="52" rx="4" fill="#0EA5E9" opacity="0.15" />
          <rect x="26" y="30" width="60" height="36" fill="#93C5FD" />
          <rect x="114" y="30" width="60" height="36" fill="#93C5FD" />
          <rect x="18" y="76" width="164" height="6" fill="#CBD5E1" />
          <rect x="30" y="86" width="60" height="24" fill="#F1F5F9" stroke="#CBD5E1" />
          <rect x="110" y="86" width="60" height="24" fill="#F1F5F9" stroke="#CBD5E1" />
        </>
      )}
      {variant === "classroom-lab" && (
        <>
          {/* lab bench */}
          <rect x="14" y="84" width="172" height="12" fill="#9CA3AF" />
          <rect x="14" y="96" width="172" height="22" fill="#6B7280" />
          {/* flasks */}
          <path d="M40 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#60A5FA" opacity="0.8" />
          <path d="M72 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#F59E0B" opacity="0.8" />
          <path d="M104 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#34D399" opacity="0.8" />
        </>
      )}
    </g>
  );
}

/** ---------- Avatar parts ---------- */
function Hair({ type, color }) {
  switch (type) {
    case "short":
      return <path d="M60 58 q40 -26 80 0 v14 H60z" fill={color} />;
    case "curly":
      return (
        <g fill={color}>
          <circle cx="72" cy="66" r="12" />
          <circle cx="92" cy="58" r="14" />
          <circle cx="112" cy="56" r="14" />
          <circle cx="132" cy="60" r="13" />
          <rect x="60" y="66" width="80" height="10" />
        </g>
      );
    case "long":
      return (
        <g fill={color}>
          <path d="M58 64 q42 -28 84 0 v70 q-10 8 -22 0 v-50 H80 v50 q-12 10 -22 0z" />
        </g>
      );
    case "bun":
      return (
        <g fill={color}>
          <path d="M60 60 q40 -24 80 0 v10 H60z" />
          <circle cx="100" cy="46" r="10" />
        </g>
      );
    default:
      return null;
  }
}

function Eyes({ type }) {
  if (type === "happy") {
    return (
      <g stroke="#111" strokeWidth="3" fill="none">
        <path d="M78 96 q6 6 12 0" />
        <path d="M110 96 q6 6 12 0" />
      </g>
    );
  }
  if (type === "wink") {
    return (
      <g stroke="#111" strokeWidth="3" fill="none">
        <path d="M78 94 q6 6 12 0" />
        <line x1="110" y1="95" x2="122" y2="95" />
      </g>
    );
  }
  return (
    <g fill="#111">
      <circle cx="84" cy="96" r="3.8" />
      <circle cx="116" cy="96" r="3.8" />
    </g>
  );
}

function Mouth({ type }) {
  if (type === "open") {
    return <path d="M88 118 q12 10 24 0 v8 q-12 8 -24 0z" fill="#E64" />;
  }
  if (type === "serious") {
    return <rect x="90" y="122" width="24" height="3" rx="2" fill="#222" />;
  }
  return <path d="M88 118 q12 12 24 0" stroke="#222" strokeWidth="3" fill="none" />;
}

function Accessory({ type }) {
  if (type === "glasses") {
    return (
      <g stroke="#222" strokeWidth="2.5" fill="none">
        <rect x="70" y="88" width="26" height="18" rx="4" />
        <rect x="104" y="88" width="26" height="18" rx="4" />
        <line x1="96" y1="96" x2="104" y2="96" />
      </g>
    );
  }
  if (type === "hat") {
    return (
      <g>
        <path d="M60 64 h80 v14 H60z" fill="#1f2937" />
        <rect x="78" y="48" width="44" height="18" rx="4" fill="#111827" />
      </g>
    );
  }
  return null;
}

function Headphones({ on }) {
  if (on !== "on") return null;
  return (
    <g fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="round">
      <path d="M72 72 q28 -36 56 0" /> {/* headband */}
      <rect x="64" y="84" width="12" height="24" rx="4" fill="#1F2937" stroke="none" />
      <rect x="124" y="84" width="12" height="24" rx="4" fill="#1F2937" stroke="none" />
    </g>
  );
}

function Beard({ type }) {
  if (type === "stubble") {
    return (
      <path
        d="M74 112 q26 20 52 0 q-2 12 -26 20 q-24 -8 -26 -20z"
        fill="#111827"
        opacity="0.18"
      />
    );
  }
  if (type === "goatee") {
    return <path d="M96 126 q4 8 8 0 v6 q-4 4 -8 0z" fill="#111827" />;
  }
  if (type === "full") {
    return (
      <path
        d="M72 110 q28 26 56 0 v8 q0 18 -28 26 q-28 -8 -28 -26z"
        fill="#111827"
        opacity="0.9"
      />
    );
  }
  return null;
}

function Hijab({ type, color }) {
  if (type !== "hijab") return null;
  return (
    <g fill={color}>
      {/* outer wrap */}
      <path d="M62 74 q38 -28 76 0 q10 8 10 18 v44 q-8 20 -24 22 q-12 -22 -24 -22 q-12 0 -24 22 q-16 -2 -24 -22 V92 q0 -10 10 -18z" />
      {/* forehead band */}
      <path d="M64 76 q36 -22 72 0 v8 H64z" opacity="0.9" />
    </g>
  );
}

function Shirt({ type, color }) {
  if (type === "hoodie") {
    return (
      <g>
        {/* body */}
        <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />
        {/* hood opening */}
        <path d="M84 152 q16 10 32 0" fill="none" stroke="#0b0b0b22" strokeWidth="4" />
        {/* strings */}
        <line x1="96" y1="158" x2="96" y2="170" stroke="#0b0b0b55" strokeWidth="2" />
        <line x1="108" y1="158" x2="108" y2="170" stroke="#0b0b0b55" strokeWidth="2" />
      </g>
    );
  }
  if (type === "collared") {
    return (
      <g>
        <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />
        {/* collar */}
        <path d="M84 156 l16 10 l16 -10 l-6 -6 l-10 6 l-10 -6z" fill="#e5e7eb" />
      </g>
    );
  }
  // tee
  return <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />;
}

/** ---------- Avatar SVG (exportable) ---------- */
function AvatarSVG({ config, size = 240, svgRef }) {
  const skinHex = SKIN.find((s) => s.key === config.skin)?.hex || SKIN[2].hex;
  const view = 200;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${view} ${view}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 24, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
    >
      {/* Background */}
      {config.bgMode === "classroom" ? (
        <>
          <rect width={view} height={view} fill="#FFFFFF" />
          <SceneClassroom variant={config.bgScene || "classroom-a"} />
        </>
      ) : (
        <rect width={view} height={view} fill={config.bgSolid || BG_SOLIDS[0]} />
      )}

      {/* Neck */}
      <rect x="92" y="124" width="16" height="18" rx="6" fill={skinHex} />

      {/* Shirt */}
      <Shirt type={config.shirt} color={config.shirtColor} />

      {/* Face */}
      <circle cx="100" cy="100" r="36" fill={skinHex} />

      {/* Hair (hidden by hijab) */}
      {config.hijab !== "hijab" && <Hair type={config.hair} color={config.hairColor} />}

      {/* Hijab (over hair) */}
      <Hijab type={config.hijab} color={config.hijabColor} />

      {/* Face details */}
      <Eyes type={config.eyes} />
      <Mouth type={config.mouth} />

      {/* Beard overlays chin */}
      <Beard type={config.beard} />

      {/* Accessories */}
      <Accessory type={config.accessory} />
      <Headphones on={config.headphones} />
    </svg>
  );
}

/** ---------- Small UI bits ---------- */
function Swatch({ value, selected, onClick, title }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      title={title || value}
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        border: selected ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
        background: value,
      }}
      aria-pressed={selected}
    />
  );
}

function Select({ label, value, onChange, options, labels }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          fontSize: 14,
          background: "white",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels?.[opt] ?? opt[0].toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** ---------- Page ---------- */
export default function AvatarBuilder() {
  const { profile, setProfile } = useProfile();
  const svgRef = useRef(null);

  // Backward-compatible initial load
  const initial = useMemo(() => {
    try {
      let cfg =
        profile?.avatarConfig ??
        JSON.parse(localStorage.getItem("fp_avatar_cfg") || "null") ??
        {};

      // Migrate old fields
      if (!cfg.bgMode) {
        cfg.bgMode = "solid";
        cfg.bgSolid = cfg.bg || DEFAULT.bgSolid;
      }

      return { ...DEFAULT, ...cfg };
    } catch {
      return DEFAULT;
    }
  }, [profile?.avatarConfig]);

  const [cfg, setCfg] = useState(initial);

  const setField = (key, val) => setCfg((c) => ({ ...c, [key]: val }));

  function randomize() {
    // 50/50 solid vs classroom
    const isClassroom = Math.random() < 0.5;
    const next = {
      skin: choice(SKIN).key,
      hair: choice(HAIR),
      hairColor: choice(HAIR_COLORS),
      eyes: choice(EYES),
      mouth: choice(MOUTH),
      accessory: choice(ACCESS),
      headphones: choice(HEADPHONES),
      beard: choice(BEARDS),
      hijab: choice(HIJAB),
      hijabColor: choice(HIJAB_COLORS),
      shirt: choice(SHIRTS),
      shirtColor: choice(SHIRT_COLORS),
      bgMode: isClassroom ? "classroom" : "solid",
      bgSolid: choice(BG_SOLIDS),
      bgScene: choice(BG_SCENES),
    };

    // If hijab, hide hair for a clean look
    if (next.hijab === "hijab") next.hair = "none";

    setCfg(next);
  }

  function resetAll() {
    setCfg(DEFAULT);
  }

  async function saveAll() {
    try {
      localStorage.setItem("fp_avatar_cfg", JSON.stringify(cfg));
      const next = mergeLocalProfile(profile, { avatarConfig: cfg });
      setProfile(next);
      if (next?.email) {
        await saveProfile({ email: next.email, avatarConfig: cfg });
      }
    } catch {
      // demo: ignore
    }
  }

  async function downloadPng() {
    try {
      const svgNode = svgRef.current;
      if (!svgNode) return;
      const svgText = new XMLSerializer().serializeToString(svgNode);
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        const png = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = png;
        a.download = "futurepath-avatar.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
      img.src = url;
    } catch {
      // ignore
    }
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Avatar Builder</h1>
        <p style={styles.sub}>Create your avatar. New: beards, hijab, headphones, shirts, classroom scenes.</p>
      </header>

      <section style={styles.grid}>
        {/* Controls */}
        <div style={styles.panel}>
          {/* Hair + color (disabled when hijab on) */}
          <div style={styles.group}>
            <Select
              label={`Hair${cfg.hijab === "hijab" ? " (hidden by hijab)" : ""}`}
              value={cfg.hair}
              onChange={(v) => setField("hair", v)}
              options={HAIR}
            />
            <div style={{ display: "grid", gap: 6 }}>
              <span style={styles.label}>Hair Color</span>
              <div style={styles.swatches} aria-label="Hair colors">
                {HAIR_COLORS.map((c) => (
                  <Swatch
                    key={c}
                    value={c}
                    title={c}
                    selected={cfg.hairColor === c}
                    onClick={(v) => setField("hairColor", v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Eyes/Mouth */}
          <div style={styles.group}>
            <Select label="Eyes" value={cfg.eyes} onChange={(v) => setField("eyes", v)} options={EYES} />
            <Select label="Mouth" value={cfg.mouth} onChange={(v) => setField("mouth", v)} options={MOUTH} />
          </div>

          {/* Hijab + color */}
          <div style={styles.group}>
            <Select label="Hijab" value={cfg.hijab} onChange={(v) => {
              // If turning on hijab, hide hair automatically
              const next = { ...cfg, hijab: v };
              if (v === "hijab" && cfg.hair !== "none") next.hair = "none";
              setCfg(next);
            }} options={HIJAB} />
            {cfg.hijab === "hijab" && (
              <div style={{ display: "grid", gap: 6 }}>
                <span style={styles.label}>Hijab Color</span>
                <div style={styles.swatches} aria-label="Hijab colors">
                  {HIJAB_COLORS.map((c) => (
                    <Swatch
                      key={c}
                      value={c}
                      selected={cfg.hijabColor === c}
                      onClick={(v) => setField("hijabColor", v)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Beard + accessories */}
          <div style={styles.group}>
            <Select label="Beard" value={cfg.beard} onChange={(v) => setField("beard", v)} options={BEARDS} />
            <Select
              label="Accessory"
              value={cfg.accessory}
              onChange={(v) => setField("accessory", v)}
              options={ACCESS}
            />
            <Select
              label="Headphones"
              value={cfg.headphones}
              onChange={(v) => setField("headphones", v)}
              options={HEADPHONES}
              labels={{ off: "Off", on: "On" }}
            />
          </div>

          {/* Shirt + color */}
          <div style={styles.group}>
            <Select label="Shirt" value={cfg.shirt} onChange={(v) => setField("shirt", v)} options={SHIRTS} />
            <div style={{ display: "grid", gap: 6 }}>
              <span style={styles.label}>Shirt Color</span>
              <div style={styles.swatches} aria-label="Shirt colors">
                {SHIRT_COLORS.map((c) => (
                  <Swatch
                    key={c}
                    value={c}
                    selected={cfg.shirtColor === c}
                    onClick={(v) => setField("shirtColor", v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Backgrounds */}
          <div style={styles.group}>
            <Select
              label="Background Type"
              value={cfg.bgMode}
              onChange={(v) => setField("bgMode", v)}
              options={BG_MODES}
            />
            {cfg.bgMode === "solid" ? (
              <div style={{ display: "grid", gap: 6 }}>
                <span style={styles.label}>Solid Background</span>
                <div style={styles.swatches} aria-label="Background colors">
                  {BG_SOLIDS.map((b) => (
                    <Swatch
                      key={b}
                      value={b}
                      selected={cfg.bgSolid === b}
                      onClick={(v) => setField("bgSolid", v)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Select
                label="Classroom Scene"
                value={cfg.bgScene}
                onChange={(v) => setField("bgScene", v)}
                options={BG_SCENES}
                labels={{
                  "classroom-a": "Chalkboard",
                  "classroom-b": "Whiteboard",
                  "classroom-c": "Windows",
                  "classroom-lab": "Lab Bench",
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={randomize} style={styles.btn}>🎲 Randomize</button>
            <button type="button" onClick={resetAll} style={styles.btnGhost}>Reset</button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={downloadPng} style={styles.btnGhost}>Download PNG</button>
            <button type="button" onClick={saveAll} style={styles.btnPrimary}>Save Avatar</button>
          </div>
        </div>

        {/* Preview */}
        <div style={styles.preview}>
          <AvatarSVG config={cfg} size={280} svgRef={svgRef} />
        </div>
      </section>
    </div>
  );
}

/** ---------- styles ---------- */
const styles = {
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 16px 40px",
    display: "grid",
    gap: 14,
  },
  header: { display: "grid", gap: 4 },
  h1: { margin: 0, fontSize: 24, color: "#0f172a" },
  sub: { margin: 0, fontSize: 14, color: "#475569" },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: 14,
  },
  panel: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 12,
  },
  preview: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    placeItems: "center",
    minHeight: 360,
  },
  group: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    alignItems: "start",
  },
  label: { fontSize: 12, color: "#64748b" },
  swatches: { display: "flex", flexWrap: "wrap", gap: 8 },
  actions: { display: "flex", gap: 8, alignItems: "center" },
  btn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  btnGhost: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: 14,
  },
  btnPrimary: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
};


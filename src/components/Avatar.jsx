// src/components/Avatar.jsx
import React, { useMemo, useRef } from "react";
import { useProfile } from "../context/ProfileContext.jsx";

/** Keep these in sync with AvatarBuilder */
const SKIN = [
  { key: "s1", hex: "#F9D6B3" },
  { key: "s2", hex: "#F0C29C" },
  { key: "s3", hex: "#D9A072" },
  { key: "s4", hex: "#B97D56" },
  { key: "s5", hex: "#8E5A3A" },
  { key: "s6", hex: "#6A412A" },
];

const DEFAULT = {
  skin: "s3",
  hair: "short",
  hairColor: "#2E2E2E",
  eyes: "normal",
  mouth: "smile",
  accessory: "none",     // glasses | hat | none
  headphones: "off",     // on | off
  beard: "none",         // stubble | goatee | full | none
  hijab: "none",         // hijab | none
  hijabColor: "#1F2937",
  shirt: "tee",          // tee | hoodie | collared
  shirtColor: "#0EA5E9",
  bgMode: "solid",       // solid | classroom
  bgSolid: "#EAF7F5",
  bgScene: "classroom-a" // chalkboard default if bgMode=classroom
};

/** ---------- Background classroom scenes (compact) ---------- */
function SceneClassroom({ variant }) {
  return (
    <g>
      <rect x="0" y="0" width="200" height="140" fill="#F8FAFC" />
      <rect x="0" y="140" width="200" height="60" fill="#E5E7EB" />
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
          <rect x="14" y="84" width="172" height="12" fill="#9CA3AF" />
          <rect x="14" y="96" width="172" height="22" fill="#6B7280" />
          <path d="M40 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#60A5FA" opacity="0.8" />
          <path d="M72 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#F59E0B" opacity="0.8" />
          <path d="M104 96 v12 q0 6 8 6 h8 q8 0 8-6 V96 h-24z" fill="#34D399" opacity="0.8" />
        </>
      )}
    </g>
  );
}

/** ---------- Parts ---------- */
function Hair({ type, color, hidden }) {
  if (hidden) return null;
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
  if (type === "open") return <path d="M88 118 q12 10 24 0 v8 q-12 8 -24 0z" fill="#E64" />;
  if (type === "serious") return <rect x="90" y="122" width="24" height="3" rx="2" fill="#222" />;
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
      <path d="M72 72 q28 -36 56 0" />
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
  if (type === "goatee") return <path d="M96 126 q4 8 8 0 v6 q-4 4 -8 0z" fill="#111827" />;
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
      <path d="M62 74 q38 -28 76 0 q10 8 10 18 v44 q-8 20 -24 22 q-12 -22 -24 -22 q-12 0 -24 22 q-16 -2 -24 -22 V92 q0 -10 10 -18z" />
      <path d="M64 76 q36 -22 72 0 v8 H64z" opacity="0.9" />
    </g>
  );
}
function Shirt({ type, color }) {
  if (type === "hoodie") {
    return (
      <g>
        <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />
        <path d="M84 152 q16 10 32 0" fill="none" stroke="#0b0b0b22" strokeWidth="4" />
        <line x1="96" y1="158" x2="96" y2="170" stroke="#0b0b0b55" strokeWidth="2" />
        <line x1="108" y1="158" x2="108" y2="170" stroke="#0b0b0b55" strokeWidth="2" />
      </g>
    );
  }
  if (type === "collared") {
    return (
      <g>
        <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />
        <path d="M84 156 l16 10 l16 -10 l-6 -6 l-10 6 l-10 -6z" fill="#e5e7eb" />
      </g>
    );
  }
  return <path d="M64 164 q36 -18 72 0 v36 H64z" fill={color} />;
}

/** ---------- Low-level exportable SVG ---------- */
export function AvatarSVG({ config, size = 40, svgRef, title }) {
  const view = 200;
  const skinHex = SKIN.find((s) => s.key === config.skin)?.hex || SKIN[2].hex;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${view} ${view}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Avatar"}
      style={{ display: "block", borderRadius: 999 }}
    >
      {config.bgMode === "classroom" ? (
        <>
          <rect width={view} height={view} fill="#FFFFFF" />
          <SceneClassroom variant={config.bgScene || "classroom-a"} />
        </>
      ) : (
        <rect width={view} height={view} fill={config.bgSolid || DEFAULT.bgSolid} />
      )}

      {/* Neck / shirt / head */}
      <rect x="92" y="124" width="16" height="18" rx="6" fill={skinHex} />
      <Shirt type={config.shirt || DEFAULT.shirt} color={config.shirtColor || DEFAULT.shirtColor} />
      <circle cx="100" cy="100" r="36" fill={skinHex} />

      {/* Hair (hidden by hijab) */}
      <Hair
        type={config.hair || DEFAULT.hair}
        color={config.hairColor || DEFAULT.hairColor}
        hidden={config.hijab === "hijab"}
      />

      {/* Hijab */}
      <Hijab type={config.hijab || "none"} color={config.hijabColor || DEFAULT.hijabColor} />

      {/* Face */}
      <Eyes type={config.eyes || DEFAULT.eyes} />
      <Mouth type={config.mouth || DEFAULT.mouth} />

      {/* Beard / accessories */}
      <Beard type={config.beard || "none"} />
      <Accessory type={config.accessory || "none"} />
      <Headphones on={config.headphones || "off"} />
    </svg>
  );
}

/** ---------- Simple high-level Avatar component ---------- */
export function Avatar({
  size = 40,
  config: overrideConfig,
  className,
  style,
  title,
}) {
  const { profile } = useProfile();

  const cfg = useMemo(() => {
    // precedence: prop -> profile.avatarConfig -> localStorage -> default
    try {
      const fromProfile = profile?.avatarConfig || null;
      const fromLocal =
        JSON.parse(localStorage.getItem("fp_avatar_cfg") || "null") || null;
      const base = overrideConfig || fromProfile || fromLocal || {};
      // migrate older bg fields if present
      const merged = { ...DEFAULT, ...base };
      if (!merged.bgMode) {
        merged.bgMode = "solid";
        merged.bgSolid = base.bg || DEFAULT.bgSolid;
      }
      return merged;
    } catch {
      return DEFAULT;
    }
  }, [overrideConfig, profile?.avatarConfig]);

  const svgRef = useRef(null);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        overflow: "hidden",
        ...style,
      }}
    >
      <AvatarSVG config={cfg} size={size} svgRef={svgRef} title={title} />
    </div>
  );
}

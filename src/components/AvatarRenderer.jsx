// src/components/AvatarRenderer.jsx
import React from "react";

/**
 * Lightweight SVG avatar renderer.
 * Renders from a config object:
 * {
 *   bg, skin, hairStyle, hairColor,
 *   eyes, mouth, accessory
 * }
 */

export const SKIN_TONES = [
  "#FAD7C8", // light peach
  "#F2C1A0",
  "#D9A57E",
  "#B5815A",
  "#8C5A3C",
  "#6B442B", // deep
];

export const HAIR_COLORS = [
  "#111827", // near-black
  "#3F3F46", // dark gray
  "#8B5E3C", // brown
  "#C17F59", // light brown
  "#D1A054", // dark blond
  "#EEC170", // blond
  "#6D28D9", // fun purple
  "#0EA5E9", // fun cyan
];

export const BG_COLORS = [
  "#E5E7EB", // gray-200
  "#DBEAFE", // blue-100
  "#D1FAE5", // emerald-100
  "#FFE4E6", // rose-100
  "#FEF3C7", // amber-100
  "#F5F3FF", // violet-50
];

export const HAIR_STYLES = ["none", "short", "long", "curly", "bun", "mohawk"];
export const EYE_STYLES = ["round", "smile", "wink"];
export const MOUTH_STYLES = ["smile", "neutral", "frown", "laugh"];
export const ACCESSORIES = ["none", "glasses", "earring", "cap"];

export const DEFAULT_AVATAR = {
  bg: BG_COLORS[0],
  skin: SKIN_TONES[1],
  hairStyle: "short",
  hairColor: HAIR_COLORS[0],
  eyes: "round",
  mouth: "smile",
  accessory: "none",
};

function Hair({ style, color }) {
  switch (style) {
    case "short":
      return (
        <path
          d="M80 35c-20 0-34 12-36 26 10-7 22-10 36-10s26 3 36 10c-2-14-16-26-36-26z"
          fill={color}
        />
      );
    case "long":
      return (
        <g fill={color}>
          <path d="M44 62c-2 20 6 38 36 38s38-18 36-38c-8-6-22-11-36-11S52 56 44 62z" />
          <path d="M45 60c5-12 18-21 35-21s30 9 35 21c-10-7-22-10-35-10s-25 3-35 10z" />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          {[...Array(8)].map((_, i) => {
            const cx = 40 + i * 12;
            const cy = 50 + (i % 2 ? 0 : 3);
            return <circle key={i} cx={cx} cy={cy} r="7" />;
          })}
        </g>
      );
    case "bun":
      return (
        <g fill={color}>
          <path d="M44 60c6-12 18-20 36-20s30 8 36 20c-10-6-22-9-36-9s-26 3-36 9z" />
          <circle cx="80" cy="32" r="10" />
        </g>
      );
    case "mohawk":
      return (
        <g fill={color}>
          {[...Array(7)].map((_, i) => (
            <rect
              key={i}
              x={70 - i * 3}
              y={28 - i}
              width="3"
              height="22"
              rx="1"
              transform={`rotate(${i * -6}, ${70 - i * 3}, 28)`}
            />
          ))}
          {[...Array(7)].map((_, i) => (
            <rect
              key={`r${i}`}
              x={80 + i * 3}
              y={28 - i}
              width="3"
              height="22"
              rx="1"
              transform={`rotate(${i * 6}, ${80 + i * 3}, 28)`}
            />
          ))}
        </g>
      );
    case "none":
    default:
      return null;
  }
}

function Eyes({ style }) {
  switch (style) {
    case "smile":
      return (
        <g stroke="#111827" strokeWidth="2" fill="none">
          <path d="M60 80c4 4 8 4 12 0" />
          <path d="M88 80c4 4 8 4 12 0" />
        </g>
      );
    case "wink":
      return (
        <g stroke="#111827" strokeWidth="2" fill="none">
          <path d="M60 80c4 4 8 4 12 0" />
          <line x1="88" y1="79" x2="100" y2="79" strokeLinecap="round" />
        </g>
      );
    case "round":
    default:
      return (
        <g fill="#111827">
          <circle cx="66" cy="80" r="3.5" />
          <circle cx="94" cy="80" r="3.5" />
        </g>
      );
  }
}

function Mouth({ style }) {
  switch (style) {
    case "neutral":
      return <rect x="72" y="96" width="16" height="2" rx="1" fill="#111827" />;
    case "frown":
      return <path d="M64 104c8-6 24-6 32 0" stroke="#111827" strokeWidth="2" fill="none" />;
    case "laugh":
      return (
        <g>
          <path d="M64 98c8 10 24 10 32 0" stroke="#111827" strokeWidth="2" fill="none" />
          <path d="M66 98c7 7 21 7 28 0" fill="#EF4444" />
        </g>
      );
    case "smile":
    default:
      return <path d="M64 98c8 6 24 6 32 0" stroke="#111827" strokeWidth="2" fill="none" />;
  }
}

function Accessory({ type }) {
  switch (type) {
    case "glasses":
      return (
        <g stroke="#111827" strokeWidth="2" fill="none">
          <circle cx="66" cy="80" r="8" />
          <circle cx="94" cy="80" r="8" />
          <line x1="74" y1="80" x2="86" y2="80" />
          <path d="M58 76c-4-3-7-4-10-2" />
          <path d="M102 76c4-3 7-4 10-2" />
        </g>
      );
    case "earring":
      return (
        <g stroke="#111827" strokeWidth="2" fill="none">
          <circle cx="48" cy="92" r="3" />
          <circle cx="112" cy="92" r="3" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M44 64c24-10 48-10 72 0l-4-14c-20-10-44-10-64 0l-4 14z" fill="#0EA5E9" />
          <rect x="44" y="64" width="72" height="6" rx="3" fill="#0284C7" />
        </g>
      );
    case "none":
    default:
      return null;
  }
}

export default function AvatarRenderer({
  config = DEFAULT_AVATAR,
  size = 160,
  rounded = true,
  className = "",
}) {
  const cfg = { ...DEFAULT_AVATAR, ...(config || {}) };
  const view = 160;
  const r = rounded ? 26 : 0;

  return (
    <svg
      viewBox={`0 0 ${view} ${view}`}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={view} height={view} rx={r} fill={cfg.bg} />

      {/* Neck + face */}
      <g>
        <rect x="70" y="110" width="20" height="16" rx="6" fill={cfg.skin} />
        <circle cx="80" cy="80" r="34" fill={cfg.skin} />
      </g>

      {/* Hair (behind accessories) */}
      <Hair style={cfg.hairStyle} color={cfg.hairColor} />

      {/* Eyes & mouth */}
      <Eyes style={cfg.eyes} />
      <Mouth style={cfg.mouth} />

      {/* Accessories */}
      <Accessory type={cfg.accessory} />
    </svg>
  );
}

/** Utility: export an SVG node to a PNG data URL */
export async function svgToPngDataUrl(svgEl, size = 512) {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const svg64 = window.btoa(unescape(encodeURIComponent(xml)));
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${svg64}`;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

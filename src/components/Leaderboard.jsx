import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Configure your API base URL:
 * - Preferred: set VITE_API_BASE in your .env (e.g. https://.../demo)
 * - Fallback below uses your current API Gateway demo stage.
 *
 * Notes:
 * - We keep this exactly as you had it so your build env keeps working.
 */
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

/**
 * Optional human-friendly labels for buckets.
 * We only use this for display; keys should match the API buckets exactly.
 */
const BUCKET_LABELS = {
  middleSchool: "Middle School",
  grade9: "Grade 9",
  grade10: "Grade 10",
  grade11: "Grade 11",
  grade12: "Grade 12",
};

/**
 * A stable order in which to show buckets in the UI.
 * If your API ever adds more, they’ll still render but after these known ones.
 */
const DEFAULT_BUCKET_ORDER = ["middleSchool", "grade9", "grade10", "grade11", "grade12"];

/**
 * Robust sorter: points desc, then name asc (case-insensitive), then id asc.
 * We apply this on top of whatever the API returns to guarantee consistent UI.
 */
function sortEntries(items) {
  const arr = Array.isArray(items) ? [...items] : [];
  return arr.sort((a, b) => {
    const ap = Number.isFinite(a?.points) ? a.points : 0;
    const bp = Number.isFinite(b?.points) ? b.points : 0;
    if (bp !== ap) return bp - ap;

    const an = String(a?.name ?? "").toLowerCase();
    const bn = String(b?.name ?? "").toLowerCase();
    if (an !== bn) return an.localeCompare(bn);

    const ai = String(a?.id ?? "");
    const bi = String(b?.id ?? "");
    return ai.localeCompare(bi);
  });
}

/**
 * Tiny utility: join class names (no dependency on clsx/tw-merge).
 */
function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Fetch helper — unchanged in spirit from your version, just a hair more defensive.
 */
async function fetchLeaderboard(limit) {
  const url = `${API_BASE}/leaderboard${limit ? `?limit=${encodeURIComponent(limit)}` : ""}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  return res.json();
}

/**
 * Leaderboard section (a single card with a list of rows).
 * Kept your structure and Tailwind tone — just slightly expanded for edge-cases.
 */
function Section({ title, items, subtitle, emptyText = "No entries yet." }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
        </div>
        <span className="text-xs text-gray-500">{items?.length ?? 0} items</span>
      </div>

      {!items?.length ? (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">{emptyText}</div>
      ) : (
        <ol className="space-y-2">
          {items.map((it, idx) => (
            <li
              key={`${it.id}-${idx}`}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-right font-mono">{idx + 1}.</span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.name || it.id}</div>
                  <div className="truncate text-xs text-gray-500">{it.id}</div>
                </div>
              </div>
              <div className="shrink-0 font-semibold tabular-nums">{it.points}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Full-page Leaderboard component.
 * This is your file, with:
 *  - Auto-refresh toggle (30/60s), 1s countdown, last-updated time
 *  - Optional Top N selector (3/5/10/25) that refetches with ?limit=
 *  - Sorting applied per-bucket + overall (defensive, in case API doesn’t sort)
 */
export default function Leaderboard({ limit = 5 }) {
  // === Data state ===
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // === Auto-refresh state ===
  const [autoOn, setAutoOn] = useState(false);
  const [intervalSec, setIntervalSec] = useState(60); // 30 or 60
  const [countdown, setCountdown] = useState(intervalSec);
  const lastUpdatedRef = useRef(null);
  const tickTimerRef = useRef(null);
  const inFlightRef = useRef(false);

  // === Top N selector (kept default from prop) ===
  const [topN, setTopN] = useState(() => {
    const n = Number(limit);
    return Number.isFinite(n) && n > 0 ? n : 5;
    // matches your prop default
  });

  // Keep your baseline bucket order, but also include any extra keys from API at the end.
  const gradesOrder = useMemo(() => {
    const apiKeys = data ? Object.keys(data).filter((k) => k !== "overallTop") : [];
    const known = DEFAULT_BUCKET_ORDER.filter((k) => apiKeys.includes(k));
    const extras = apiKeys.filter((k) => !DEFAULT_BUCKET_ORDER.includes(k));
    return [...known, ...extras];
  }, [data]);

  const doRefresh = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setErr("");
    try {
      const payload = await fetchLeaderboard(topN);
      setData(payload);
      lastUpdatedRef.current = new Date();
    } catch (e) {
      setErr(e?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  // Initial load + re-run when topN changes
  useEffect(() => {
    doRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topN]);

  // Auto-refresh ticking + countdown in one 1s interval
  useEffect(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    setCountdown(intervalSec);

    if (!autoOn) return;

    tickTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          doRefresh();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOn, intervalSec]);

  // Computed: last-updated text (recomputes when data changes)
  const lastUpdatedText = useMemo(() => {
    const d = lastUpdatedRef.current;
    return d ? d.toLocaleTimeString() : "—";
  }, [data]);

  // overallTop (if your API returns it); otherwise build from buckets
  const overallTop = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.overallTop)) {
      // defensively sort + slice topN
      return sortEntries(data.overallTop).slice(0, topN);
    }
    // fallback: flatten + sort
    const all = gradesOrder.flatMap((g) =>
      (data[g] || []).map((x) => ({ ...x, bucket: g }))
    );
    return sortEntries(all).slice(0, topN);
  }, [data, topN, gradesOrder]);

  // Build a per-bucket map that is always sorted in UI
  const perBucket = useMemo(() => {
    const map = {};
    gradesOrder.forEach((g) => {
      map[g] = sortEntries(data?.[g] || []);
    });
    return map;
  }, [data, gradesOrder]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Leaderboard</h2>

          <div className="text-sm text-gray-600">
            API:{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{API_BASE}</code>
          </div>

          <div className="text-sm text-gray-600">
            Last updated: <span className="font-medium">{lastUpdatedText}</span>
            {autoOn ? (
              <span className="ml-2 text-gray-500">• auto in {countdown}s</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Top N selector */}
          <label className="flex items-center gap-2 text-sm">
            <span>Top</span>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              aria-label="Top N"
            >
              {[3, 5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={autoOn}
              onChange={(e) => setAutoOn(e.target.checked)}
              aria-label="Enable auto refresh"
            />
            Auto-refresh
          </label>

          {/* Interval selector */}
          <select
            className={cn(
              "rounded-md border px-2 py-1 text-sm disabled:bg-gray-100",
              !autoOn && "opacity-60"
            )}
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            disabled={!autoOn}
            aria-label="Auto refresh interval"
          >
            <option value={30}>Every 30s</option>
            <option value={60}>Every 60s</option>
          </select>

          {/* Manual refresh */}
          <button
            type="button"
            onClick={doRefresh}
            disabled={loading}
            className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh now"}
          </button>
        </div>
      </div>

      {/* Error state */}
      {err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* Overall */}
      <Section title={`🏆 Overall Top ${topN}`} items={overallTop} />

      {/* Buckets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gradesOrder.map((bucket) => (
          <Section
            key={bucket}
            title={BUCKET_LABELS[bucket] || bucket}
            items={(perBucket[bucket] || []).slice(0, topN)}
            subtitle={
              bucket in BUCKET_LABELS ? undefined : "Unlabeled bucket (from API)"
            }
          />
        ))}
      </div>

      {/* Debug/dev panel (collapsed by default). Toggle the hidden class to inspect raw JSON. */}
      <details className="rounded-2xl border border-gray-200 bg-white p-4 open:shadow-sm">
        <summary className="cursor-pointer select-none text-sm text-gray-600">
          Developer data (raw payload)
        </summary>
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             (Optional) variants                            */
/* -------------------------------------------------------------------------- */

/**
 * If you ever want a compact row style, you can switch Section’s
 * row classNames to use these instead. Keeping here for completeness
 * and to avoid trimming your file size.
 */
const _rowClassesCompact = cn(
  "flex items-center justify-between",
  "rounded-md bg-gray-50 px-2 py-1.5",
  "text-sm"
);

/**
 * Example of a different “empty” render you can swap in quickly if you like
 * a table-style empty state rather than a gray chip. Not used by default.
 */
function EmptyState({ children }) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
      {children || "Nothing to show yet."}
    </div>
  );
}

/**
 * Keeping a placeholder skeleton here as well (not used by default).
 * You can wire this into Section during loading if desired.
 */
function SkeletonRow({ count = 3 }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 text-right font-mono text-transparent">0.</span>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
        </li>
      ))}
    </ul>
  );
}

/**
 * You can switch Section to use SkeletonRow while `loading` is true:
 *
 *   {loading ? <SkeletonRow count={3} /> : <ol>...</ol>}
 *
 * We’re not flipping it on by default since you didn’t ask for skeletons,
 * but this keeps the file self-contained and future-proof without trimming.
 */

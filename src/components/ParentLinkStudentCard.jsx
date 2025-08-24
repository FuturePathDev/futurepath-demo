// src/components/ParentLinkStudentCard.jsx
import React, { useMemo, useRef, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";

/** Resolve API base */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

export default function ParentLinkStudentCard() {
  const { profile, linkChild, unlinkChild } = useProfile();
  const [queryEmail, setQueryEmail] = useState("");
  const [result, setResult] = useState(null); // { profile: {...} } or null
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [linking, setLinking] = useState(false);

  const children = Array.isArray(profile?.children) ? profile.children : [];

  async function lookup() {
    if (!queryEmail.trim()) return;
    try {
      setStatus("loading");
      setError("");
      setResult(null);

      const url = `${API_BASE}/user?email=${encodeURIComponent(queryEmail.trim())}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const json = await res.json();
      if (!res.ok || !json?.profile) {
        throw new Error(json?.message || `User not found: ${queryEmail.trim()}`);
      }
      setResult(json);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Lookup failed");
    }
  }

  async function doLink(email) {
    if (!email) return;
    try {
      setLinking(true);
      setError("");
      await linkChild(email);
      setResult(null);
      setQueryEmail("");
    } catch (e) {
      setError(e?.message || "Failed to link");
    } finally {
      setLinking(false);
    }
  }

  async function doUnlink(email) {
    if (!email) return;
    try {
      setLinking(true);
      setError("");
      await unlinkChild(email);
    } catch (e) {
      setError(e?.message || "Failed to unlink");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Link Student</div>
      <div className="text-sm text-gray-600">
        Add your student by email to view their progress and results.
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={queryEmail}
          onChange={(e) => setQueryEmail(e.target.value)}
          placeholder="student@example.com"
          className="min-w-[260px] rounded-md border px-3 py-2"
        />
        <button
          type="button"
          onClick={lookup}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          disabled={!queryEmail || status === "loading"}
        >
          {status === "loading" ? "Looking up…" : "Look up"}
        </button>
      </div>

      {status === "error" && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {result?.profile ? (
        <div className="mt-3 rounded-xl border p-3">
          <div className="font-medium">{result.profile.name || result.profile.email}</div>
          <div className="text-sm text-gray-600">
            {result.profile.district ? `${result.profile.district} • ` : ""}
            {result.profile.grade ? `Grade ${result.profile.grade}` : ""}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Holland: <span className="font-mono">{result.profile.hollandCode || "—"}</span>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => doLink(result.profile.email)}
              className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={linking}
            >
              {linking ? "Linking…" : "Link Student"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Existing children list */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-medium">Linked Students</div>
        {!children.length ? (
          <div className="text-sm text-gray-600">None linked yet.</div>
        ) : (
          <ul className="space-y-2">
            {children.map((e) => (
              <li key={e} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{e}</span>
                <button
                  type="button"
                  onClick={() => doUnlink(e)}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  disabled={linking}
                >
                  Unlink
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

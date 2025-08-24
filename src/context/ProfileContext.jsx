
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Resolve API base (window → Vite → CRA → fallback)
 * Supports:
 *  - window.__API_BASE_URL__ or window.API_BASE
 *  - Vite:  import.meta.env.VITE_API_BASE_URL | VITE_API_BASE
 *  - CRA:   process.env.REACT_APP_API_BASE_URL | REACT_APP_API_BASE
 */
const API_BASE =
  (typeof window !== "undefined" && (window.__API_BASE_URL__ || window.API_BASE)) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) ||
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE)) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

/** Local storage keys */
const LS_PROFILE = "fp_user";
const LS_DEMO_EMAIL = "demoEmail";

/** Normalize role into one of: "student" | "parent" | "admin" */
function normalizeRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "student" || r === "parent" || r === "admin") return r;
  return "student";
}

/** Shallow merge helper + role normalization */
function mergeProfile(prev, patch) {
  const next = { ...(prev || {}), ...(patch || {}) };
  next.role = normalizeRole(next.role);
  return next;
}

/** Read cached profile or seed a minimal demo identity */
function readCachedProfile() {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed a minimal demo user so the app can personalize immediately
  const email =
    (typeof localStorage !== "undefined" && localStorage.getItem(LS_DEMO_EMAIL)) ||
    "student@example.com";
  return {
    email,
    name: "Alex Kim",
    role: "student",
    district: "Riverside USD",
    grade: "9",
  };
}

function writeCachedProfile(p) {
  try {
    localStorage.setItem(LS_PROFILE, JSON.stringify(p));
  } catch {}
}

const ProfileCtx = createContext(null);

export function ProfileProvider({ children }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [profile, setProfileState] = useState(null);
  const [error, setError] = useState("");

  // Boot: load from cache, then soft-refresh from API if email exists
  useEffect(() => {
    const cached = readCachedProfile();
    setProfileState(cached);
    setStatus("ready");

    (async () => {
      try {
        if (!cached?.email) return;
        const res = await fetch(
          `${API_BASE}/user?email=${encodeURIComponent(cached.email)}`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json?.profile) {
          const next = mergeProfile(cached, json.profile);
          setProfileState(next);
          writeCachedProfile(next);
        }
      } catch {
        // ignore in demo
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Replace/patch profile locally and cache it */
  const setProfile = useCallback((patch) => {
    setProfileState((prev) => {
      const next = mergeProfile(prev, patch);
      writeCachedProfile(next);
      return next;
    });
  }, []);

  /** POST to /user (best-effort) and update local cache */
  const saveProfile = useCallback(
    async (patch) => {
      const nextLocal = mergeProfile(profile, patch || {});
      setProfileState(nextLocal);
      writeCachedProfile(nextLocal);

      try {
        const res = await fetch(`${API_BASE}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextLocal),
        });
        try {
          const json = await res.json();
          if (json?.profile) {
            const merged = mergeProfile(nextLocal, json.profile);
            setProfileState(merged);
            writeCachedProfile(merged);
            return merged;
          }
        } catch {}
      } catch {}
      return nextLocal;
    },
    [profile]
  );

  /** Pull latest profile from API if we have an email */
  const refreshProfile = useCallback(async () => {
    if (!profile?.email) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/user?email=${encodeURIComponent(profile.email)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.profile) {
        const next = mergeProfile(profile, json.profile);
        setProfileState(next);
        writeCachedProfile(next);
      }
      setStatus("ready");
    } catch (e) {
      setError(e?.message || "Failed to refresh profile");
      setStatus("error");
    }
  }, [profile]);

  /** Demo sign-out: clear local profile, keep demo email */
  const signOut = useCallback(async () => {
    try {
      const { Auth } = await import("aws-amplify");
      try {
        await Auth.signOut();
      } catch {}
    } catch {}
    try {
      localStorage.removeItem(LS_PROFILE);
    } catch {}
    const seed = readCachedProfile();
    setProfileState(seed);
    setStatus("ready");
  }, []);

  // Parent helpers
  const linkChild = useCallback(
    async (childEmail) => {
      if (!childEmail) return profile;
      const existing = Array.isArray(profile?.children) ? profile.children : [];
      const nextChildren = existing.includes(childEmail)
        ? existing
        : [...existing, childEmail];
      return saveProfile({ children: nextChildren });
    },
    [profile, saveProfile]
  );

  const unlinkChild = useCallback(
    async (childEmail) => {
      if (!childEmail) return profile;
      const existing = Array.isArray(profile?.children) ? profile.children : [];
      const nextChildren = existing.filter((e) => e !== childEmail);
      return saveProfile({ children: nextChildren });
    },
    [profile, saveProfile]
  );

  // Mentor helper (students select mentor)
  const setMentor = useCallback(
    async (mentor) => {
      // mentor: { id,name,email,title,org }
      return saveProfile({ mentor: mentor || null });
    },
    [saveProfile]
  );

  // Role helpers
  const role = normalizeRole(profile?.role);
  const isStudent = role === "student";
  const isParent = role === "parent";
  const isAdmin = role === "admin";
  const hasRole = useCallback(
    (r) => {
      if (Array.isArray(r)) return r.includes(role);
      return role === r;
    },
    [role]
  );

  // Onboarding flags
  const needsOnboarding = useMemo(() => {
    if (!role) return true;
    if (isStudent) return !(profile?.name && profile?.district && profile?.grade);
    if (isParent) return !(profile?.name && profile?.district);
    if (isAdmin) return !(profile?.name && profile?.district);
    return true;
  }, [profile, role, isStudent, isParent, isAdmin]);

  const value = useMemo(
    () => ({
      // data
      profile,
      role,
      status,
      error,
      // mutators
      setProfile,
      saveProfile,
      refreshProfile,
      signOut,
      linkChild,
      unlinkChild,
      setMentor,
      // helpers
      isStudent,
      isParent,
      isAdmin,
      hasRole,
      needsOnboarding,
    }),
    [
      profile,
      role,
      status,
      error,
      setProfile,
      saveProfile,
      refreshProfile,
      signOut,
      linkChild,
      unlinkChild,
      setMentor,
      isStudent,
      isParent,
      isAdmin,
      hasRole,
      needsOnboarding,
    ]
  );

  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>;
}

/** Consumer hook */
export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

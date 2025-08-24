// src/components/RequireGroup.jsx
import React, { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";

/**
 * Gate children to users who are signed-in AND belong to at least
 * one of the required Cognito groups.
 *
 * Usage:
 *   <RequireGroup groups={['Admin']}>
 *     <AdminDashboard />
 *   </RequireGroup>
 */
export default function RequireGroup({ groups = [], children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        setLoading(true);
        const user = await Auth.currentAuthenticatedUser();
        const payload =
          user?.signInUserSession?.accessToken?.payload ||
          user?.signInUserSession?.idToken?.payload ||
          {};
        const userGroups =
          payload["cognito:groups"] ||
          payload["groups"] ||
          user?.attributes?.["cognito:groups"] ||
          [];

        const normalized = Array.isArray(userGroups) ? userGroups : [userGroups].filter(Boolean);
        const ok = groups.length === 0 ? true : normalized.some((g) => groups.includes(g));

        if (mounted) {
          setAuthed(true);
          setHasGroup(ok);
          setUserInfo({
            username: user?.username,
            email: user?.attributes?.email,
            groups: normalized,
          });
        }
      } catch (e) {
        if (mounted) {
          setAuthed(false);
          setHasGroup(false);
          setErr(e?.message || "Not signed in");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [groups.join("|")]);

  if (loading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>Checking authorization…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Please sign in</h2>
          <p style={styles.p}>You need to sign in to view this page.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={styles.buttonPrimary}
              onClick={() => {
                // If you use Hosted UI, this will redirect:
                try {
                  Auth.federatedSignIn();
                } catch {
                  // Fallback: bounce to home so the app's sign-in flow can be used
                  window.location.href = "/";
                }
              }}
            >
              Sign in
            </button>
            <Link to="/" style={styles.buttonSecondary}>
              Back home
            </Link>
          </div>
          {err ? <div style={styles.errorSmall}>{String(err)}</div> : null}
        </div>
      </div>
    );
  }

  if (!hasGroup) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Not authorized</h2>
          <p style={styles.p}>
            Your account isn’t in the required group(s):{" "}
            <code style={styles.code}>{groups.join(", ") || "(none)"}</code>.
          </p>
          <p style={styles.pSmall}>
            Signed in as: <strong>{userInfo?.email || userInfo?.username || "user"}</strong>
            {userInfo?.groups?.length ? (
              <>
                {" "}
                • your groups:{" "}
                <code style={styles.code}>{userInfo.groups.join(", ")}</code>
              </>
            ) : null}
          </p>
          <Link to="/" style={styles.buttonSecondary}>Back home</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const styles = {
  wrap: { maxWidth: 720, margin: "40px auto", padding: "0 16px" },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  h2: { margin: "0 0 6px", fontSize: 20 },
  p: { margin: "0 0 12px", color: "#475569" },
  pSmall: { margin: "8px 0 12px", color: "#64748b", fontSize: 13 },
  buttonPrimary: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  buttonSecondary: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    fontSize: 14,
    textDecoration: "none",
    display: "inline-block",
  },
  errorSmall: {
    marginTop: 10,
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
  },
  code: {
    background: "#f1f5f9",
    padding: "0 6px",
    borderRadius: 6,
    fontSize: 12,
  },
};

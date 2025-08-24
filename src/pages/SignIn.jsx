import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const { route } = useAuthenticator((ctx) => [ctx.route]);

  // When authenticated, redirect to the intended page
  useEffect(() => {
    if (route === "authenticated") {
      navigate(from, { replace: true });
    }
  }, [route, from, navigate]);

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ marginBottom: 12 }}>
          <div style={styles.logo}>FP</div>
          <h1 style={styles.h1}>Sign in to FuturePath</h1>
          <p style={styles.sub}>Create an account or sign in to continue.</p>
        </div>

        <Authenticator
          // You can customize formFields if you want to collect name/etc. at sign-up.
          // formFields={{
          //   signUp: {
          //     name: { order: 1 },
          //   },
          // }}
          initialState="signIn"
          hideSignUp={false}
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(2,8,23,0.08)",
    padding: 16,
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: 10,
    background: "#0f172a",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  h1: { margin: "4px 0", fontSize: 20 },
  sub: { margin: 0, color: "#475569", fontSize: 13 },
};

// src/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, info) {
    // Log to console so we can see the original stack too
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
          <h2 style={{ marginBottom: 8 }}>Something broke.</h2>
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fecaca",
              color: "#7f1d1d",
              padding: 12,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              lineHeight: 1.4,
            }}
          >
            {String(this.state.err?.message || this.state.err)}
          </div>
          <p style={{ marginTop: 10, color: "#4b5563" }}>
            Check the browser console for details. The app won’t go blank anymore.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// src/components/MentorInviteStickyCard.jsx
import React from "react";
import { useProfile } from "../context/ProfileContext.jsx";
import { API_BASE } from "../lib/apiBase.js";
import { createInvite, listInvitesByStudent } from "../lib/mentorsApi.js";

function getDemoEmail() {
  try {
    return localStorage.getItem("demoEmail") || "student@example.com";
  } catch { return "student@example.com"; }
}

export default function MentorInviteStickyCard() {
  const { profile } = useProfile();
  const email = profile?.email || getDemoEmail();
  const name = profile?.name || "Alex Kim";
  const [mentorId, setMentorId] = React.useState("");
  const [mentorName, setMentorName] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [msg, setMsg] = React.useState("");

  async function send(e) {
    e.preventDefault();
    if (!mentorId || !mentorName) return;
    setStatus("loading");
    setMsg("");
    try {
      await createInvite({
        mentorId,
        mentorName,
        studentEmail: email,
        studentName: name,
      });
      setStatus("ok");
      setMentorId("");
      setMentorName("");
      setMsg("Invite sent!");
    } catch (err) {
      setStatus("error");
      setMsg(err?.message || "Failed to send invite");
    }
  }

  return (
    <aside className="sticky top-4 space-y-3 rounded-2xl border p-4 shadow-sm">
      <div className="text-sm text-gray-600">
        Invite a mentor for <span className="font-medium">{name}</span>
      </div>
      <form onSubmit={send} className="space-y-2">
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Mentor ID (e.g., m-101)"
          value={mentorId}
          onChange={(e) => setMentorId(e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Mentor name"
          value={mentorName}
          onChange={(e) => setMentorName(e.target.value)}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "loading" ? "Sending…" : "Invite Mentor"}
        </button>
      </form>
      {msg ? (
        <div
          className={`text-xs ${status === "error" ? "text-red-700" : "text-green-700"}`}
        >
          {msg}
        </div>
      ) : null}
    </aside>
  );
}

import React, { useState } from "react";
import { addBookmark, removeBookmark } from "../api/Resources.js";
import { Link } from "react-router-dom";

export default function ResourceCard({ item, isBookmarked, onBookmark, onUnbookmark }) {
  const [busy, setBusy] = useState(false);

  const toggleBookmark = async () => {
    setBusy(true);
    try {
      if (isBookmarked) {
        await removeBookmark(item.id);
        onUnbookmark?.(item.id);
      } else {
        await addBookmark(item.id);
        onBookmark?.(item.id);
      }
    } catch (e) {
      console.error(e);
      alert("Bookmark action failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="text-xs uppercase text-gray-500 mb-2">{(item.audience || []).join(" • ")}</div>
      <Link to={`/resources/${encodeURIComponent(item.id)}`} className="block">
        <h3 className="text-lg font-semibold">{item.title}</h3>
      </Link>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.summary}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {(item.grades || []).slice(0, 3).map((g) => (
          <span key={g} className="text-xs px-2 py-0.5 rounded-full border">Grade {g}</span>
        ))}
        {(item.formats || []).slice(0, 2).map((f) => (
          <span key={f} className="text-xs px-2 py-0.5 rounded-full border">{f}</span>
        ))}
        {item.durationMin ? <span className="text-xs px-2 py-0.5 rounded-full border">{item.durationMin} min</span> : null}
        {item.costType ? <span className="text-xs px-2 py-0.5 rounded-full border">{item.costType}</span> : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link to={`/resources/${encodeURIComponent(item.id)}`} className="text-sm underline">Open</Link>
        <button onClick={toggleBookmark} disabled={busy} className="text-sm border rounded-xl px-3 py-1 bg-gray-50">
          {isBookmarked ? "Unsave" : "Save"}
        </button>
      </div>
    </div>
  );
}


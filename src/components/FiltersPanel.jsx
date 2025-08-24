import React from "react";

const AUDIENCES = ["Students", "Parents", "Educators", "Mentors", "Tutors"];
const GRADES = ["6","7","8","9","10","11","12"];
const CLUSTERS = ["STEM","Health","Business","Arts","Public Service","Skilled Trades"];
const RIASEC = ["R","I","A","S","E","C"];
const FORMATS = ["Guide","Checklist","Template","Video","Worksheet","Link","Course"];

export default function FiltersPanel({ query, setQuery, filters, setFilters, onApply, loading }) {
  const toggleMulti = (key, val) => {
    setFilters((f) => {
      const set = new Set(f[key]);
      set.has(val) ? set.delete(val) : set.add(val);
      return { ...f, [key]: Array.from(set) };
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Scholarships, essay, FAFSA..."
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Audience</div>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a}
              onClick={() => toggleMulti("audience", a)}
              className={`px-3 py-1 rounded-full border ${
                filters.audience.includes(a) ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Grades</div>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => toggleMulti("grades", g)}
              className={`px-3 py-1 rounded-full border ${
                filters.grades.includes(g) ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Career Clusters</div>
        <div className="flex flex-wrap gap-2">
          {CLUSTERS.map((c) => (
            <button
              key={c}
              onClick={() => toggleMulti("clusters", c)}
              className={`px-3 py-1 rounded-full border ${
                filters.clusters.includes(c) ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">RIASEC</div>
        <div className="flex flex-wrap gap-2">
          {RIASEC.map((r) => (
            <button
              key={r}
              onClick={() => toggleMulti("riaSec", r)}
              className={`px-3 py-1 rounded-full border ${
                filters.riaSec.includes(r) ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Format</div>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => toggleMulti("formats", f)}
              className={`px-3 py-1 rounded-full border ${
                filters.formats.includes(f) ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Duration (minutes)</label>
        <input
          type="number"
          min="1"
          placeholder="e.g., 10"
          value={filters.maxDuration}
          onChange={(e) => setFilters((f) => ({ ...f, maxDuration: e.target.value }))}
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.freeOnly}
          onChange={(e) => setFilters((f) => ({ ...f, freeOnly: e.target.checked }))}
        />
        <span className="text-sm">Free only</span>
      </label>

      <div className="pt-2">
        <button onClick={onApply} disabled={loading} className="w-full rounded-xl bg-blue-600 text-white py-2">
          {loading ? "Searching..." : "Apply filters"}
        </button>
      </div>
    </div>
  );
}


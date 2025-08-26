// src/pages/Journal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";

/** Build a storage key per user so parents/students don’t collide. */
function keyFor(email) {
  const id = String(email || "guest").toLowerCase();
  return `fp_journal::${id}`;
}

/** Tiny UID helper */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Safe localStorage read/write (works in demo) */
function safeRead(key, fallback) {
  try {
    const raw =
      typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function safeWrite(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // ignore for demo
  }
}

/** Small input/button helpers */
function TextInput(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border px-3 py-2 text-sm outline-none " +
        "border-slate-300 focus:border-sky-500"
      }
    />
  );
}
function Button({ children, variant = "solid", ...rest }) {
  const base = "rounded-md px-3 py-2 text-sm font-medium";
  const theme =
    variant === "solid"
      ? "bg-black text-white hover:opacity-90"
      : "border hover:bg-gray-50";
  return (
    <button type="button" {...rest} className={`${base} ${theme}`} >
      {children}
    </button>
  );
}

/** A single todo row */
function TodoRow({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  function save() {
    const t = String(text || "").trim();
    onEdit({ ...todo, text: t || todo.text });
    setEditing(false);
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!todo.done}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4 accent-sky-600"
          aria-label={todo.done ? "Mark as not done" : "Mark as done"}
        />
        {!editing ? (
          <div
            className={
              "text-sm " + (todo.done ? "line-through text-slate-500" : "")
            }
          >
            {todo.text}
          </div>
        ) : (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            onBlur={save}
            className="rounded border border-slate-300 px-2 py-1 text-sm outline-none"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="text-xs text-sky-700 underline"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Save" : "Edit"}
        </button>
        <button
          className="text-xs text-rose-700 underline"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete todo"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

/** Main page */
export default function Journal() {
  const { profile } = useProfile();
  const userKey = useMemo(() => keyFor(profile?.email), [profile?.email]);

  // State shape in storage:
  // { notes: string, todos: Array<{id,text,done,createdAt:number}> }
  const initial = useMemo(
    () =>
      safeRead(userKey, {
        notes: "",
        todos: [],
      }),
    [userKey]
  );

  const [notes, setNotes] = useState(initial.notes || "");
  const [todos, setTodos] = useState(
    Array.isArray(initial.todos) ? initial.todos : []
  );
  const [newTodo, setNewTodo] = useState("");
  const saveTimer = useRef(null);

  // Autosave (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      safeWrite(userKey, { notes, todos });
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userKey, notes, todos]);

  // Actions
  function addTodo() {
    const t = String(newTodo || "").trim();
    if (!t) return;
    const item = { id: uid(), text: t, done: false, createdAt: Date.now() };
    setTodos((prev) => [item, ...prev]);
    setNewTodo("");
  }
  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    );
  }
  function editTodo(next) {
    setTodos((prev) => prev.map((x) => (x.id === next.id ? next : x)));
  }
  function deleteTodo(id) {
    setTodos((prev) => prev.filter((x) => x.id !== id));
  }
  function clearAll() {
    if (!window.confirm("Clear all notes and todos for this account?")) return;
    setNotes("");
    setTodos([]);
    safeWrite(userKey, { notes: "", todos: [] });
  }
  function exportData() {
    const data = JSON.stringify({ notes, todos }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futurepath-journal-${(profile?.email || "guest")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Counts
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Student Journal</h1>
          <div className="text-sm text-slate-600">
            Private notes & to-dos for {(profile?.name || "your account")}.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData}>Export</Button>
          <Button variant="outline" onClick={clearAll}>Clear all</Button>
        </div>
      </header>

      {/* Layout: Notes + Todos */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Notes */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <div className="text-sm font-semibold">Notes</div>
            <div className="text-xs text-slate-600">
              Autosaves as you type • Markdown-friendly text
            </div>
          </div>
          <div className="p-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write anything—plans, reflections, next steps..."
              rows={18}
              className="h-[420px] w-full resize-none rounded-xl border border-slate-300 bg-white/90 p-3 text-sm outline-none focus:border-sky-500"
            />
          </div>
        </section>

        {/* To-Dos */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <div className="text-sm font-semibold">To-Dos</div>
            <div className="text-xs text-slate-600">
              {doneCount}/{todos.length} completed
            </div>
          </div>
          <div className="p-3">
            <div className="mb-3 flex items-center gap-2">
              <TextInput
                placeholder="New task (e.g., Email counselor, Finish FAFSA step 2)"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
              <Button onClick={addTodo}>Add</Button>
            </div>
            {todos.length ? (
              <ul className="grid gap-2">
                {todos.map((t) => (
                  <TodoRow
                    key={t.id}
                    todo={t}
                    onToggle={toggleTodo}
                    onEdit={editTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-600">
                No tasks yet. Add your first one above.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

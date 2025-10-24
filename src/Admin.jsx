import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Admin() {
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("ADMIN_SESSION") || "");
  const [username, setUsername] = useState(localStorage.getItem("ADMIN_USER") || "admin");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);            // 👈 eye toggle
  const fileRef = useRef(null);

  const authed = !!token;

  useEffect(() => {
    setLoading(true);
    fetch("/api/matrix")
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Failed to load /api/matrix")))
      .then(d => setJsonText(JSON.stringify(d || { categories: [] }, null, 2)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const parsed = useMemo(() => {
    try { return { ok: true, data: JSON.parse(jsonText) }; }
    catch (e) { return { ok: false, err: e.message }; }
  }, [jsonText]);

  const login = async () => {
    setStatus(""); setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Login failed");
      const { token } = await res.json();
      localStorage.setItem("ADMIN_SESSION", token);
      localStorage.setItem("ADMIN_USER", username);
      setToken(token);
      setPassword("");
      setStatus("Logged in ✓");
    } catch (e) { setError(e.message); }
  };

  const logout = async () => {
    try { await fetch("/api/logout", { method: "POST", headers: { "x-admin-token": token } }); } catch {}
    localStorage.removeItem("ADMIN_SESSION");
    setToken("");
    setStatus("Logged out");
  };

  const save = async () => {
    setStatus(""); setError("");
    if (!parsed.ok) return setError("JSON invalid: " + parsed.err);
    try {
      const res = await fetch("/api/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(parsed.data)
      });
      if (!res.ok) throw new Error("Save failed: " + res.status);
      setStatus("Saved ✓");
    } catch (e) { setError(e.message); }
  };

  const download = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "matrix-backup.json"; a.click(); URL.revokeObjectURL(a.href);
  };
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setJsonText(await file.text()); setStatus("Loaded file into editor (not saved yet)");
  };

  const addCategory = () => {
    const cur = parsed.ok ? parsed.data : { categories: [] };
    const next = { ...cur, categories: [...(cur.categories || []), { category: "New Category", color: "bg-orange-500", tiles: [] }] };
    setJsonText(JSON.stringify(next, null, 2));
  };
  const addTileToFirstCategory = () => {
    const cur = parsed.ok ? parsed.data : { categories: [] };
    if (!cur.categories?.length) return addCategory();
    const first = cur.categories[0];
    const tile = { title: "New Tile", summary: "Short description", tags: [], industries: [], verticals: [], qa: [{ q: "Question?", a: "Answer." }] };
    const updated = { ...cur, categories: cur.categories.map((c, i) => (i === 0 ? { ...first, tiles: [...(first.tiles || []), tile] } : c)) };
    setJsonText(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin • Discovery Matrix</h1>
          <div className="flex gap-2"><a href="#/" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Back to App</a></div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {!authed ? (
            <>
              <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" className="rounded-lg border px-3 py-2 text-sm" />
              <div className="flex items-stretch overflow-hidden rounded-lg border">
                <input
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Password"
                  type={showPwd ? "text" : "password"}           // 👈 uses eye toggle
                  className="px-3 py-2 text-sm outline-none"
                />
                <button type="button" onClick={()=>setShowPwd(s=>!s)} className="px-3 text-sm hover:bg-slate-50">
                  {showPwd ? "🚫" : "👁️"}
                </button>
              </div>
              <button onClick={login} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Login</button>
            </>
          ) : (
            <>
              <span className="text-sm text-green-700">Authenticated</span>
              <button onClick={logout} className="rounded-lg border px-3 py-2 text-sm">Logout</button>
              <button onClick={save} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white">Save</button>
              <button onClick={download} className="rounded-lg border px-3 py-2 text-sm font-semibold">Download backup</button>
              <button onClick={() => fileRef.current?.click()} className="rounded-lg border px-3 py-2 text-sm font-semibold">Upload JSON</button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={upload}/>
              <button onClick={addCategory} className="rounded-lg border px-3 py-2 text-sm">+ Category</button>
              <button onClick={addTileToFirstCategory} className="rounded-lg border px-3 py-2 text-sm">+ Tile to first category</button>
            </>
          )}
          {loading && <span className="text-sm text-slate-500">Loading…</span>}
          {status && <span className="text-sm text-green-700">{status}</span>}
          {error && <span className="text-sm text-red-700">Error: {error}</span>}
        </div>

        <textarea className="h-[70vh] w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm"
          value={jsonText} onChange={(e)=>setJsonText(e.target.value)} spellCheck={false} />
      </div>
    </div>
  );
}

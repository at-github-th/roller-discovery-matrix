import React, { useEffect, useState } from "react";
import RollerDiscoveryMatrix from "./RollerDiscoveryMatrix.jsx";
import Admin from "./Admin.jsx";

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route.startsWith("#/admin") ? <Admin/> : (
    <div>
      <div className="fixed right-3 top-3 z-40">
        <a href="#/admin" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow">Admin</a>
      </div>
      <RollerDiscoveryMatrix/>
    </div>
  );
}

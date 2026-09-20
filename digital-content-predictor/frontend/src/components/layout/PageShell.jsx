import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function PageShell({ title, description, showBack = false, backTo = "/dashboard", children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full ] text-[#172033]">
      <div className="flex min-h-screen w-full  ">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className=" bg-[#ffffff] w-full">
          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px] lg:hidden"
            />
          )}

          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            {showBack && <Link to={backTo} className="text-sm font-semibold text-[#4f46e5] hover:underline">← Back</Link>}
            <h1 className={`${showBack ? "mt-6 " : ""}text-xl font-bold tracking-[-0.04em] text-[#172033] sm:text-2xl lg:text-3xl`}>{title}</h1>
            {description && <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
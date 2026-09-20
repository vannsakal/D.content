import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Bookmark,
  CreditCard,
  UserCircle,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const items = [
  ["Dashboard", LayoutDashboard, "/dashboard"],
  ["Create Plan", PlusCircle, "/create-content"],
  ["History", History, "/plan/my-content"],
  ["Saved Ideas", Bookmark, "/plan/saved-ideas"],
  ["Pricing", CreditCard, "/pricing"],
  ["Profile", UserCircle, "/profile"],
];

const secondaryItems = [
  ["Help Center", HelpCircle, "/resources"],
  ["Settings", Settings, "/settings"],
];

export default function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  function handleLogout() {
    signOut();
    onClose?.();
    navigate("/", { replace: true });
  }

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 flex h-screen w-[180px] shrink-0 flex-col bg-[#f5f6ff] shadow-[18px_0_40px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-in-out",
        "w-[180px] border-r border-[#ebedf7]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:translate-x-0 lg:shadow-none",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4f46e5] text-[10px] font-bold text-white shadow-sm">M</div>
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold tracking-[-0.04em] text-[#1f2a44]">Meateka</div>
            <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#7c88a9]">Intelligence Platform</div>
          </div> */}
        </div>

        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe2f1] bg-white text-lg font-semibold text-[#4f46e5] transition hover:bg-[#eef0ff] lg:hidden"
        >
          ×
        </button>
      </div>

      <nav className="mt-2 flex-1 px-2.5" aria-label="Dashboard navigation">
        <ul className="space-y-1.5">
          {items.map(([label, Icon, path]) => (
            <li key={label}>
              <NavLink
                to={path}
                onClick={onClose}
                className={({ isActive }) => [
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-white text-[#3d42d9] shadow-[0_1px_0_rgba(15,23,42,0.02)]"
                    : 
                    "text-[#4b5565] hover:bg-white/70 hover:text-[#1f2a44]",
                ].join(" ")}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      strokeWidth={1.5}
                      className={isActive ? "shrink-0 text-[#3d42d9]" : "shrink-0 text-[#4b5565]"}
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-2.5 pb-4">
        <div className="border-t border-[#e5e7f3] pt-3">
          <div className="space-y-1.5">
            {secondaryItems.map(([label, Icon, path]) => (
              <NavLink
                key={label}
                to={path}
                onClick={onClose}
                className={({ isActive }) => [
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors duration-150",
                  isActive ? "bg-white text-[#1f2a44]" : "text-[#4b5565] hover:bg-white/70 hover:text-[#1f2a44]",
                ].join(" ")}
              >
                <Icon size={15} strokeWidth={1.5} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
          <button type="button" onClick={handleLogout} className="mt-1.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] font-medium text-[#4b5565] transition-colors duration-150 hover:bg-white/70 hover:text-[#1f2a44]">
            <LogOut size={15} strokeWidth={1.5} className="shrink-0" />
            <span className="truncate">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

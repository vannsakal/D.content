import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationMenu from "./NotificationMenu.jsx";
import SettingsButton from "./SettingsButton.jsx";
import UserAvatar from "./UserAvatar.jsx";
import ProfileDropdown from "./ProfileDropdown.jsx";
import logo from '../../assets/meateaka.png';



const links = [
  ["Home", "home"],
  ["Features", "features"],
  ["Pricing", "pricing"],
  ["About Us", "about"],
];

export default function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const hashSection = location.hash.replace("#", "");
    const initialSection = links.some(([, id]) => id === hashSection) ? hashSection : "home";
    setActiveSection(initialSection);

    if (location.pathname !== "/") return undefined;

    const sections = links.map(([, id]) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -55%", threshold: [0.1, 0.35, 0.65] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.hash, location.pathname]);

  function handleSectionClick(event, id) {
    event.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    navigate(`/#${id}`, { replace: true });
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLogout() {
    signOut();
    navigate("/login", { replace: true });
  }

  if (isAuthenticated) {
    return <header className="sticky top-0 z-40 border-b border-[#e7e5f1]/90 bg-[#fbfaff]/95 backdrop-blur-md"><div className="flex min-h-[72px] items-center justify-between px-3 sm:px-6">
      <Link to="/dashboard" className="text-xl font-extrabold tracking-[-0.04em] text-[#6d5ce7]">
        <img src={logo} alt="Company Logo" className="w-24 sm:w-28 lg:w-[130px]" />
      </Link>
      <div className="flex items-center gap-1.5"><NotificationMenu /><SettingsButton /><div className="relative ml-1"><UserAvatar user={user} isOpen={isProfileOpen} onClick={() => setIsProfileOpen((open) => !open)} />{isProfileOpen && <ProfileDropdown user={user} onClose={() => setIsProfileOpen(false)} />}</div></div></div></header>;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e5f1]/90 bg-[#fbfaff]/95 backdrop-blur-md">
      <div className=" flex min-h-[72px]  items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-extrabold tracking-[-0.04em] text-[#6d5ce7]">
          <img src={logo} alt="Company Logo" className="w-24 sm:w-28 lg:w-[130px]" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map(([label, id]) => <a key={id} href={`/#${id}`} onClick={(event) => handleSectionClick(event, id)} className={`relative px-4 py-6 text-sm font-semibold transition-colors duration-200 ${activeSection === id ? "text-[#6d5ce7]" : "text-slate-500 hover:text-[#6d5ce7]"}`}>
            {label}
            <span aria-hidden="true" className={`absolute bottom-0 left-4 right-4 h-0.5 origin-center rounded-full bg-[#6d5ce7] transition-transform duration-200 ${activeSection === id ? "scale-x-100" : "scale-x-0"}`} />
          </a>)}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          {isAuthenticated ? <><Link to="/dashboard" className="text-sm font-semibold text-[#6d5ce7]">Dashboard</Link><button type="button" onClick={handleLogout} className="rounded-xl bg-[#6d5ce7] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#5948d6]">Logout</button></> : <><Link to="/login" className="text-sm font-semibold text-[#6d5ce7]">Log in</Link><Link to="/login" className="rounded-xl bg-[#6d5ce7] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#5948d6]">Get Started</Link></>}
        </div>
        <button type="button" aria-label={isMenuOpen ? "Close menu" : "Open menu"} onClick={() => setIsMenuOpen((open) => !open)} className="rounded-lg p-2 text-[#6d5ce7] lg:hidden">{isMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {isMenuOpen && <div className="border-t border-[#e7e5f1] bg-white px-5 py-3 lg:hidden"><nav className="flex flex-col" aria-label="Mobile navigation">{links.map(([label, id]) => <a key={id} href={`/#${id}`} onClick={(event) => handleSectionClick(event, id)} className={`relative border-b border-[#f0eff6] px-1 py-3 text-sm font-semibold transition-colors duration-200 last:border-0 ${activeSection === id ? "text-[#6d5ce7]" : "text-slate-500 hover:text-[#6d5ce7]"}`}>
        {label}
        <span aria-hidden="true" className={`absolute bottom-0 left-1 h-0.5 w-12 origin-left rounded-full bg-[#6d5ce7] transition-transform duration-200 ${activeSection === id ? "scale-x-100" : "scale-x-0"}`} />
      </a>)}<div className="flex items-center gap-4 pt-4">{isAuthenticated ? <><Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#6d5ce7]">Dashboard</Link><button type="button" onClick={handleLogout} className="rounded-xl bg-[#6d5ce7] px-4 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#5948d6]">Logout</button></> : <><Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#6d5ce7]">Log in</Link><Link to="/login" onClick={() => setIsMenuOpen(false)} className="rounded-xl bg-[#6d5ce7] px-4 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#5948d6]">Start Free Trial</Link></>}</div></nav></div>}
    </header>
  );
}

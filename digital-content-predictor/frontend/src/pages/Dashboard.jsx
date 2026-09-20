import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import RecentPlatforms from "../components/dashboard/RecentPlatforms.jsx";
import AIContent from "../components/ai/AIContent.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { plan } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    planCount: 0,
    savedCount: 0
  });




  const load = () => {
    setLoading(true);
    api.get('/plan/dashboard-data')
        .then(({ data }) => {
          console.log('API response:', data);
          setDashboardData(data.data);
        })
        .catch((err) => console.error('Error fetching data:', err))
        .finally(() => setLoading(false));

      }
  

  useEffect(() => {
    load();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#172033]">
      <div className="flex min-h-screen ">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="relative min-w-0 flex-1 bg-[#ffffff]">
          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px] lg:hidden"
            />
          )}

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-10 lg:px-6 lg:py-8">
            <header className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-[#667085]">Welcome back</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#172033] sm:text-4xl">Ready to create your next content?</h1>

              </div>
              <button onClick={() => navigate("/create-content")} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338ca]">
                <span className="text-lg leading-none" aria-hidden="true">+</span>
                Create Content Plan
              </button>
            </header>

            {loading ? (
              <div className="mt-8 flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent"></div>
              </div>
            ) : (
              <>
                {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
                <section className="mt-8 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3" aria-label="Dashboard statistics">
                  <StatCard icon="▣" iconClass="bg-[#eeedff] text-[#4f46e5]" label="Content Plans" value={dashboardData.planCount} />
                  <StatCard icon="✦" iconClass="bg-[#e7faf4] text-[#12a77d]" label="Saved Ideas" value={dashboardData.savedCount} />
                  <StatCard icon="↗" iconClass="bg-[#eeedff] text-[#4f46e5]" label="Predictions Used" value={0} />
                </section>
              </>
            )}

            <section className="mt-8 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <RecentPlatforms />
              <AIContent />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

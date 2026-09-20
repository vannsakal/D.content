import React, { useEffect, useState } from "react";
import api from '../../services/api';
import { Link } from "react-router-dom";

export default function RecentPlatforms() {
  const [loading, setLoading] = useState(false);
  const [recentPlans, setRecentPlans] = useState([]);

  const load = () => {
    setLoading(true);
    api.get('/plan/recent-data')
        .then(({ data }) => {
          setRecentPlans(data.recent || []);
        })
        .catch((err) => console.error('Error fetching data:', err))
        .finally(() => setLoading(false));
  }

  useEffect(()=> {
    load();
  }, []);

  return (
    <section id="dashboard" className="min-w-0 rounded-xl border border-[#d9dbea] bg-white shadow-sm">
      <div className="flex items-center justify-between bg-[#f8f8ff] px-5 py-4"><h2 className="text-base font-bold text-[#172033]">Recent Content Plans</h2><Link to="/plan/my-content" className="text-xs font-semibold text-[#4f46e5] hover:underline">View All</Link></div>
      <div>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#4f46e5] border-t-transparent"></div>
          </div>
        )}
        {!loading && recentPlans.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">No recent plans yet.</p>
        )}
        {!loading && recentPlans.map((plan, index) => 
        <article key={index} className="grid min-w-0 gap-4 border-t border-[#eaebf2] px-5 py-5  md:items-center xl:grid-cols-[minmax(120px,1.25fr)_minmax(150px,1.5fr)_minmax(110px,0.8fr)_auto]">
          <div>
            <h3 className="flex min-w-0 flex-col text-sm font-bold leading-5 text-[#172033]">{plan.product_name}</h3>
             <p className="text-[#777777]">{plan.product_category}</p>
          </div>
        
        <div className="flex min-w-0 flex-wrap gap-5">
        {plan.platform_predictions?.map((platform, i) => (
          <div key={i} className="flex justify-center items-center flex-col">
            <div className="rounded-full bg-[#4F46E51A] border-0 text-center px-2">
                <div className="text-[16px] font-semibold text-[#444444]">{platform.platform}</div>  
            </div>
          
          <div className="text-sm text-[#555555]" >{platform.prediction}</div>
          </div>
        ))}
        </div>
        <div>

        </div>
        <time className="text-xs font-medium text-[#667085]">{(plan.created_at).split('T')[0]}</time>
      </article>)}</div>
    </section>
  );
}

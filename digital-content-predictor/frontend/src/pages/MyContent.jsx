import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import api from '../services/api';
import { Search, Download, SlidersHorizontal, ChevronDown, Calendar, Clock, RefreshCw, ArrowLeft, Star } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa6";
import ContentResult, { normalizePlan, hasRecommendations } from "../components/ai/ContentResult.jsx";


// Dropdown filter styled to match the existing pill buttons (Platforms,
// Categories, date range). `options` is [{ value, label }]; the first entry
// is treated as the "no filter applied" default.
function FilterDropdown({ icon: Icon, options, value, onChange, alignRight = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value) || options[0];
  const isActive = value !== options[0].value;

  return (
    <div className={`relative ${alignRight ? "ml-auto" : ""}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm whitespace-nowrap transition-colors ${
          isActive
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70"
        }`}
      >
        {selected.label}
        {Icon ? <Icon size={14} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div
          className={`absolute z-10 mt-1.5 min-w-[10rem] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3.5 py-2 text-left text-sm transition-colors ${
                opt.value === value
                  ? "bg-neutral-100 font-medium text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ item, onSelectResult, saved, onToggleSaved }) {
  // Shared normalizer so this page and the saved-ideas page agree on the shape.
  const combinedData = normalizePlan(item);
  const canView = hasRecommendations(item);

  const [savingStar, setSavingStar] = useState(false);

  const toggleSaved = async () => {
    if (savingStar) return;
    setSavingStar(true);
    try {
      await onToggleSaved(item, !saved);
    } finally {
      setSavingStar(false);
    }
  };

  return (
    

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-neutral-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-5   min-w-0">
        <button
          type="button"
          onClick={toggleSaved}
          disabled={savingStar}
          aria-label={saved ? "Remove from saved plans" : "Save this plan"}
          aria-pressed={saved}
          title={saved ? "Saved" : "Save this plan"}
          className={`shrink-0 transition-colors disabled:opacity-50 ${
            saved ? "text-yellow-400" : "text-neutral-300 hover:text-yellow-400"
          }`}
        >
          <Star size={20} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        <div>
          <div className={`flex items-center justify-center text-center border w-fit h-fit rounded-2xl px-1.5 py-1.5 ${item.plan_channel === 'TikTok' ? 'bg-black my-1.5' : item.plan_channel === 'Instagram' ? 'my-1.5 bg-gradient-to-tr from-[#f58529] via-[#dd2c7c] to-[#8034b7]' : 'border-0'}`}>
                                {item.plan_channel === 'TikTok' ? <FaTiktok className="size-6 text-[#ffffff]" /> : item.plan_channel === 'Instagram' ? <FaInstagram className="size-6 text-[#ffffff]" /> : <FaFacebook color="#3525CD" className="size-9" />}
                              </div>
        </div>
       
       
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-neutral-900 truncate">
            {item.product_name}
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 mt-0.5 flex-wrap">
            <span>{item.plan_channel}</span>
            <span className="text-neutral-300">•</span>
            <Clock size={12} className="text-neutral-400" />
            <span>{(item.created_at).split('T')[0]}</span>
            <span className="text-neutral-300">•</span>
            <span>{item.product_category}</span>
          </div>
        </div>
      </div>
 
      <div className="flex items-center gap-4 sm:gap-5 shrink-0 justify-between sm:justify-end">
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-1 `}
          >
            
          </div>
           <p className="text-[13px] text-neutral-500 inline-flex items-center">
             Performance: <span className="font-semibold text-neutral-900">{item.recommendations?.[0]?.performance ?? '—'}</span>
          </p>
        </div>
 
        <button
          type="button"
          aria-label="Re-run analysis"
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
 
        <button
          type="button"
          disabled={!canView}
          className={`text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            !canView 
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" 
              : "bg-violet-50 text-violet-600 hover:bg-violet-100"
          }`}
          onClick={() => {
            if (canView) {
              onSelectResult(combinedData);
            }
          }}
        >
          {canView ? "View Results" : "No Results"}
        </button>
      </div>
    </div>




     


  )
}

export default function MyContent() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedKey, setSelectedKey] = useState(0);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const resultRef = useRef(null);

  // Search + filter state.
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  const platformOptions = useMemo(() => {
    const unique = Array.from(
      new Set(history.map((item) => item.plan_channel).filter(Boolean))
    ).sort();
    return [
      { value: "all", label: "All Platforms" },
      ...unique.map((p) => ({ value: p, label: p })),
    ];
  }, [history]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(history.map((item) => item.product_category).filter(Boolean))
    ).sort();
    return [
      { value: "all", label: "All Categories" },
      ...unique.map((c) => ({ value: c, label: c })),
    ];
  }, [history]);

  const dateOptions = [
    { value: "30", label: "Last 30 Days" },
    { value: "7", label: "Last 7 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "all", label: "All Time" },
  ];

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      dateRange === "all" ? null : Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000;

    return history.filter((item) => {
      const matchesQuery = !q || String(item.product_name ?? "").toLowerCase().includes(q);

      const matchesPlatform = platformFilter === "all" || item.plan_channel === platformFilter;
      const matchesCategory = categoryFilter === "all" || item.product_category === categoryFilter;

      const itemTime = new Date(item.created_at).getTime();
      const matchesDate = cutoff === null || (!Number.isNaN(itemTime) && itemTime >= cutoff);

      return matchesQuery && matchesPlatform && matchesCategory && matchesDate;
    });
  }, [history, query, platformFilter, categoryFilter, dateRange]);

  const hasActiveFilters =
    query.trim() !== "" || platformFilter !== "all" || categoryFilter !== "all" || dateRange !== "30";

  const load = () => {
    setLoading(true);
    setError("");
    api.get('/plan/my-content')
    .then(({ data }) => { setHistory(data.history); })
    .catch(() => { setError("Failed to load your content plans."); })
    .finally(() => { setLoading(false); });
  };

  // No is_saved column on the history rows, so work out which plans are
  // already starred by pulling the saved list and matching on plan_id.
  const loadSavedIds = () => {
    api.get('/plan/saved-ideas')
      .then(({ data }) => {
        const rows = Array.isArray(data.saved) ? data.saved : [];
        setSavedIds(new Set(rows.map((row) => row.plan_id)));
      })
      .catch(() => { /* stars just stay grey if this fails */ });
  };

  useEffect(() => { load(); loadSavedIds(); }, []);

  const handleToggleSaved = async (item, next) => {
    // Optimistic: flip the star now, put it back if the request fails.
    setSavedIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(item.plan_id);
      else copy.delete(item.plan_id);
      return copy;
    });

    try {
      if (next) {
        await api.post('/plan/saved', { plan_id: item.plan_id });
      } else {
        await api.delete(`/plan/delete-saved/${item.plan_id}`);
      }
    } catch {
      setSavedIds((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(item.plan_id);
        else copy.add(item.plan_id);
        return copy;
      });
    }
  };


  const handleSelectResult = (normalizedData) => {
    setSelectedResult(normalizedData);
    setSelectedKey((k) => k + 1);
    // Wait for the result to render, then scroll it into view.
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div>
      <PageShell title="" description="" backTo="/dashboard">
      
    <div className="min-h-screen bg-white">
      
    
      <div className=" mx-auto px-8 py-10 ">
        
          {!selectedResult && 
      <div>
        <div className="border-b border-neutral-200 pb-4 flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">History</h1>
            <p className="text-sm text-neutral-500">
              Review and manage your past AI content analyses.
            </p>
          </div>
        
          
        <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 max-w-xs w-full text-sm text-neutral-400">
          <Search size={14} className="shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-neutral-700"
          />
      </div>
      </div>

      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-neutral-500 mr-1">
            <SlidersHorizontal size={14} />
            Filters
          </span>
          <FilterDropdown
            options={platformOptions}
            value={platformFilter}
            onChange={setPlatformFilter}
          />
          <FilterDropdown
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <FilterDropdown
            icon={Calendar}
            options={dateOptions}
            value={dateRange}
            onChange={setDateRange}
            alignRight
          />
        </div>
        </div>  
        
  
 
    }
       
 
        
 
        <div className="flex flex-col gap-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f4e65] border-t-transparent"></div>
            </div>
          )}

          {error && !loading && (
            <p className="py-6 text-center text-sm font-medium text-red-600">{error}</p>
          )}

          {!selectedResult && !loading && !error && history.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-400">
              You don't have any content history yet.
            </p>
          )}

          {!selectedResult && !loading && !error && history.length > 0 && filteredHistory.length === 0 && (
            <div className="py-10 text-center text-sm text-neutral-400">
              <p>No history matches your search or filters.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPlatformFilter("all");
                    setCategoryFilter("all");
                    setDateRange("30");
                  }}
                  className="mt-2 font-semibold text-neutral-900 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!selectedResult && filteredHistory.map((item) => (
        <HistoryRow 
          key={item.plan_id} 
          item={item} 
          saved={savedIds.has(item.plan_id)}
          onToggleSaved={handleToggleSaved}
          onSelectResult={(normalizedData) => handleSelectResult(normalizedData)} 
        />
      ))}

      {/* Render the Result component if an item has been selected */}
      {selectedResult && (
        <div className="mt-8" ref={resultRef}>
          <button
            type="button"
            onClick={() => setSelectedResult(null)}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to History
          </button>
          <ContentResult key={selectedKey} recommendationData={selectedResult} />
        </div>
      )}
        </div>
      </div>
    </div>
  

           </PageShell>

     
    </div>
  )






}
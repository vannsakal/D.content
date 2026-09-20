import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  CreditCard,
  HelpCircle,
  Link2,
  Mail,
  MessageCircle,
  Search,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar.jsx";
import { searchHelpCenter } from "../services/helpCenterService.js";

const popularSearches = [
  "Connecting TikTok",
  "AI virality prediction",
  "Exporting plans",
  "Subscription & Billing",
];
const categories = [
  {
    title: "Getting Started",
    description:
      "Everything you need to set up your workspace and publish your first plan.",
    count: 12,
    icon: BookOpen,
    color: "bg-[#eeecff] text-[#5146e5]",
  },
  {
    title: "Platform Integrations",
    description:
      "Connect your social channels and keep analytics flowing into Meateka.",
    count: 18,
    icon: Link2,
    color: "bg-[#e6f8f4] text-[#159a7b]",
  },
  {
    title: "AI Content Planner & Predictor",
    description:
      "Understand predictions, scores, recommendations, and content signals.",
    count: 24,
    icon: Sparkles,
    color: "bg-[#fff2dc] text-[#d88a22]",
  },
  {
    title: "Workspace & Team Settings",
    description: "Manage members, permissions, workspaces, and draft reviews.",
    count: 9,
    icon: Users,
    color: "bg-[#e9f0ff] text-[#4776ce]",
  },
  {
    title: "Billing & Subscriptions",
    description:
      "Find answers about plans, invoices, upgrades, and saved ideas.",
    count: 8,
    icon: CreditCard,
    color: "bg-[#ffe9ed] text-[#d35e78]",
  },
  {
    title: "API & Data Export",
    description:
      "Export your plans and connect Meateka to your existing workflow.",
    count: 7,
    icon: Code2,
    color: "bg-[#eaf7f8] text-[#258e98]",
  },
];
const faqs = [
  "Why isn't my TikTok account syncing real-time analytics?",
  "How does Meateka calculate the Virality Match percentage?",
  "Can I schedule posts directly to Instagram Reels and Facebook?",
  "What happens to my saved ideas if I change my pricing plan?",
  "How do I invite team members or clients to review draft plans?",
];

export default function HelpCenter() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);



  async function handleSearch(event, searchValue = query) {
    event?.preventDefault();
    const trimmedQuery = searchValue.trim();
    if (!trimmedQuery) {
      setResults([]);
      setError("Enter a question or keyword to search the knowledge base.");
      return;
    }
    setSearching(true);
    setError("");
    try {
      const response = await searchHelpCenter(trimmedQuery);
      setResults(response.results || []);
      if (!response.results?.length)
        setError(
          "No close matches yet. Try a different phrase or browse a category below.",
        );
    } catch (searchError) {
      setResults([]);
      setError(
        searchError.message ||
          "Search is unavailable right now. Please try again.",
      );
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setError("");
  }

  return (
    <div className="h-screen bg-[#f4f6fb] text-[#172033]">
      <div className="flex h-full min-h-0 ">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="relative min-w-0 flex-1 overflow-y-auto bg-[#f7f9fd] px-8 py-10">
          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px] lg:hidden"
            />
          )}
          <div className=" ">
            <section className="overflow-hidden rounded-[28px] border border-[#e3e5f1] bg-white shadow-[0_2px_45px_rgba(15,23,42,0.04)]">
              <div className="bg-[radial-gradient(circle_at_80%_0%,#eeecff_0,transparent_35%),linear-gradient(135deg,#fbfaff_0%,#f7f8ff_100%)] px-6 py-10 sm:px-10 sm:py-14">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7ff] bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5146e5]">
                    <HelpCircle size={13} />
                    Knowledge Base & Creator Desk
                  </span>
                  <h1 className="mt-5 text-2xl font-bold sm:text-3xl tracking-[-0.05em] text-[#172033] sm:text-5xl">
                    How can we help you today?
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
                    Guides, video tutorials, platform integration
                    troubleshooting, and direct support for Meateka creators.
                  </p>
                </div>
                <form
                  onSubmit={handleSearch}
                  className="mt-8 flex max-w-4xl items-center gap-3 rounded-2xl border border-[#dfe2ee] bg-white p-2 shadow-[0_12px_30px_rgba(79,70,229,0.08)]"
                >
                  <Search size={20} className="ml-3 shrink-0 text-[#7c88a9]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-[#172033] outline-none placeholder:text-[#9aa4b8]"
                    placeholder="Search articles, guides, keywords, or error codes (e.g., TikTok sync, AI virality score)"
                    aria-label="Search Help Center"
                  />
                  <span className="hidden shrink-0 rounded-md bg-[#f4f5fa] px-2 py-1 text-[10px] font-bold text-[#8a94aa] sm:inline">
                    ESC clear
                  </span>
                  <button
                    type="submit"
                    disabled={searching}
                    className="rounded-xl bg-[#5146e5] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#4539d0] disabled:cursor-wait disabled:opacity-60"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-bold text-[#7c88a9]">
                    Popular:
                  </span>
                  {popularSearches.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => {
                        setQuery(item);
                        handleSearch({ preventDefault: () => {} }, item);
                      }}
                      className="rounded-full border border-[#e1e3ef] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#667085] transition hover:border-[#c9c4ff] hover:text-[#5146e5]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {(searching || error || results.length > 0) && (
                <div className="border-t border-[#edf0f6] px-6 py-6 sm:px-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#172033]">
                      Search results
                    </h2>
                    {results.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-xs font-bold text-[#5146e5] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {searching && (
                    <p className="mt-4 text-sm text-[#71809c]">
                      Finding the most relevant articles...
                    </p>
                  )}
                  {error && !searching && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-[#f2d3d8] bg-[#fff6f7] px-4 py-3 text-sm font-medium text-[#b8445d]"
                    >
                      {error}
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {results.map((result) => (
                      <article
                        key={result.title}
                        className="rounded-2xl border border-[#e5e7f1] bg-[#fbfcff] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold text-[#26324a]">
                            {result.title}
                          </h3>
                          <span className="shrink-0 rounded-full bg-[#eeecff] px-2 py-1 text-[9px] font-bold text-[#5146e5]">
                            {result.category}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#71809c]">
                          {result.summary}
                        </p>
                        {result.relatedArticles?.length > 0 && (
                          <p className="mt-3 text-[10px] font-semibold text-[#8a94aa]">
                            Related: {result.relatedArticles.join(" · ")}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="mt-10 px-6">
              <div className="px-1 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5146e5]">
                    Explore the knowledge base
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#172033]">
                    Browse by category
                  </h2>
                </div>
                <span className="hidden text-xs font-semibold text-[#8a94aa] sm:block">
                  78 articles for creators
                </span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map(
                  ({ title, description, count, icon: Icon, color }) => (
                    <article
                      key={title}
                      className="flex min-h-[218px] flex-col rounded-2xl border border-[#e1e4ef] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
                        >
                          <Icon size={19} strokeWidth={1.8} />
                        </span>
                        <span className="rounded-full bg-[#f4f5fa] px-2.5 py-1 text-[10px] font-bold text-[#7c88a9]">
                          {count} articles
                        </span>
                      </div>
                      <h3 className="mt-5 text-sm font-bold text-[#26324a]">
                        {title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#71809c]">
                        {description}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(title);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold text-[#5146e5] hover:underline"
                      >
                        Browse articles <span aria-hidden="true">→</span>
                      </button>
                    </article>
                  ),
                )}
              </div>
            </section>

            <section className="mt-12 grid gap-6 px-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="px-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5146e5]">
                    Quick answers
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#172033]">
                    Frequently asked questions
                  </h2>
                </div>
                <div className="mt-5 space-y-3">
                  {faqs.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-2xl border border-[#e1e4ef] bg-white"
                    >
                      <button
                        type="button"
                        aria-expanded={openFaq === index}
                        onClick={() =>
                          setOpenFaq(openFaq === index ? null : index)
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-[#26324a]"
                      >
                        <span>{question}</span>
                        <ChevronDown
                          size={17}
                          className={`shrink-0 text-[#7c88a9] transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openFaq === index && (
                        <p className="border-t border-[#edf0f6] px-5 pb-5 pt-3 text-xs leading-6 text-[#71809c]">
                          Our Creator Desk guide walks through this workflow
                          with practical steps and troubleshooting checks.
                          Search the question above to find the most relevant
                          article and related resources.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <aside className="rounded-2xl border border-[#dcd7ff] bg-[#f6f4ff] p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ddd8ff] text-sm font-extrabold text-[#5146e5]">
                    CD
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f8f1] px-2.5 py-1 text-[10px] font-bold text-[#168866]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18a879]" />
                    Online 24/7
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#172033]">
                  Still need help?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  Our Creator Desk is here to help you get back to creating with
                  confidence.
                </p>
                <a
                  href="mailto:support@meateka.com"
                  className="mt-5 flex items-center gap-2 text-xs font-bold text-[#5146e5] hover:underline"
                >
                  <Mail size={15} />
                  support@meateka.com
                </a>
                <p className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#168866]">
                  <CheckCircle2 size={15} />
                  All Systems Operational
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5146e5] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#4539d0]"
                  >
                    <MessageCircle size={15} />
                    Start Live Chat
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbc6f4] bg-white px-4 py-3 text-xs font-bold text-[#5146e5] transition hover:bg-[#f0eeff]"
                  >
                    <Ticket size={15} />
                    Submit a Ticket
                  </button>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
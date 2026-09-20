import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PageShell from "../components/layout/PageShell.jsx";

export default function Pricing() {
  const navigate = useNavigate();
  const { plan } = useAuth();

  const [billing, setBilling] = useState("monthly");

  const isPremium = plan === "premium";

  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  function closePricing() {
    navigate("/dashboard");
  }

  // ==========================================
  // START CHECKOUT
  // ==========================================

  function startCheckout(selectedPlan, price) {
    navigate("/checkout", {
      state: {
        billing,
        plan: selectedPlan,
        price,
      },
    });
  }

  // ==========================================
  // PRICES
  // ==========================================

  const prices = {
    basic: billing === "monthly" ? 12.99 : 3.99,
    pro: billing === "monthly" ? 11.99 : 15.99,
    enterprise: billing === "monthly" ? 9.99 : 79.99,
  };

  return (
    <PageShell title="" description="" backTo="/dashboard">
    <main className="min-h-[calc(100vh-4rem)] w-full ">
      {/* ==========================================
          PRICING HEADER
      =========================================== */}

      <div className="relative w-full px-4 py-3 sm:px-6 lg:px-0 xl:px-7">
        {/* ==========================================
            TOP HEADER
        =========================================== */}

        

        {/* ==========================================
            PRICING INTRO + BILLING
        =========================================== */}

        <div className="mx-auto mt-8 flex w-full max-w-[1500px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* INTRO */}

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#182033] sm:text-3xl">
              Simple, transparent pricing
            </h2>

            <p className="mt-2 max-w-2xl text-base leading-6 text-[#596174]">
              Unlock your full creative potential with our pro tools.
            </p>
          </div>

          {/* ==========================================
              BILLING TOGGLE
          =========================================== */}

          {/* <div className="shrink-0 rounded-xl border border-[#d9ddec] bg-[#eef0f7] p-1">
            <div className="flex items-center">
              

              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                  billing === "monthly"
                    ? "bg-white text-[#202638] shadow-sm"
                    : "text-[#4f5668] hover:text-[#202638]"
                }`}
              >
                Monthly
              </button>

              


              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                  billing === "annual"
                    ? "bg-white text-[#202638] shadow-sm"
                    : "text-[#4f5668] hover:text-[#202638]"
                }`}
              >
                Annually
              </button>

              

              <span className="ml-1 rounded-lg bg-[#e5e4ff] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#5146e5]">
                SAVE 20%
              </span>
            </div>
          </div> */}
        </div>

        {/* ==========================================
            PRICING CARDS
        =========================================== */}

        <div className="mx-auto mt-10 grid w-full max-w-[1500px] grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* ==========================================
              BASIC
          =========================================== */}

          <div className="flex h-full flex-col rounded-2xl border border-[#cfd4e3] bg-white p-8 transition hover:shadow-md">
            {/* TITLE */}

            <div>
              <h3 className="text-xl font-bold text-[#202638]">
                MONTHLY
              </h3>

              
            </div>

            {/* PRICE */}

            <div className="mt-5 flex items-end">
              <span className="text-3xl font-extrabold tracking-tight text-[#151d2f] sm:text-4xl lg:text-5xl">
                ${prices.basic.toFixed(2)}
              </span>

              <span className="mb-1 ml-1 text-sm text-[#596174]">
                /month
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-5 text-[#697084]">
                7 days free, then $12.99 every month.
              </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() => startCheckout("basic", prices.basic)}
              className="mt-8 h-10 w-full rounded-lg border border-[#969caf] bg-white text-sm font-semibold text-[#30384b] transition hover:bg-[#f7f8fc]"
            >
              {plan === "basic" ? "Change billing" : "Choose MONTHLY"}
            </button>


            
            {/* FEATURES */}

            {/* <div className="mt-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#51586a]">
                WHAT'S INCLUDED
              </p>

              <ul className="mt-4 space-y-3">
                {[
                  "Up to 10 Content Plans",
                  "Basic analytics dashboard",
                  "100 saved ideas",
                  "Standard support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-[15px] text-[#293144]"
                  >
                    <CheckCircle2
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-[#5146e5]"
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>

          {/* ==========================================
              PRO
          =========================================== */}

          <div className="relative flex h-full flex-col rounded-2xl border-2 border-[#4b3ff0] bg-[#5146e5] p-8 shadow-[0_10px_30px_rgba(70,60,220,0.12)]">
            {/* MOST POPULAR */}

            <div className="absolute -top-3 right-4 rounded-full bg-[#4b3ff0] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              MOST POPULAR
            </div>

            {/* TITLE */}

            <div>
              <h3 className="text-xl font-bold text-white">
                BI-ANNUALY
              </h3>


              
            </div>

            {/* PRICE */}

            <div className="mt-5 flex items-end">
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                ${prices.pro.toFixed(2)}
              </span>

              <span className="mb-1 ml-1 text-sm text-white/80">
                /month
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-5 text-white/80">
                Billed every 6 months as $71.99
              </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() => startCheckout("pro", prices.pro)}
              className="mt-8 h-10 w-full rounded-lg bg-white text-sm font-semibold text-[#5146e5] transition hover:bg-[#f3f4ff]"
            >
              {isPremium ? "Change billing" : "Choose BI-ANNUALY"}
            </button>

            {/* FEATURES */}

            {/* <div className="mt-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                EVERYTHING IN BASIC, PLUS:
              </p>

              <ul className="mt-4 space-y-3">
                {[
                  "Unlimited Content Plans",
                  "Advanced audience analytics & insights",
                  "Unlimited saved ideas",
                  "Priority 24/7 support",
                  "Custom branding export",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-[15px] text-white"
                  >
                    <CheckCircle2
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-white"
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>

          {/* ==========================================
              ENTERPRISE
          =========================================== */}

          <div className="flex h-full flex-col rounded-2xl border border-[#cfd4e3] bg-white p-8 transition hover:shadow-md">
            {/* TITLE */}

            <div>
              <h3 className="text-xl font-bold text-[#202638]">
                ANNUALY
              </h3>

              
            </div>

            {/* PRICE */}

            <div className="mt-5 flex items-end">
              <span className="text-3xl font-extrabold tracking-tight text-[#151d2f] sm:text-4xl lg:text-5xl">
                ${prices.enterprise.toFixed(2)}
              </span>

              <span className="mb-1 ml-1 text-sm text-[#596174]">
                /month
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-5 text-[#697084]">
                Billed every 12 months as $119.99.
              </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() =>
                startCheckout("enterprise", prices.enterprise)
              }
              className="mt-8 h-10 w-full rounded-lg border border-[#969caf] bg-white text-sm font-semibold text-[#30384b] transition hover:bg-[#f7f8fc]"
            >
              Choose ANNUALY
            </button>

            {/* FEATURES */}

            {/* <div className="mt-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#51586a]">
                EVERYTHING IN PRO, PLUS:
              </p>


              <ul className="mt-4 space-y-3">
                {[
                  "Custom integrations",
                  "Dedicated account manager",
                  "Advanced team management",
                  "Priority enterprise support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-[15px] text-[#293144]"
                  >
                    <CheckCircle2
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-[#5146e5]"
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </main>
    </PageShell>
  );
}

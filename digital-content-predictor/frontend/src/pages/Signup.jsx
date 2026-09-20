import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Mail, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PasswordInput from "../components/auth/PasswordInput.jsx";
import SocialSignupButtons from "../components/auth/SocialSignupButtons.jsx";

import { useAuth } from "../context/AuthContext.jsx";
import logo from '../assets/meateaka.png';
const passwordRules = [
  ["length", "Minimum 8 characters"],
  ["uppercase", "At least one uppercase letter"],
  ["number", "At least one number"],
  ["special", "At least one special character"],
];

export default function Signup() {
  const { isAuthenticated, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => ({
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  }), [form.password]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Validation checks
    if (!form.firstName.trim()) return setError("Enter your first name.");
    if (!form.lastName.trim()) return setError("Enter your last name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (!Object.values(rules).every(Boolean)) return setError("Choose a password that meets every requirement.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!agreed) return setError("Accept the Terms of Service and Privacy Policy to continue.");
    
    setLoading(true);

    const result = await signUp(form.email, form.password, form.firstName, form.lastName);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    navigate("/dashboard", { replace: true });
}

  return (
    <main className="min-h-screen bg-white text-[#20213c]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
        <section className="relative flex min-h-[200px] flex-col overflow-hidden bg-[#eeedff] px-5 py-4 sm:min-h-[360px] sm:px-12 sm:py-8 lg:min-h-screen lg:px-16 lg:py-12">
                  <div className="absolute -right-20 -top-20 hidden h-64 w-64 rounded-full border-[34px] border-white/30 sm:block" />
                  <div className="absolute bottom-20 -left-28 hidden h-56 w-56 rounded-full border-[28px] border-[#d8d2fb]/70 sm:block" />
                  <div className="relative z-10 flex items-center gap-2 text-2xl font-extrabold tracking-[-0.05em] text-[#6252db]"><img src={logo} alt="Logo" className="w-20 sm:w-36 lg:w-[200px]"/></div>
                  <div className="relative z-10 hidden flex-1 items-start py-12 lg:py-20 sm:flex"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7164c9]">Content intelligence platform</p><h1 className="mt-5 text-2xl font-bold leading-[1.08] tracking-[-0.045em] text-[#242344] sm:text-4xl lg:text-6xl">Intelligence meets productivity.</h1><p className="mt-4 max-w-sm text-xs leading-6 text-[#686887] sm:mt-6 sm:text-sm sm:leading-7">Make every creative decision with more clarity. Meateka brings your ideas, audience signals, and growth strategy into one focused workspace.</p><div className="mt-6 flex items-center gap-3 text-xs font-semibold text-[#6252db] sm:mt-8"><span className="h-px w-8 bg-[#958be5]" />Create with confidence</div></div></div>
                  <p className="relative z-10 hidden text-xs text-[#8582a5] sm:block">© 2026 Meateka Content Intelligence. All rights reserved.</p>
                </section>

        <section className="order-1 flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-12 lg:order-2 lg:px-16 lg:py-16">
          <div className="w-full max-w-sm rounded-3xl border border-[#e5e3ef] bg-white p-5 shadow-[0_18px_50px_rgba(58,47,130,0.08)] transition-shadow duration-500 hover:shadow-[0_22px_60px_rgba(58,47,130,0.11)] sm:max-w-[470px] sm:p-9">
            <div className="mb-6 sm:mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7669d8]">Creator Suite</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#20213c] sm:text-3xl lg:text-4xl">Create your account</h2><p className="mt-3 text-sm leading-6 text-[#85869a]">Start creating and managing your content today.</p></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label htmlFor="signup-name" className="block text-xs font-bold text-[#3d3e58]">First Name<div className="relative mt-2"><UserRound size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a2a3b7]" /><input id="signup-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Enter your first name" autoComplete="name" className="h-12 w-full rounded-xl border border-[#dfdfea] bg-[#fcfcfe] pl-11 pr-4 text-sm font-normal outline-none transition focus:border-[#7669d8] focus:bg-white focus:ring-4 focus:ring-[#7669d8]/10" /></div></label>
              <label htmlFor="signup-name" className="block text-xs font-bold text-[#3d3e58]">Last Name<div className="relative mt-2"><UserRound size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a2a3b7]" /><input id="signup-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Enter your last name" autoComplete="name" className="h-12 w-full rounded-xl border border-[#dfdfea] bg-[#fcfcfe] pl-11 pr-4 text-sm font-normal outline-none transition focus:border-[#7669d8] focus:bg-white focus:ring-4 focus:ring-[#7669d8]/10" /></div></label>
              <label htmlFor="signup-email" className="block text-xs font-bold text-[#3d3e58]">Email Address<div className="relative mt-2"><Mail size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a2a3b7]" /><input id="signup-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Enter your email" autoComplete="email" className="h-12 w-full rounded-xl border border-[#dfdfea] bg-[#fcfcfe] pl-11 pr-4 text-sm font-normal outline-none transition focus:border-[#7669d8] focus:bg-white focus:ring-4 focus:ring-[#7669d8]/10" /></div></label>
              <PasswordInput id="signup-password" label="Password" placeholder="Create a password" value={form.password} onChange={(value) => update("password", value)} autoComplete="new-password" />
              <div className="grid gap-1 rounded-xl bg-[#faf9ff] p-3">{passwordRules.map(([key, label]) => <p key={key} className={`flex items-center gap-2 text-[11px] ${rules[key] ? "text-[#138a6a]" : "text-[#94a0b8]"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${rules[key] ? "bg-[#e5f8f1]" : "bg-[#edf0f6]"}`}>{rules[key] && <Check size={10} />}</span>{label}</p>)}</div>
              <PasswordInput id="signup-confirm" label="Confirm Password" placeholder="Confirm your password" value={form.confirm} onChange={(value) => update("confirm", value)} autoComplete="new-password" />
              {error && <p role="alert" className="rounded-lg bg-[#fff0f1] px-3 py-2 text-sm font-medium text-[#c2415b]">{error}</p>}
              <label className="flex items-start gap-3 py-1 text-xs leading-5 text-[#71809c]"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfd2e3] text-[#5146e5] focus:ring-[#eeecff]" /> <span>I agree to the <button type="button" className="font-bold text-[#7669d8]">Terms of Service</button> and <button type="button" className="font-bold text-[#7669d8]">Privacy Policy</button></span></label>
              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6d5ce7] text-sm font-bold text-white shadow-[0_12px_24px_rgba(109,92,231,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5948d6] disabled:cursor-wait disabled:opacity-70">{loading ? "Creating account..." : <>Create Account <ArrowRight size={17} /></>}</button>
            </form>
            <div className="my-7 flex items-center gap-3 text-[11px] text-[#b1b1c0]"><span className="h-px flex-1 bg-[#ecebf2]" />or<span className="h-px flex-1 bg-[#ecebf2]" /></div>
            <SocialSignupButtons onUnavailable={() => setError("Social sign up is not connected yet. Use the email form to create your account.")} />
            <p className="mt-7 text-center text-sm text-[#85869a]">Already have an account? <Link to="/login" className="font-bold text-[#7669d8] hover:text-[#5748c9]">Log In</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

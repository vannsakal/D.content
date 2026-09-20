import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext.jsx";
import logo from '../assets/meateaka.png';

export default function Login() {
  const { isAuthenticated, signIn, signInDemo, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const destination = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate(destination, { replace: true });
  }

  function handleDemoSignIn() {
    signInDemo();
    navigate("/dashboard", { replace: true });
  }

  async function handleGoogleSignIn() {
    setError("");
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setError("Google sign in is not configured for this environment.");
      return;
    }

    setGoogleLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
      }
    });
  }

  async function handleGoogleCredential(response) {
    try {
      await signInWithGoogle(response.credential);
      navigate(destination, { replace: true });
    } catch (googleError) {
      setError(googleError?.message || "Google sign in was cancelled or failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#20213c]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
        <section className="relative flex min-h-[180px] flex-col overflow-hidden bg-[#eeedff] px-5 py-4 sm:min-h-[360px] sm:px-12 sm:py-6 lg:min-h-screen lg:px-16 lg:py-12">
          <div className="absolute -right-20 -top-20 hidden h-64 w-64 rounded-full border-[34px] border-white/30 sm:block" />
          <div className="absolute bottom-20 -left-28 hidden h-56 w-56 rounded-full border-[28px] border-[#d8d2fb]/70 sm:block" />
          <div className="relative z-10 flex items-center gap-2 text-2xl font-extrabold tracking-[-0.05em] text-[#6252db]"><img src={logo} alt="Logo" className="w-20 sm:w-36 lg:w-[200px]"/></div>
          <div className="relative z-10 hidden flex-1 items-start py-12 lg:py-20 sm:flex"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7164c9]">Content intelligence platform</p><h1 className="mt-3 text-2xl font-bold leading-[1.08] tracking-[-0.045em] text-[#242344] sm:text-4xl lg:text-5xl">Intelligence meets productivity.</h1><p className="mt-4 max-w-sm text-xs leading-6 text-[#686887] sm:mt-6 sm:text-sm sm:leading-7">Make every creative decision with more clarity. Meateka brings your ideas, audience signals, and growth strategy into one focused workspace.</p><div className="mt-6 flex items-center gap-3 text-xs font-semibold text-[#6252db] sm:mt-8"><span className="h-px w-8 bg-[#958be5]" />Create with confidence</div></div></div>
          <p className="relative z-10 hidden text-xs text-[#8582a5] sm:block">© 2026 Meateka Content Intelligence. All rights reserved.</p>
        </section>

        <section className="flex min-h-[280px] items-center justify-center bg-white py-6 sm:min-h-[500px] sm:py-14 lg:min-h-[620px] lg:px-24 lg:py-20">
          <div className="w-full max-w-[430px]">
            <div className="mb-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7669d8]">Welcome back</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#20213c] sm:text-4xl">Sign in to Meateka</h2><p className="mt-3 text-sm leading-6 text-[#85869a]">Enter your details to continue to your content intelligence dashboard.</p></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label htmlFor="email" className="text-xs font-bold text-[#3d3e58]">Email address</label><div className="relative mt-2"><Mail size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a2a3b7]" /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-xl border border-[#dfdfea] bg-[#fcfcfe] pl-11 pr-4 text-sm text-[#20213c] outline-none transition focus:border-[#7669d8] focus:bg-white focus:ring-4 focus:ring-[#7669d8]/10" required /></div></div>
              <div><div className="flex items-center justify-between"><label htmlFor="password" className="text-xs font-bold text-[#3d3e58]">Password</label><button type="button" onClick={() => setError("Password reset is not configured yet. Contact your administrator for help.")} className="text-xs font-semibold text-[#7669d8] transition hover:text-[#5748c9]">Forgot password?</button></div><div className="relative mt-2"><LockKeyhole size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a2a3b7]" /><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[#dfdfea] bg-[#fcfcfe] pl-11 pr-4 text-sm text-[#20213c] outline-none transition focus:border-[#7669d8] focus:bg-white focus:ring-4 focus:ring-[#7669d8]/10" required /></div></div>
              {error && <p role="alert" className="rounded-lg bg-[#fff0f1] px-3 py-2 text-sm font-medium text-[#c2415b]">{error}</p>}
              <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6d5ce7] text-sm font-bold text-white shadow-[0_12px_24px_rgba(109,92,231,0.22)] transition hover:bg-[#5948d6] focus:outline-none focus:ring-4 focus:ring-[#7669d8]/20">Log in <ArrowRight size={17} /></button>
            </form>
            <div className="my-8 flex items-center gap-3 text-[11px] text-[#b1b1c0]"><span className="h-px flex-1 bg-[#ecebf2]" />or<span className="h-px flex-1 bg-[#ecebf2]" /></div>
            <div className="grid gap-3">
              <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dfdfea] bg-white text-sm font-bold text-[#20213c] transition hover:-translate-y-0.5 hover:border-[#c9c3f3] hover:bg-[#faf9ff] disabled:cursor-wait disabled:opacity-70"><FcGoogle aria-hidden="true" size={19} />{googleLoading ? "Connecting to Google..." : "Continue with Google"}</button>
              
            </div>
            <p className="mt-7 text-center text-sm text-[#85869a]">Don&apos;t have an account? <Link to="/register" className="font-bold text-[#7669d8] hover:text-[#5748c9]">Sign Up</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
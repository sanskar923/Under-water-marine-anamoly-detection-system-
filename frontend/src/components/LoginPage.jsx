import React, { useEffect, useRef, useState } from "react";
import { Waves, Fish, Sliders, Users, User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onLogin, onClose, onNavigateAdminLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const bgVideoRef = useRef(null);

  const handleGoToAdminLogin = () => {
    if (onNavigateAdminLogin) {
      onNavigateAdminLogin();
    } else {
      window.history.pushState({}, "", "/admin/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.defaultMuted = true;
      bgVideoRef.current.muted = true;
      bgVideoRef.current.play().catch((err) => {
        console.warn("Autoplay interaction catch:", err);
      });
    }
  }, []);

  const handleStandardLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const userIdentifier = email.trim() || "Operator_01";
    setTimeout(() => {
      localStorage.setItem(
        "aquascan_auth",
        JSON.stringify({
          user: userIdentifier,
          role: "Duty Hydrographer",
          authType: "Credentials",
        })
      );
      setLoading(false);
      onLogin(userIdentifier, "DUTY_HYDROGRAPHER");
    }, 500);
  };

  const handleInstantDemo = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(
        "aquascan_auth",
        JSON.stringify({
          user: "CDR. K. VERMA",
          role: "Fleet Hydrographer",
          authType: "Demo Bypass",
        })
      );
      setLoading(false);
      onLogin("CDR. K. VERMA", "FLEET_COMMANDER");
    }, 400);
  };

  const handleOAuthLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      const oAuthUser = `Hydro_User_${provider.replace(/\s+/g, "_")}`;
      localStorage.setItem(
        "aquascan_auth",
        JSON.stringify({
          user: oAuthUser,
          role: "Verified Operator",
          authType: provider,
        })
      );
      setLoading(false);
      onLogin(oAuthUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-[#020d1e] text-slate-100 font-sans select-none">
      {/* Autoplaying Subsea Video Background Layer */}
      <video
        ref={bgVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-35 z-0 pointer-events-none filter brightness-95 contrast-105"
      >
        <source src="/auv_scroll_cinematic.mp4" type="video/mp4" />
        <source src="/auv_loop.mp4" type="video/mp4" />
      </video>

      {/* Deep Blue Ambient Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021024]/70 via-transparent to-[#020d1e] z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#020d1e_85%)] z-[1] pointer-events-none" />

      {/* 1. TOP HEADER BAR */}
      <header className="relative z-10 w-full px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
        {/* Left: Brand badge with blue manta/wave logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Waves className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white">AQUASCAN</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                AI
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-200/70 uppercase">
              EXPLORE. ANALYZE. CONNECT.
            </span>
          </div>
        </div>

        {/* Right: Quick Admin Login Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoToAdminLogin}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
            title="Switch to Fleet Command & Root Administrator Gateway"
          >
            <span>🛡️</span>
            <span>ADMIN LOGIN</span>
          </button>
        </div>
      </header>

      {/* 2. CENTER SECTION: SPLIT ASYMMETRIC GLASS LAYOUT */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* LEFT PANEL (Span 7 Cols): Frosted Glass Container + Defense Baseline */}
        <div className="lg:col-span-7 flex flex-col space-y-6 max-w-xl">
          {/* 1. Frosted Quote Card */}
          <div className="bg-[#061226]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Quote */}
            <blockquote className="text-white text-2xl font-medium leading-relaxed italic">
              “The ocean is a world of wonder, holding secrets of our planet’s earliest dawn and future destiny.”
            </blockquote>
          </div>

          {/* 2. Maritime Defense Baseline Lockup (Positioned directly below the card) */}
          <div className="px-2 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
                INDIAN MARITIME DEFENSE & HYDROGRAPHIC ENCLAVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Subsea Acoustic Imaging & Benthic Survey Console. Configured for coastal clearance and automated marine hazard verification.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (Span 5 Cols): Floating Login Card */}
        <div className="lg:col-span-5 w-full">
          <div className="w-full max-w-md mx-auto bg-[#08152e]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
            {/* Avatar Icon: Glowing blue circle with white A logo */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-4">
              A
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-xs text-slate-300 mb-6">
              Sign in to access oceanographic telemetry & subsea data
            </p>

            {/* Form Inputs */}
            <form onSubmit={handleStandardLogin} className="w-full space-y-3.5 text-left relative">
              {/* Subtle Loading Spinner Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-[#08152e]/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-cyan-300 tracking-wider animate-pulse">
                    [AUTHENTICATING ENCLAVE CREDENTIALS...]
                  </span>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username or Email"
                  className="w-full bg-white text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium disabled:opacity-75"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white text-slate-900 rounded-xl pl-10 pr-11 py-3 text-sm placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium disabled:opacity-75"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Meta Row: Remember me + Forgot Password? */}
              <div className="text-xs text-slate-300 flex items-center justify-between w-full py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={loading}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-cyan-300 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-sm mt-2 cursor-pointer active:scale-[0.99] shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>

              {/* Quick Demo Bypass */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleInstantDemo}
                  className="text-xs text-cyan-300 hover:text-cyan-200 cursor-pointer font-medium transition-colors disabled:opacity-50"
                >
                  ⚡ Continue as Evaluator (Instant Access) →
                </button>
              </div>

              {/* Divider: OR */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-mono">OR</span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              {/* Social OAuth Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleOAuthLogin("Google")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleOAuthLogin("Email Workspace")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Continue with Email</span>
                </button>
              </div>

              {/* Signup Link */}
              <div className="text-xs text-slate-300 pt-2 text-center">
                Don't have an account?{" "}
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault();
                    handleInstantDemo();
                  }}
                  className="text-cyan-300 font-semibold hover:underline"
                >
                  Sign Up
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FOOTER FEATURE TRIO & COPYRIGHT */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#020d1e]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
          {/* Col 1 */}
          <div className="flex flex-col items-center gap-1.5 p-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1">
              <Fish className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white">Discover Marine Life</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">
              Explore amazing aquatic species and seafloor soundings in high fidelity.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col items-center gap-1.5 p-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white">Stay Relaxed</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">
              Relax with the peaceful beauty and autonomous telemetry of subsea worlds.
            </p>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col items-center gap-1.5 p-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white">Join Our Community</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">
              Connect with hydrographers, marine researchers, and ocean lovers worldwide.
            </p>
          </div>
        </div>

        {/* Legal line */}
        <div className="text-[11px] font-mono text-slate-500 text-center py-3 border-t border-white/5">
          © 2026 AquaScan AI Technologies Inc. All rights reserved. Privacy Policy • Terms of Service • Oceanographic Sensor API
        </div>
      </footer>
    </div>
  );
}


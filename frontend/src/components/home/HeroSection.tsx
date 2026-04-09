import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Zap, Shield, ArrowRight, TrendingUp,
  Code2, Image, FileText, FileType2, Lock, RefreshCw, Globe, Palette,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTools } from "@/data/toolCategories";

const ORBS = [
  { icon: Code2,     color: "#22d3ee", bg: "rgba(34,211,238,0.15)",  top: "14%", left: "5%",   size: 56, delay: 0    },
  { icon: Image,     color: "#a78bfa", bg: "rgba(167,139,250,0.15)", top: "38%", left: "2%",   size: 64, delay: 0.15 },
  { icon: FileType2, color: "#fb923c", bg: "rgba(251,146,60,0.15)",  top: "62%", left: "6%",   size: 56, delay: 0.3  },
  { icon: FileText,  color: "#f87171", bg: "rgba(248,113,113,0.15)", top: "14%", right: "5%",  size: 60, delay: 0.1  },
  { icon: Lock,      color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  top: "40%", right: "2%",  size: 56, delay: 0.25 },
  { icon: Globe,     color: "#4ade80", bg: "rgba(74,222,128,0.15)",  top: "65%", right: "7%",  size: 52, delay: 0.4  },
];

const FEATURES = [
  { icon: Zap,      title: "Lightning Fast",  sub: "Instant results, no waiting"         },
  { icon: Shield,   title: "Privacy First",   sub: "Your data never leaves your browser" },
  { icon: Globe,    title: "Works Offline",   sub: "Many tools work without internet"    },
  { icon: Sparkles, title: "Always Free",     sub: "Free forever, no hidden costs"       },
];

const CATEGORIES = [
  { icon: Code2,      label: "Developer", count: "25+ tools", color: "#22d3ee" },
  { icon: Image,      label: "Image",     count: "20+ tools", color: "#a78bfa" },
  { icon: FileType2,  label: "Text",      count: "15+ tools", color: "#fb923c" },
  { icon: FileText,   label: "PDF",       count: "10+ tools", color: "#f87171" },
  { icon: Lock,       label: "Security",  count: "10+ tools", color: "#38bdf8" },
  { icon: RefreshCw,  label: "Converter", count: "15+ tools", color: "#facc15" },
  { icon: TrendingUp, label: "SEO",       count: "8+ tools",  color: "#34d399" },
  { icon: Palette,    label: "Design",    count: "6+ tools",  color: "#f472b6" },
];

const STATS = [
  { icon: Shield,     value: "100%",  label: "Privacy Safe"   },
  { icon: Sparkles,   value: "Zero",  label: "Ads or Pop-ups" },
  { icon: TrendingUp, value: "10K+",  label: "Daily Users"    },
  { icon: TrendingUp, value: "100M+", label: "Total Users"    },
];

/* LOGOS removed */

const FloatingOrb = ({
  icon: Icon, color, bg, top, left, right, size, delay,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties; size?: string | number }>;
  color: string; bg: string; top?: string; left?: string; right?: string; size: number; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6, type: "spring", stiffness: 80 }}
    style={{ position: "absolute", top, left, right, zIndex: 1 }}
    className="hero-orb"
  >
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        width: size, height: size,
        background: bg,
        border: `1.5px solid ${color}40`,
        borderRadius: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
        boxShadow: `0 0 24px ${color}30`,
      }}
    >
      <Icon style={{ color }} size={Math.round(size * 0.42)} />
    </motion.div>
  </motion.div>
);

const HeroSection = () => {
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof getAllTools>>([]);
  const [showResults, setShowResults]     = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate  = useNavigate();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSelectedIndex(-1);
    if (q.length >= 2) {
      const r = getAllTools().filter(
        (t) => t.name.toLowerCase().includes(q.toLowerCase()) ||
               t.description.toLowerCase().includes(q.toLowerCase()),
      );
      setSearchResults(r);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectTool = (path: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || !searchResults.length) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, Math.min(searchResults.length - 1, 5))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Enter" && selectedIndex >= 0) { e.preventDefault(); handleSelectTool(searchResults[selectedIndex].path); }
    else if (e.key === "Escape") setShowResults(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const quickTools = [
    { name: "JSON Formatter",     path: "/json-formatter"     },
    { name: "QR Code Generator",   path: "/qr-code-generator"   },
    { name: "PDF to Word",        path: "/pdf-to-word"        }
  ];

  return (
    <div style={{ background: "#080d18", minHeight: "100vh", fontFamily: "'Sora','DM Sans',system-ui,sans-serif", color: "#e2e8f0", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gradient-text {
          background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Search ── */
        .search-wrapper { position: relative; z-index: 200; max-width: 640px; margin: 0 auto; width: 100%; }

        .search-box {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.055);
          border: 1.5px solid rgba(255,255,255,0.11);
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          width: 100%;
        }
        /* ✅ Fix: no default browser outline — clean teal ring only */
        .search-box:focus-within {
          background: rgba(255,255,255,0.07);
          border-color: rgba(45,212,191,0.5);
          box-shadow: 0 0 0 3px rgba(45,212,191,0.13), 0 8px 32px rgba(0,0,0,0.3);
        }
        .search-input {
          flex: 1; min-width: 0;
          background: none; border: none;
          outline: none !important;
          -webkit-appearance: none;
          box-shadow: none !important;
          padding: 15px 12px;
          font-size: 14px; color: #e2e8f0; font-family: inherit;
        }
        .search-input::placeholder { color: rgba(226,232,240,0.36); }
        .search-icon-left { color: rgba(226,232,240,0.36); margin-left: 16px; flex-shrink: 0; }
        .search-clear-btn {
          background: none; border: none;
          color: rgba(226,232,240,0.38); cursor: pointer;
          padding: 0 10px; font-size: 16px; line-height: 1; flex-shrink: 0;
          transition: color 0.15s;
        }
        .search-clear-btn:hover { color: rgba(226,232,240,0.7); }
        .search-submit-btn {
          margin: 5px; padding: 10px 22px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #0d9488, #0891b2);
          box-shadow: 0 0 22px rgba(13,148,136,0.38), 0 3px 12px rgba(0,0,0,0.3);
          color: #fff; font-weight: 700; font-size: 14px;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .search-submit-btn:hover {
          box-shadow: 0 0 32px rgba(13,148,136,0.58), 0 4px 18px rgba(0,0,0,0.4);
          transform: translateY(-1px);
        }

        /* ── Dropdown ── */
        .search-dropdown {
          position: absolute; left: 0; right: 0; top: calc(100% + 10px); z-index: 9999;
          background: #0d1627;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 28px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,212,191,0.07);
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 14px;
          width: 100%; padding: 13px 18px;
          background: transparent; border: none;
          color: #e2e8f0; cursor: pointer; font-family: inherit; text-align: left;
          transition: background 0.12s;
        }
        .dropdown-item:hover, .dropdown-item.active { background: rgba(45,212,191,0.07); }

        /* ── Pulse dot ── */
        .pulse-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2dd4bf; box-shadow: 0 0 8px #2dd4bf; flex-shrink: 0;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.42; transform:scale(1.45); }
        }

        /* ── Pill buttons ── */
        .pill {
          background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 5px 14px;
          font-size: 12.5px; color: rgba(226,232,240,0.7);
          cursor: pointer; font-family: inherit; white-space: nowrap;
          transition: all 0.15s;
        }
        .pill:hover { background: rgba(45,212,191,0.12); border-color: rgba(45,212,191,0.32); color: #2dd4bf; }

        /* ── Backgrounds ── */
        .mesh-bg {
          background:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(13,148,136,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 70%, rgba(56,189,248,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 100%, rgba(129,140,248,0.08) 0%, transparent 60%);
        }
        .grid-lines {
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Floating orbs: xl only ── */
        .hero-orb { display: none; }
        @media (min-width: 1200px) { .hero-orb { display: flex; } }

        /* ── Feature bar ── */
        .feature-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
        }
        .feature-cell {
          padding: 22px 22px; display: flex; align-items: flex-start; gap: 13px;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .feature-cell:last-child { border-right: none; }

        /* ── Category grid ── */
        .cat-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; }
        .cat-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 18px 10px; text-align: center; cursor: pointer;
          transition: all 0.2s ease;
        }
        .cat-card:hover {
          background: rgba(255,255,255,0.08); border-color: rgba(45,212,191,0.28);
          transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.28);
        }

        /* ── Stat cards ── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .stat-card {
          background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 36px 20px 28px;
          display: flex; flex-direction: column; align-items: center; gap: 13px;
          transition: all 0.22s ease;
        }
        .stat-card:hover {
          background: rgba(45,212,191,0.07); border-color: rgba(45,212,191,0.2);
          transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.35);
        }
        .stat-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(45,212,191,0.14);
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Trust bar ── */
        /* Trust bar removed */

        /* ════ RESPONSIVE ════════════════════════════════════════════════ */

        /* Tablet landscape / small desktop: ≤1024px */
        @media (max-width: 1024px) {
          .cat-grid { grid-template-columns: repeat(4, 1fr); }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-cell { border-right: 1px solid rgba(255,255,255,0.07) !important; }
          .feature-cell:nth-child(2) { border-right: none !important; }
          .feature-cell:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.07); }
          .feature-cell:nth-child(4) { border-top: 1px solid rgba(255,255,255,0.07); border-right: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Tablet portrait: ≤768px */
        @media (max-width: 768px) {
          .hero-section-inner { padding: 64px 20px 52px !important; }
          .section-wrap { padding-left: 20px !important; padding-right: 20px !important; }
          .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .cat-card { padding: 14px 8px; }
          .search-submit-btn .btn-label { display: none; }
          .search-submit-btn { padding: 10px 14px; }
          .hero-h1 { letter-spacing: -0.015em !important; }
        }

        /* Mobile: ≤480px */
        @media (max-width: 480px) {
          .hero-section-inner { padding: 52px 16px 40px !important; }
          .section-wrap { padding-left: 16px !important; padding-right: 16px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .feature-cell { border-right: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
          .feature-cell:first-child { border-top: none !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 7px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; }
          .stat-card { padding: 24px 14px 20px; border-radius: 16px; }
          .search-input { font-size: 13px; padding: 13px 8px; }
          .search-submit-btn { padding: 9px 12px; font-size: 13px; }
          .pill { font-size: 11px; padding: 4px 10px; }
          .popular-row { gap: 6px !important; }
          /* Trust logos removed */
          /* Trust bar removed */
          .badge-pill { font-size: 11.5px !important; padding: 6px 14px !important; }
        }

        /* Large desktop: ≥1440px */
        @media (min-width: 1440px) {
          .hero-content { max-width: 960px !important; }
          .section-max { max-width: 1200px !important; }
        }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="mesh-bg grid-lines" style={{ position: "relative", overflow: "visible" }}>
        <div className="hero-section-inner" style={{ padding: "88px 32px 72px" }}>
          {ORBS.map((o, i) => <FloatingOrb key={i} {...o} />)}

          <div className="hero-content" style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="badge-pill"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.24)",
                borderRadius: 100, padding: "7px 18px",
                fontSize: 13, fontWeight: 500, color: "#2dd4bf", marginBottom: 28,
              }}
            >
              <span className="pulse-dot" />
              100% Free • No Sign-up Required • Works Offline
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="hero-h1"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: "clamp(36px, 7vw, 78px)",
                fontWeight: 800, lineHeight: 1.08,
                marginBottom: 18, fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              All-in-One Tools.
              <br />
              <span className="gradient-text">Infinite Possibilities.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{
                fontSize: "clamp(14px, 2vw, 17px)",
                color: "rgba(226,232,240,0.6)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.72,
              }}
            >
              100+ free tools to simplify your work. Fast, private, and always available.
              Built for{" "}
              <strong style={{ color: "#e2e8f0", fontWeight: 700 }}>developers, creators, students</strong>,
              {" "}and everyday productivity.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              ref={searchRef}
              className="search-wrapper"
            >
              <div className="search-box">
                <Search size={17} className="search-icon-left" />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search tools… (e.g., Background Remover, ZIP Extract)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => { setSearchQuery(""); setShowResults(false); }}>✕</button>
                )}
                <button className="search-submit-btn">
                  <Search size={14} />
                  <span className="btn-label">Search</span>
                </button>
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    className="search-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                  >
                    {searchResults.slice(0, 6).map((tool, i) => (
                      <button
                        key={tool.id}
                        className={`dropdown-item${selectedIndex === i ? " active" : ""}`}
                        onClick={() => handleSelectTool(tool.path)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        style={{ borderBottom: i < Math.min(searchResults.length, 6) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                      >
                        <div style={{
                          width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                          background: "rgba(45,212,191,0.11)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Search size={14} style={{ color: "#2dd4bf" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{tool.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(226,232,240,0.42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tool.description}
                          </div>
                        </div>
                        <ArrowRight size={13} style={{ color: "rgba(226,232,240,0.26)", flexShrink: 0 }} />
                      </button>
                    ))}
                    {searchResults.length > 6 && (
                      <div style={{ padding: "10px 18px", textAlign: "center", fontSize: 12.5, color: "rgba(226,232,240,0.36)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        +{searchResults.length - 6} more results
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Popular pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="popular-row"
              style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <span style={{ fontSize: 13, color: "rgba(226,232,240,0.4)", flexShrink: 0 }}>Popular:</span>
              {quickTools.map((t) => (
                <button key={t.path} className="pill" onClick={() => navigate(t.path)}>{t.name}</button>
              ))}
            </motion.div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, #080d18, transparent)", pointerEvents: "none" }} />
      </section>

      {/* ══ FEATURE BAR ════════════════════════════════════════════════ */}
      <section className="section-wrap" style={{ padding: "0 32px 44px" }}>
        <div className="section-max" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="feature-cell">
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "rgba(45,212,191,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={17} style={{ color: "#2dd4bf" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "rgba(226,232,240,0.47)", lineHeight: 1.45 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════ */}
      <section
        className="section-wrap"
        style={{ padding: "44px 32px 88px", background: "linear-gradient(180deg, #080d18 0%, #0b1322 55%, #f1f5f9 100%)" }}
      >
        <div className="section-max" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="stats-grid">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
              >
                <div className="stat-icon">
                  <Icon size={22} style={{ color: "#2dd4bf" }} />
                </div>
                <div style={{
                  fontSize: "clamp(30px, 4vw, 46px)",
                  fontWeight: 800, color: "#e2e8f0",
                  fontFamily: "'Sora', sans-serif", lineHeight: 1, letterSpacing: "-0.025em",
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 13.5, color: "rgba(226,232,240,0.46)", fontWeight: 500 }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
export default HeroSection;
import { motion } from "framer-motion";
import { Search, Sparkles, Zap, Shield, ArrowRight, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTools } from "@/data/toolCategories";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof getAllTools>>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    if (query.length >= 2) {
      const results = getAllTools().filter(
        tool =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
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
    if (!showResults || searchResults.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < Math.min(searchResults.length - 1, 5) ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectTool(searchResults[selectedIndex].path);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickTools = [
    { name: "QR Code", path: "/tools/image/qr-generator" },
    { name: "Password", path: "/tools/security/password-generator" },
    { name: "JSON", path: "/tools/dev/json-formatter" },
  ];

  return (
    <section className="hero-section relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative py-24 md:py-36 lg:py-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary-foreground backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            100% Free • No Sign-up Required • Works Offline
          </motion.div>

          {/* Main Title */}
          <h1 className="text-5xl font-extrabold tracking-tight text-primary-foreground md:text-7xl lg:text-8xl">
            Your Ultimate
            <span className="relative block">
              <span className="gradient-text">Utility Toolbox</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 origin-left rounded-full bg-gradient-to-r from-primary to-primary/50"
              />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-primary-foreground/70 md:text-xl lg:text-2xl"
          >
            50+ powerful tools for images, text, security, and development. 
            <span className="font-medium text-primary-foreground"> Fast, private, and browser-based.</span>
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            ref={searchRef}
            className="relative mx-auto mt-12 max-w-2xl"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/50 to-primary/30 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
              <div className="relative flex items-center">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tools... (e.g., QR code, password generator, image compressor)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-2xl border-0 bg-background py-5 pl-14 pr-6 text-foreground shadow-2xl ring-1 ring-border/50 transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setShowResults(false); }}
                    className="absolute right-5 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              >
                <div className="p-2">
                  {searchResults.slice(0, 6).map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all ${
                        selectedIndex === index ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-card-foreground truncate">{tool.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
                {searchResults.length > 6 && (
                  <div className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
                    +{searchResults.length - 6} more results
                  </div>
                )}
              </motion.div>
            )}

            {/* No Results */}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-0 right-0 top-full z-50 mt-3 rounded-2xl border border-border bg-card p-6 text-center shadow-2xl"
              >
                <p className="text-muted-foreground">No tools found for "{searchQuery}"</p>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm"
          >
            <span className="text-primary-foreground/50">Popular:</span>
            {quickTools.map((tool) => (
              <button
                key={tool.path}
                onClick={() => navigate(tool.path)}
                className="rounded-full bg-primary-foreground/10 px-4 py-1.5 text-primary-foreground/80 transition-all hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                {tool.name}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
          >
            <StatCard icon={Zap} value="50+" label="Free Tools" delay={0.7} />
            <StatCard icon={Shield} value="100%" label="Privacy Safe" delay={0.8} />
            <StatCard icon={Sparkles} value="Zero" label="Ads or Pop-ups" delay={0.9} />
            <StatCard icon={TrendingUp} value="10K+" label="Daily Users" delay={1.0} />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  delay 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  value: string; 
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group relative rounded-2xl border border-primary/10 bg-primary/5 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-primary/10"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-3xl font-bold text-primary-foreground">{value}</span>
      <span className="text-sm text-primary-foreground/60">{label}</span>
    </div>
  </motion.div>
);

export default HeroSection;

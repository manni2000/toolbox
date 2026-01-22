import { motion } from "framer-motion";
import { Search, Sparkles, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTools } from "@/data/toolCategories";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof getAllTools>>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
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

  return (
    <section className="hero-section relative overflow-hidden py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <span>100% Free • No Sign-up Required</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
            Your Daily
            <span className="block gradient-text">Utility Toolbox</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70 md:text-xl">
            50+ powerful tools for images, text, security, and more. Fast, free, and works right in your browser.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for tools... (e.g., QR code, password)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="w-full rounded-2xl border-0 bg-background py-4 pl-12 pr-4 text-foreground shadow-lg ring-1 ring-border transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg"
              >
                {searchResults.slice(0, 5).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.path)}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium text-card-foreground">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground">50+</span>
              <span className="text-sm text-primary-foreground/60">Free Tools</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground">100%</span>
              <span className="text-sm text-primary-foreground/60">Privacy Safe</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground">0</span>
              <span className="text-sm text-primary-foreground/60">Ads or Pop-ups</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

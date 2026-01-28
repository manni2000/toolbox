import { Link, useLocation } from "react-router-dom";
import { Wrench, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toolCategories } from "@/data/toolCategories";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background">
      <div className="container">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Tool<span className="text-primary">Box</span>
              </span>
              <span className="hidden text-[10px] uppercase tracking-widest text-muted-foreground lg:block">
                Free Online Tools
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" active={isActive("/")}>Home</NavLink>
            
            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname.startsWith("/category") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                Categories
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategories ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 top-full pt-2 -translate-x-1/2"
                  >
                    <div className="grid w-[680px] grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-3 shadow-xl">
                      {toolCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                          >
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `hsl(${category.color} / 0.12)` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: `hsl(${category.color})` }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{category.name}</p>
                              <p className="text-xs text-muted-foreground">{category.tools.length} tools</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/categories" active={isActive("/categories")}>All Tools</NavLink>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              to="/categories"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Explore Tools
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden hover:bg-blue-900 hover:border-blue-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5 text-blue-600" /> : <Menu className="h-5 w-5 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <div className="fixed left-0 right-0 top-16 z-50 h-[calc(100vh-4rem)] overflow-hidden bg-background shadow-2xl">
              <nav className="flex h-full flex-col">
                {/* Fixed Header Section */}
                <div className="flex-shrink-0 border-b border-border bg-background">
                  <div className="container flex flex-col gap-1 py-4">
                    <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink to="/categories" onClick={() => setIsMenuOpen(false)}>All Tools</MobileNavLink>
                  </div>
                </div>
                
                {/* Scrollable Categories Section */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <div className="container py-4">
                    <div className="mb-4 px-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Categories</p>
                    </div>
                    <div className="space-y-1">
                      {toolCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent/50"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <span className="block text-sm font-medium">{category.name}</span>
                              <span className="text-xs text-muted-foreground">{category.tools.length} tools</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Fixed Bottom Section */}
                <div className="flex-shrink-0 border-t border-border bg-background">
                  <div className="container py-4">
                    <Link
                      to="/categories"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:bg-primary/95"
                    >
                      Explore All Tools
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLink = ({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active 
        ? "text-primary" 
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) => (
  <Link
    to={to}
    onClick={onClick}
    className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
  >
    {children}
  </Link>
);

export default Header;

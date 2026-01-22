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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
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
                    className="absolute left-0 top-full pt-2"
                  >
                    <div className="grid w-[500px] grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-3 shadow-xl">
                      {toolCategories.slice(0, 10).map((category) => {
                        const Icon = category.icon;
                        return (
                          <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
                          >
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg"
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <nav className="container flex flex-col gap-1 py-4">
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/categories" onClick={() => setIsMenuOpen(false)}>All Tools</MobileNavLink>
              <div className="my-2 border-t border-border" />
              <p className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">Categories</p>
              {toolCategories.slice(0, 6).map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Link>
                );
              })}
            </nav>
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

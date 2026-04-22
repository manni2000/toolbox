import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Wrench,
  FileImage,
  FileText,
  Shield,
  Calculator,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Compass,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Referrer:",
      document.referrer
    );
  }, [location.pathname]);

  const popularTools = [
    {
      icon: FileImage,
      title: "Image Tools",
      path: "/category/image",
      description: "Compress, convert, resize images with ease",
    },
    {
      icon: FileText,
      title: "PDF Tools",
      path: "/category/pdf",
      description: "Merge, split, and convert PDF documents",
    },
    {
      icon: Shield,
      title: "Security Tools",
      path: "/category/security",
      description: "Generate passwords, hashes, and encryption",
    },
    {
      icon: Calculator,
      title: "Finance Tools",
      path: "/category/finance",
      description: "Calculate EMI, GST, and financial metrics",
    },
  ];

  const quickLinks = [
    { label: "Home", path: "/", icon: Home, description: "Back to dashboard" },
    { label: "All Tools", path: "/categories", icon: Wrench, description: "Explore 100+ tools" },
    { label: "API Docs", path: "/api-docs", icon: HelpCircle, description: "Developer resources" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-20% -top-20% h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                delay: 1,
              }}
              className="absolute -bottom-20% -right-20% h-[500px] w-[500px] rounded-full bg-destructive/10 blur-3xl"
            />
          </div>

          <div className="container relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-center justify-center gap-4 md:gap-6"
                  >
                    <span className="text-[100px] font-bold leading-none text-primary/30 md:text-[150px]">
                      4
                    </span>
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-2xl md:h-36 md:w-36"
                    >
                      <AlertTriangle className="h-14 w-14 text-destructive md:h-18 md:w-18" />
                    </motion.div>
                    <span className="text-[100px] font-bold leading-none text-primary/30 md:text-[150px]">
                      4
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
              >
                Page Not Found
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground md:text-xl"
              >
                The page you're looking for doesn't exist or has been moved to a new location.
                Let us help you get back on track.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <Link
                  to="/categories"
                  className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                >
                  <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Browse All Tools
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="border-y border-border bg-muted/40 py-16 backdrop-blur-sm">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-2xl font-bold text-foreground">Quick Navigation</h2>
                <p className="text-muted-foreground">Find what you're looking for</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.path}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.path}
                        className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                          <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-foreground">{link.label}</span>
                          <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Popular Tools Section */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="mb-12 text-center">
                <div className="mb-4 flex justify-center">
                  <Compass className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-3 text-3xl font-bold text-foreground">Explore Popular Tools</h2>
                <p className="text-muted-foreground">Discover our most used and trusted tools</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {popularTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={tool.path}
                        className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-xl"
                      >
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-colors group-hover:from-primary group-hover:to-primary/80">
                          <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{tool.title}</h3>
                        <p className="flex-1 text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          <Zap className="h-4 w-4" />
                          Explore Now
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/50 to-background py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mx-auto max-w-2xl rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-8 text-center shadow-lg"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="mb-4 flex justify-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
              <h2 className="mb-3 text-2xl font-bold text-foreground">Ready to Get Started?</h2>
              <p className="mb-6 text-muted-foreground">
                Explore our comprehensive collection of free online tools designed to simplify your daily tasks.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
              >
                <Home className="h-4 w-4" />
                Return to Homepage
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

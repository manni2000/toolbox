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
  Mail,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 errors for monitoring broken links
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
      description: "Compress, convert, resize images",
    },
    {
      icon: FileText,
      title: "PDF Tools",
      path: "/category/pdf",
      description: "Merge, split, convert PDFs",
    },
    {
      icon: Shield,
      title: "Security Tools",
      path: "/category/security",
      description: "Passwords, hashes, encryption",
    },
    {
      icon: Calculator,
      title: "Finance Tools",
      path: "/category/finance",
      description: "EMI, GST, calculators",
    },
  ];

  const quickLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "All Tools", path: "/categories", icon: Wrench },
    { label: "API Docs", path: "/api-docs", icon: HelpCircle },
    { label: "Contact Us", path: "/about", icon: Mail },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-destructive/10 blur-3xl" />
          </div>
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
            >
              {/* 404 Code Display */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <span className="text-[120px] font-bold leading-none text-primary/20 md:text-[180px]">
                      4
                    </span>
                    <div className="mx-4 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 md:h-32 md:w-32">
                      <AlertTriangle className="h-12 w-12 text-destructive md:h-16 md:w-16" />
                    </div>
                    <span className="text-[120px] font-bold leading-none text-primary/20 md:text-[180px]">
                      4
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Page Not Found
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
                Don't worry – our site is working fine! This is just a missing
                page.
              </p>

              {/* Search Suggestion */}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/categories"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Browse All Tools
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-8 text-center text-xl font-semibold">
                Quick Navigation
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Popular Tools Section */}
        <section className="py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold">Popular Tool Categories</h2>
                <p className="mt-2 text-muted-foreground">
                  Try one of our most used tools
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {popularTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Link
                        to={tool.path}
                        className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                          <Icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
                        </div>
                        <h3 className="mb-2 font-semibold">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Help Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center"
            >
              <HelpCircle className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h2 className="mb-2 text-xl font-bold">Need Help?</h2>
              <p className="mb-6 text-muted-foreground">
                If you believe this page should exist or found a broken link,
                please let us know. Your feedback helps us improve.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/about" className="btn-secondary">
                  Report a Bug
                </Link>
                <Link to="/" className="btn-primary">
                  Return to Homepage
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

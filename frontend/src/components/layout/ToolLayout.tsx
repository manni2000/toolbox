import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import SEOHelmet from "@/components/SEOHelmet";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  categoryPath: string;
  toolSlug?: string;
  children: ReactNode;
}

const ToolLayout = ({ title, description, category, categoryPath, toolSlug, children }: ToolLayoutProps) => {
  const location = useLocation();
  
  return (
    <>
      <SEOHelmet
        title={title}
        description={description}
        category={category}
        toolSlug={toolSlug}
        url={`https://www.dailytools247.app${location.pathname}`}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {/* Breadcrumb */}
          <div className="border-b border-border bg-muted/30">
            <div className="container py-4">
              <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto">
                <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground whitespace-nowrap">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Link to={categoryPath} className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                  {category}
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground whitespace-nowrap">{title}</span>
              </nav>
            </div>
          </div>

          {/* Tool Header */}
          <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
            <div className="container py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
                <p className="mt-2 text-base sm:text-lg text-muted-foreground">{description}</p>
              </motion.div>
            </div>
          </section>

          {/* Tool Content */}
          <section className="py-6 sm:py-8">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ToolLayout;

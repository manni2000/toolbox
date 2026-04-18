import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import PopularTools from "@/components/home/PopularTools";
import CategoryGrid from "@/components/home/CategoryGrid";

// Lazy load below-the-fold components
const BlogHighlights = lazy(() => import("@/components/home/BlogHighlights"));
const HowItWorks = lazy(() => import("@/components/home/HowItWorks"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const TrustSection = lazy(() => import("@/components/home/TrustSection"));
const ContactSection = lazy(() => import("@/components/home/ContactSection"));

const PageLoader = () => (
  <div className="flex h-32 items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        {/* <PopularTools /> */}
        <CategoryGrid />
        <Suspense fallback={<PageLoader />}>
          <BlogHighlights />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <TrustSection />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

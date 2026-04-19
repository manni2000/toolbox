import { motion } from "framer-motion";
import { CalendarDays, Clock3, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHelmet from "@/components/SEOHelmet";
import { blogPosts } from "@/data/blogPosts";
import { api } from "@/lib/api-client";

const categoryOrder = [
  "PDF Tools",
  "Image Tools",
  "Productivity",
  "SEO Tools",
  "Developer Tools",
  "Security Tools",
  "Text Tools",
  "Savings",
];

const sortBlogPosts = (posts: typeof blogPosts) => {
  return [...posts].sort((left, right) => {
    const leftCategoryIndex = categoryOrder.indexOf(left.category);
    const rightCategoryIndex = categoryOrder.indexOf(right.category);

    const normalizedLeftCategoryIndex = leftCategoryIndex === -1 ? categoryOrder.length : leftCategoryIndex;
    const normalizedRightCategoryIndex = rightCategoryIndex === -1 ? categoryOrder.length : rightCategoryIndex;

    if (normalizedLeftCategoryIndex !== normalizedRightCategoryIndex) {
      return normalizedLeftCategoryIndex - normalizedRightCategoryIndex;
    }

    return new Date(right.publishedDate).getTime() - new Date(left.publishedDate).getTime();
  });
};

const BlogListPage = () => {
  const [posts, setPosts] = useState(() => sortBlogPosts(blogPosts));
  const [loading, setLoading] = useState(true);

  const mergeBlogPosts = (apiPosts: typeof blogPosts) => {
    const merged = new Map(blogPosts.map((post) => [post.slug, post] as const));

    apiPosts.forEach((post) => {
      merged.set(post.slug, post);
    });

    return sortBlogPosts(Array.from(merged.values()));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.getBlogPosts(1, 100);
        if (response.success && response.result.posts) {
          setPosts(mergeBlogPosts(response.result.posts));
        }
      } catch (error) {
        // console.warn('Failed to fetch blog posts from API, using local data:', error);
        // Fallback to local data is already set
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.filter(p => p.slug !== featuredPost.slug);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SEOHelmet
        title="Blog - Free Online Tools, Guides, and Tutorials"
        description="Read practical blog guides on free online tools, converters, developer utilities, and productivity workflows for 2026."
        keywords={["free online tools blog", "best tools 2026", "online converter free", "no signup required tools"]}
        canonical="https://www.dailytools247.app/blogs"
      />
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-sky-500/5 py-12 sm:py-14 md:py-24">
          <div className="absolute inset-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          </div>
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Expert Guides for Faster Workflows
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Dailytools247 Blog
              </h1>
              <p className="mt-5 text-base text-muted-foreground md:text-lg">
                Actionable tutorials, high-intent SEO guides, and curated tool stacks to help you save time every day.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/3 p-5 shadow-lg sm:p-6 md:p-10"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Featured</p>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-center">
                <div className="order-2 md:order-1 min-w-0">
                  <h2 className="text-2xl font-bold md:text-3xl">{featuredPost.title}</h2>
                  <p className="mt-4 text-muted-foreground">{featuredPost.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {featuredPost.publishedDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Link
                    to={`/blogs/${featuredPost.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Read Featured Guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="order-1 md:order-2 overflow-hidden rounded-2xl border border-border">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="aspect-[16/10] w-full object-cover md:h-full"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.src = "/dailytools247.webp";
                    }}
                  />
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {otherPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={`/blogs/${post.slug}`} className="block">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="aspect-[16/10] w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.src = "/dailytools247.webp";
                      }}
                    />
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                      <h2 className="mt-2 text-xl font-semibold leading-tight">{post.title}</h2>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.publishedDate}</span>
                        <span>{post.readTime}</span>
                      </div>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogListPage;

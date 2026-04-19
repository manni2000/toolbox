import { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SEOHelmet from "../../components/SEOHelmet";
import NotFound from "../../pages/NotFound";
import { blogPosts, getBlogPostBySlug, type BlogPost } from "../../data/blogPosts";
import { blogEnhancements } from "../../data/blogEnhancements";
import { api } from "../../lib/api-client";

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        // Always prefer local data first (it has full sections/faqs structure)
        const localPost = getBlogPostBySlug(slug);
        if (localPost) {
          setPost(localPost);
          const allOtherPosts = blogPosts.filter((item) => item.slug !== slug);
          const sameCategoryPosts = allOtherPosts.filter((item) => item.category === localPost.category);
          const otherCategoryPosts = allOtherPosts.filter((item) => item.category !== localPost.category);
          setRelatedPosts([...sameCategoryPosts, ...otherCategoryPosts]);
        } else {
          // Fall back to API only when local data is not available
          const response = await api.getBlogPost(slug);
          if (response.success && response.result.post) {
            const apiPost = response.result.post;
            // API post may lack sections/faqs - provide defaults to prevent crashes
            setPost({
              ...apiPost,
              sections: apiPost.sections || [],
              faqs: apiPost.faqs || [],
              description: apiPost.description || apiPost.excerpt || '',
              keywords: apiPost.keywords || apiPost.tags || [],
              publishedDate: apiPost.publishedDate || apiPost.date || '',
              readTime: apiPost.readTime || '5 min',
              image: apiPost.image || '/dailytools247.webp',
            });
            const allOtherPosts = blogPosts.filter((item) => item.slug !== slug);
            setRelatedPosts(allOtherPosts);
          }
        }
      } catch (error) {
        // console.warn('Failed to load blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (!slug) {
    return <Navigate to="/blogs" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin">⏳</div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const enhancement = blogEnhancements[post.slug];
  const combinedFaqs = enhancement ? [...(post.faqs || []), ...(enhancement.additionalFaqs || [])] : (post.faqs || []);
  const faqs = Array.from(new Map(combinedFaqs.map(faq => [faq.question, faq])).values());

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    image: [`https://www.dailytools247.app${post.image}`],
    mainEntityOfPage: `https://www.dailytools247.app/blogs/${post.slug}`,
    author: {
      "@type": "Organization",
      name: "Dailytools247",
    },
    publisher: {
      "@type": "Organization",
      name: "Dailytools247",
      logo: {
        "@type": "ImageObject",
        url: "https://www.dailytools247.app/dailytools247.webp",
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SEOHelmet
        title={post.title}
        description={post.description}
        keywords={[post.keywords]}
        canonical={`https://www.dailytools247.app/blogs/${post.slug}`}
        ogImage={post.image}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-8 sm:py-10 md:py-14">
          <div className="container">
            <Link
              to="/blogs"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary sm:mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all blogs
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-end"
            >
              <div className="min-w-0">
                <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {post.category}
                </p>
                <h1 className="mt-4 text-3xl font-bold leading-tight text-balance sm:text-4xl md:text-5xl">{post.title}</h1>
                <p className="mt-4 text-base text-muted-foreground md:text-lg">{post.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {post.publishedDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {post.readTime}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={post.image}
                  alt={post.title}
                  className="aspect-[16/10] w-full object-cover xl:h-full"
                  loading="lazy"
                  onError={(event) => {
                    const target = event.currentTarget;
                    target.src = "/dailytools247.webp";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        <article className="py-10 md:py-14">
          <div className="container grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-8">
              {(post.sections || []).map((section, sectionIndex) => (
                <Fragment key={section.heading}>
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: sectionIndex * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8"
                  >
                    <h2 className="text-2xl font-bold">{section.heading}</h2>
                    <div className="mt-4 space-y-4 text-muted-foreground">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.links && section.links.length > 0 && (
                      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <p className="mb-3 text-sm font-semibold text-primary">Recommended Tools</p>
                        <div className="flex flex-wrap gap-2">
                          {section.links.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                            >
                              {link.label}
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.section>

                </Fragment>
              ))}

              {enhancement && (
                <>
                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8">
                    <h2 className="text-2xl font-bold">{enhancement.deepDiveHeading}</h2>
                    <div className="mt-4 space-y-4 text-muted-foreground">
                      {enhancement.deepDiveParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Primary Keyword</p>
                      <p className="mt-1 text-sm text-muted-foreground">{enhancement.mainKeyword}</p>
                      <p className="mt-3 text-sm font-semibold">Long-tail Keywords</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {enhancement.longTailKeywords.map((item) => (
                          <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8">
                    <h2 className="text-2xl font-bold">{enhancement.howToHeading}</h2>
                    <ol className="mt-4 space-y-3 text-muted-foreground">
                      {enhancement.howToSteps.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8">
                    <h2 className="text-2xl font-bold">{enhancement.useCasesHeading}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {enhancement.useCases.map((item) => (
                        <div key={item} className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8">
                    <h2 className="text-2xl font-bold">{enhancement.comparisonHeading}</h2>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[560px] border-collapse text-sm sm:min-w-[640px]">
                        <thead>
                          <tr className="border-b border-border text-left text-foreground">
                            <th className="py-2 pr-3 font-semibold">Tool</th>
                            <th className="py-2 pr-3 font-semibold">Best For</th>
                            <th className="py-2 pr-3 font-semibold">Free</th>
                            <th className="py-2 pr-3 font-semibold">Speed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enhancement.comparisonRows.map((row) => (
                            <tr key={row.tool} className="border-b border-border/60 text-muted-foreground">
                              <td className="py-2 pr-3 font-medium text-foreground">{row.tool}</td>
                              <td className="py-2 pr-3">{row.bestFor}</td>
                              <td className="py-2 pr-3">{row.free}</td>
                              <td className="py-2 pr-3">{row.speed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}

              <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 md:p-8">
                <h2 className="text-2xl font-bold">Take Action Now</h2>
                <p className="mt-3 text-muted-foreground">
                  Move from reading to results. Start with the most relevant tool and complete your task in minutes.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={enhancement?.ctaPath || "/categories"}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {enhancement?.ctaLabel || "Try Tool Now"}
                  </Link>
                  <Link
                    to={enhancement?.secondaryCtaPath || "/blogs"}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {enhancement?.secondaryCtaLabel || "Read More Guides"}
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                <div className="mt-5 divide-y divide-border">
                  {faqs.map((faq) => (
                    <details key={faq.question} className="group py-4">
                      <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:content-none">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Related Articles Section - Full Width */}
              {relatedPosts.length > 0 && (
                <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5 sm:p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">Related Articles</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Continue exploring our guides and tutorials
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {relatedPosts.map((article) => (
                      <motion.div
                        key={article.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group"
                      >
                        <Link
                          to={`/blogs/${article.slug}`}
                          className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
                        >
                          <div className="relative overflow-hidden bg-muted">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              onError={(event) => {
                                const target = event.currentTarget;
                                target.src = "/dailytools247.webp";
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex rounded-full border border-primary/20 bg-primary/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                                {article.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                              {article.description}
                            </p>
                            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {article.publishedDate}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {article.readTime}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      to="/blogs"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View all articles
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
                <h3 className="text-base font-semibold">Sticky Action</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {enhancement?.mainKeyword || "Use free online tools"} now.
                </p>
                <Link
                  to={enhancement?.ctaPath || "/categories"}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {enhancement?.ctaLabel || "Try Tool Now"}
                </Link>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold">Related Articles</h3>
                {relatedPosts.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {relatedPosts.slice(0, 3).map((item) => (
                      <Fragment key={item.slug}>
                        <Link to={`/blogs/${item.slug}`} className="group block">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.readTime}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </Link>
                      </Fragment>
                    ))}
                    {relatedPosts.length > 3 && (
                      <Link
                        to="/blogs"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        View all articles
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No related articles available</p>
                )}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="text-base font-semibold">Explore All Utilities</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse 100+ free tools across PDF, image, developer, SEO, and business workflows.
                </p>
                <Link
                  to="/categories"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open Categories
                </Link>
              </div>
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;

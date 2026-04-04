import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const BlogHighlights = () => {
  const topPosts = blogPosts.slice(0, 3);

  return (
    <section className="border-y border-border bg-gradient-to-b from-muted/30 to-background py-14 md:py-18">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest Guides</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Learn Faster with Expert Blog Tutorials</h2>
          <p className="mt-4 text-muted-foreground">
            Practical guides around free online tools, no-signup workflows, and high-impact productivity stacks.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {topPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={post.image}
                alt={post.title}
                className="h-48 w-full object-cover"
                loading="lazy"
                onError={(event) => {
                  const target = event.currentTarget;
                  target.src = "/dailytools247.png";
                }}
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.publishedDate}
                </div>
                <Link
                  to={`/blogs/${post.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View All Blogs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogHighlights;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Image, FileText, Video, GraduationCap, QrCode, Archive, Sparkles } from "lucide-react";

const popularTools = [
  {
    id: "image-tools",
    name: "Image Tools",
    description: "Compress, convert, resize and edit images easily",
    path: "/category/image",
    icon: Image,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, compress and convert PDF files",
    path: "/category/pdf",
    icon: FileText,
    gradient: "from-red-500 to-orange-500",
    bgGradient: "from-red-500/10 to-orange-500/10",
  },
  {
    id: "video-tools",
    name: "Video Tools",
    description: "Download, trim, convert and edit videos",
    path: "/category/video",
    icon: Video,
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-500/10 to-violet-500/10",
  },
  {
    id: "education-tools",
    name: "Education Tools",
    description: "Calculators, converters and learning utilities",
    path: "/category/education",
    icon: GraduationCap,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    id: "qr-generator",
    name: "QR Code Generator",
    description: "Create QR codes from any URL or text instantly",
    path: "/qr-code-generator",
    icon: QrCode,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    id: "zip-tools",
    name: "Zip Tools",
    description: "Create, extract and manage compressed files",
    path: "/category/zip",
    icon: Archive,
    gradient: "from-amber-500 to-yellow-500",
    bgGradient: "from-amber-500/10 to-yellow-500/10",
  },
];

const PopularTools = () => {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-transparent to-transparent" />
      
      <div className="container relative">
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Most Popular
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold tracking-tight md:text-5xl"
            >
              Popular Tools
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-muted-foreground"
            >
              The most used tools by thousands of users daily
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              to="/categories"
              className="group hidden items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 md:flex"
            >
              View All Tools
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={tool.path}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
                        {tool.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Use Tool
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center md:hidden"
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            View All Tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularTools;

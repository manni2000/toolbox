import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Globe, Smartphone, Cloud } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Secure",
    description: "All processing happens in your browser. Your data never leaves your device.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No server delays. Instant results with client-side processing.",
  },
  {
    icon: Lock,
    title: "No Sign-up Required",
    description: "Start using any tool immediately. No account, no hassle.",
  },
  {
    icon: Globe,
    title: "Works Offline",
    description: "Once loaded, most tools work without an internet connection.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Fully responsive design works perfectly on any device.",
  },
  {
    icon: Cloud,
    title: "Always Free",
    description: "No hidden fees, no premium tiers. Every tool is free forever.",
  },
];

const TrustSection = () => {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Why Choose dailytools247?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Built with privacy and performance in mind
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

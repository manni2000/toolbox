import { motion } from "framer-motion";
import { Wrench, Users, Shield, Zap, Globe, Heart, Target, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const About = () => {
  const stats = [
    { label: "Free Tools", value: "100+" },
    { label: "Monthly Users", value: "100K+" },
    { label: "Files Processed", value: "1M+" },
    { label: "Uptime", value: "99.9%" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your files are processed locally in your browser. We never upload or store your data on our servers.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "All tools are optimized for speed. No waiting, no queues – instant results every time.",
    },
    {
      icon: Globe,
      title: "Always Free",
      description: "Every tool is completely free to use. No hidden fees, no premium tiers, no credit card required.",
    },
    {
      icon: Users,
      title: "User Focused",
      description: "Built based on real user needs. We continuously improve based on your feedback.",
    },
  ];

  const team = [
    { role: "Founder & CEO", description: "Passionate about making powerful tools accessible to everyone." },
    { role: "Lead Developer", description: "Building fast, reliable, and user-friendly web applications." },
    { role: "UI/UX Designer", description: "Creating intuitive interfaces that anyone can use." },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
                <Wrench className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                About <span className="gradient-text">Dailytools247</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                We're on a mission to provide free, powerful, and privacy-focused online tools 
                for everyone. No signups, no fees, no data collection – just tools that work.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 md:p-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  In a world where simple online tools often come with hidden costs, intrusive ads, 
                  or questionable data practices, Dailytools247 stands different. We believe that essential 
                  utilities should be accessible to everyone – students, professionals, creators, 
                  and everyday users alike.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Every tool in our collection is designed with three principles: it must be free, 
                  it must respect user privacy, and it must just work. No complicated interfaces, 
                  no unnecessary features – just the tools you need, when you need them.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Our Values</h2>
              <p className="mt-4 text-muted-foreground">
                The principles that guide everything we build
              </p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Our Story</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Dailytools247 started from a simple frustration: why are basic online tools so complicated? 
                    Why do you need to sign up just to convert an image or generate a password?
                  </p>
                  <p>
                    We set out to build the toolkit we wished existed – a collection of essential utilities 
                    that respect users' time and privacy. What began as a handful of tools has grown into 
                    a comprehensive platform serving thousands of users daily.
                  </p>
                  <p>
                    Today, Dailytools247 offers over 50 free tools across categories like image processing, 
                    text manipulation, security, development, and more. And we're just getting started.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Our Founders</h2>
              <p className="mt-4 text-muted-foreground">
                The visionaries behind Dailytools247
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aniket Kr Mandal</h3>
                <p className="text-primary font-medium mb-3">Founder</p>
                <p className="text-sm text-muted-foreground">
                  Passionate entrepreneur with a vision to make powerful online tools accessible to everyone. 
                  Focused on creating user-friendly solutions that prioritize privacy and efficiency.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Manish Kumar</h3>
                <p className="text-primary font-medium mb-3">Co-Founder</p>
                <p className="text-sm text-muted-foreground">
                  Tech enthusiast dedicated to building innovative digital solutions. 
                  Committed to delivering high-quality tools that simplify everyday tasks for users worldwide.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/50 to-background py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
            >
              <Heart className="mx-auto h-12 w-12 text-primary mb-6" />
              <h2 className="text-2xl font-bold md:text-3xl">Start Using Dailytools247 Today</h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of users who trust Dailytools247 for their daily utility needs. 
                No signup required – just pick a tool and get started.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/categories" className="btn-primary">
                  Explore All Tools
                </Link>
                <Link to="/" className="btn-secondary">
                  Back to Home
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

export default About;

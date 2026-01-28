import { motion } from "framer-motion";
import { Search, Upload, Cpu, Download, ArrowRight, CheckCircle } from "lucide-react";

interface StepProps {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

const Step = ({ number, icon: Icon, title, description, delay }: StepProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="group relative"
  >
    {/* Connection Line */}
    {number < 4 && (
      <div className="absolute left-1/2 top-full hidden h-20 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/20 to-transparent md:block" />
    )}
    
    <div className="relative flex flex-col items-center text-center">
      {/* Step Number Badge */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
        className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg"
      >
        {number}
      </motion.div>

      {/* Icon Container */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.3 }}
        className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 md:mb-8 md:h-24 md:w-24"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
        
        {/* Icon */}
        <Icon className="relative z-10 h-8 w-8 text-primary md:h-10 md:w-10" />
        
        {/* Rotating Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-full w-full rounded-2xl bg-background" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
          className="text-lg font-semibold text-foreground md:text-xl"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.4 }}
          className="max-w-xs text-sm text-muted-foreground md:text-base"
        >
          {description}
        </motion.p>
      </div>

      {/* Success Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: delay + 0.6 }}
        className="mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <CheckCircle className="h-3 w-3 text-primary" />
      </motion.div>
    </div>
  </motion.div>
);

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Select Your Tool",
      description: "Choose from our wide range of utilities designed for various tasks and requirements"
    },
    {
      number: 2,
      icon: Upload,
      title: "Upload or Input",
      description: "Provide your file or input data through our intuitive and user-friendly interface"
    },
    {
      number: 3,
      icon: Cpu,
      title: "Process",
      description: "Let our tool do the work for you with advanced algorithms and processing capabilities"
    },
    {
      number: 4,
      icon: Download,
      title: "Download",
      description: "Get your result instantly and download or share as needed with just one click"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/2 blur-3xl" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container relative py-20 md:py-32">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <ArrowRight className="h-4 w-4" />
            Simple 4-Step Process
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            How It
            <span className="relative ml-2">
              <span className="gradient-text">Works</span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 origin-left rounded-full bg-gradient-to-r from-primary to-primary/50"
              />
            </span>
          </h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Get started in seconds with our streamlined workflow. No registration, no downloads, 
            just powerful tools that work instantly in your browser.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Step
                key={step.number}
                number={step.number}
                icon={step.icon}
                title={step.title}
                description={step.description}
                delay={0.2 + step.number * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who trust our tools for their daily tasks. 
              Fast, secure, and completely free.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:shadow-primary/25"
              onClick={() => window.location.href = '/categories'}
            >
              Explore All Tools
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HowItWorks;

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="border-t border-border bg-muted/30 py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <p className="mt-2 text-muted-foreground">
            Have questions, feedback, or suggestions? We'd love to hear from you.
          </p>
          
          <a
            href="mailto:hello@toolbox.com"
            className="mt-6 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 transition-all hover:border-primary/50 hover:shadow-lg group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Email us at</p>
              <p className="font-semibold text-foreground">hello@toolbox.com</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;

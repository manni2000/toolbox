import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="border-t border-border bg-muted/30 py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="mt-2 text-muted-foreground">
              Have a question or suggestion? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6"
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Send className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold">Message Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll get back to you soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message..."
                    required
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            )}
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            Or email us directly at{" "}
            <a href="mailto:hello@toolbox.com" className="text-primary hover:underline">
              hello@toolbox.com
            </a>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

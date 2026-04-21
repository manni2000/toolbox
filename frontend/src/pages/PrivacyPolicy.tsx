import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-muted-foreground">
                Last updated: April 18, 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-lg dark:prose-invert mx-auto max-w-3xl"
            >
              <div className="space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                  <p className="text-muted-foreground">
                    Welcome to dailytools247. We respect your privacy and are committed to protecting your personal data. 
                    This privacy policy explains how we handle your information when you use our website and tools.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">
                    <strong>We prioritize your privacy.</strong> dailytools247 is designed to process data locally in your browser whenever possible. Here's what you should know:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Files You Upload:</strong> Files processed by our tools (images, documents, etc.) are handled entirely in your browser and are never uploaded to our servers.</li>
                    <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our services, such as which tools are most popular.</li>
                    <li><strong>Cookies:</strong> We use essential cookies to ensure the website functions properly. No tracking cookies are used.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">
                    Any information we collect is used solely to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide and maintain our services</li>
                    <li>Improve user experience and tool functionality</li>
                    <li>Analyze usage patterns to prioritize new features</li>
                    <li>Ensure website security and prevent abuse</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures to protect your data. Since most processing happens 
                    locally in your browser, your files never leave your device. We use HTTPS encryption for all 
                    communications and regularly update our security practices.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
                  <p className="text-muted-foreground">
                    We may use third-party services for analytics and website functionality. These services have their 
                    own privacy policies and we encourage you to review them. We do not sell or share your personal 
                    data with third parties for marketing purposes.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
                  <p className="text-muted-foreground mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Access any personal data we hold about you</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of analytics tracking</li>
                    <li>Contact us with any privacy concerns</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting 
                    the new policy on this page and updating the "Last updated" date.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <a href="mailto:manishmandal9734@gmail.com" className="text-primary hover:underline">
                      manishmandal9734@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

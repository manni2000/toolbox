import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
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
                Terms of Service
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
              className="mx-auto max-w-3xl"
            >
              <div className="space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using dailytools247 ("the Service"), you agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use our services. We reserve the right to 
                    modify these terms at any time, and your continued use constitutes acceptance of any changes.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                  <p className="text-muted-foreground mb-4">
                    dailytools247 provides free online utility tools including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Image processing and conversion tools</li>
                    <li>Text manipulation and formatting tools</li>
                    <li>Security and encryption utilities</li>
                    <li>Developer tools and code formatters</li>
                    <li>Calculators and converters</li>
                    <li>File compression and archive tools</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
                  <p className="text-muted-foreground mb-4">
                    When using our Service, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Use the tools only for lawful purposes</li>
                    <li>Not attempt to disrupt or overload our servers</li>
                    <li>Not use automated systems to access the Service excessively</li>
                    <li>Not upload malicious files or content</li>
                    <li>Respect intellectual property rights when processing content</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
                  <p className="text-muted-foreground">
                    The dailytools247 website, its original content, features, and functionality are owned by dailytools247 
                    and are protected by international copyright, trademark, and other intellectual property laws. 
                    You retain all rights to the content you process using our tools.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">5. Disclaimer of Warranties</h2>
                  <p className="text-muted-foreground">
                    The Service is provided "as is" and "as available" without any warranties of any kind, either 
                    express or implied. We do not guarantee that the Service will be uninterrupted, secure, or 
                    error-free. We are not responsible for the accuracy or reliability of any results obtained 
                    through the use of our tools.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    In no event shall dailytools247, its directors, employees, or agents be liable for any indirect, 
                    incidental, special, consequential, or punitive damages arising from your use of the Service. 
                    This includes any loss of data, profits, or business opportunities.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">7. Data Processing</h2>
                  <p className="text-muted-foreground">
                    Most of our tools process data locally in your browser. Files you upload are not stored on 
                    our servers unless explicitly stated. You are responsible for backing up your original files 
                    before processing them with our tools.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">8. Service Availability</h2>
                  <p className="text-muted-foreground">
                    We strive to maintain high availability of our Service but do not guarantee uninterrupted access. 
                    We may modify, suspend, or discontinue any part of the Service at any time without prior notice. 
                    We are not liable for any modification, suspension, or discontinuation of the Service.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">9. Governing Law</h2>
                  <p className="text-muted-foreground">
                    These Terms shall be governed by and construed in accordance with applicable laws, without 
                    regard to conflict of law principles. Any disputes arising from these terms shall be resolved 
                    through appropriate legal channels.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
                  <p className="text-muted-foreground">
                    For any questions regarding these Terms of Service, please contact us at{" "}
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

export default TermsOfService;

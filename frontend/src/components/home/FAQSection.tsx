import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is Dailytools247 completely free to use?",
      answer: "Yes, Dailytools247 is 100% free. All 100+ tools are available without any signup, subscription, hidden fees, or premium features. Everything works instantly in your browser."
    },
    {
      question: "Do I need to create an account or register to use the tools?",
      answer: "No account or registration required. All tools work instantly without any signup process. Simply visit the tool page and start using it immediately."
    },
    {
      question: "Is my data safe and private with Dailytools247?",
      answer: "Yes, your data is completely safe. All processing happens locally in your browser. Your files never leave your device and are not stored on any server. We don't collect any personal information."
    },
    {
      question: "Does Dailytools247 work on mobile phones and tablets?",
      answer: "Yes, Dailytools247 is fully responsive and works perfectly on all devices including phones, tablets, laptops, and desktops. All tools are optimized for touch interfaces."
    },
    {
      question: "What types of tools are available on Dailytools247?",
      answer: "Dailytools247 offers 100+ free online tools across 14 categories: PDF tools, Image tools, Video tools, Audio tools, Text tools, Security tools, Finance tools, Developer tools, Education tools, Internet tools, SEO tools, Social media tools, ZIP tools, and Date/Time tools."
    },
    {
      question: "Are there any file size limits or restrictions?",
      answer: "File size limits depend on your browser and device capabilities. For best performance, we recommend files under 100MB for most tools. Large files are processed locally in your browser, so performance depends on your device's capabilities."
    },
    {
      question: "Do the tools require internet connection to work?",
      answer: "Most tools work offline once loaded. However, some advanced features might require internet for additional resources. The core functionality of all tools works without an internet connection after the initial page load."
    },
    {
      question: "How fast are the tools and processing times?",
      answer: "Processing times vary by tool and file size. Most tools process instantly or within seconds. Larger files or complex operations may take longer depending on your device's processing power."
    },
    {
      question: "Can I use Dailytools247 for commercial purposes?",
      answer: "Yes, all tools can be used for both personal and commercial purposes. There are no restrictions on usage for business applications."
    },
    {
      question: "What browsers are supported?",
      answer: "Dailytools247 works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend keeping your browser updated for the best experience."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get answers to common questions about our free online tools
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
              >
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors duration-200"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;

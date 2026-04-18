import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChevronDown, HelpCircle, Shield, LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getCategoryFaqs, getUniversalFaqs } from "@/data/categorySpecificFaqs";
import { useToolCategory } from "@/hooks/useToolCategory";
import SimilarTools from "./SimilarTools";

interface FAQWithIcon {
  question: string;
  answer: string;
  icon?: LucideIcon;
}

interface ToolFAQProps {
  faqs?: Array<{ question: string; answer: string }>;
  toolCategory?: string;
}

const ToolFAQ = ({ faqs: propFaqs, toolCategory }: ToolFAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [resolvedFaqs, setResolvedFaqs] = useState<FAQWithIcon[]>([]);
  const autoDetectedCategory = useToolCategory();

  useEffect(() => {
    if (propFaqs) {
      // Use provided FAQs with icon
      setResolvedFaqs(propFaqs.map(faq => ({ ...faq, icon: HelpCircle })));
    } else {
      // Determine which category to use
      const categoryToUse = toolCategory || autoDetectedCategory;
      
      if (categoryToUse) {
        // Use category-specific FAQs only (no universal FAQs)
        const categoryFaqs = getCategoryFaqs(categoryToUse);
        setResolvedFaqs(categoryFaqs.map(faq => ({ ...faq, icon: HelpCircle })));
      } else {
        // Fallback to default FAQs
        const defaultFaqs: FAQWithIcon[] = [
          {
            question: "Is this tool completely free to use?",
            answer: "Yes, all our tools are completely free to use with no hidden charges, subscriptions, or limits. You can use them as many times as you need without any cost.",
            icon: HelpCircle
          },
          {
            question: "Is my data secure and private when using this tool?",
            answer: "Absolutely. Your files and data are processed locally in your browser and are never uploaded to our servers or stored anywhere. We prioritize your privacy and security above everything else.",
            icon: Shield
          }
        ];
        setResolvedFaqs(defaultFaqs);
      }
    }
  }, [propFaqs, toolCategory, autoDetectedCategory]);

  const faqs = resolvedFaqs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Similar Tools Section */}
      <SimilarTools />
      
      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 pt-8 border-t border-border/50"
      >
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-2">Frequently Asked Questions</h3>
          <p className="text-muted-foreground text-sm">Get answers to common questions</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-3xl mx-auto space-y-3"
        >
          {faqs.map((faq, index) => {
            const Icon = faq.icon || HelpCircle;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-base">{faq.question}</span>
                  </div>
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
                  <div className="px-5 pb-4 text-muted-foreground leading-relaxed text-sm pl-16">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>
    </>
  );
};

export default ToolFAQ;

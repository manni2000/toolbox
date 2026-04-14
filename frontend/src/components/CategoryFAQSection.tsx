import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CategoryFAQSectionProps {
  faqs: Array<{ question: string; answer: string }>;
  categoryName?: string;
}

const CategoryFAQSection = ({ faqs, categoryName = "tools" }: CategoryFAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-10"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl font-bold mb-3"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-base text-muted-foreground max-w-2xl mx-auto"
          >
            Get answers to common questions about our {categoryName}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto space-y-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
              >
                <span className="font-semibold text-base pr-4">{faq.question}</span>
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
                <div className="px-5 pb-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryFAQSection;

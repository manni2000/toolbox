import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight, FileText, Image, Code, Shield, Type, Search, DollarSign, Video, Music, GraduationCap, Calendar, Globe, Share2, Archive, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useToolCategory } from "@/hooks/useToolCategory";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { toolSeoEnhancements } from "@/data/toolSeoEnhancements";
import { toolExists } from "@/data/existingTools";

interface SimilarTool {
  slug: string;
  title: string;
  description: string;
  category: string;
}

const SimilarTools = ({ currentToolSlug, excludeCurrent = true }: { currentToolSlug?: string; excludeCurrent?: boolean }) => {
  const currentCategory = useToolCategory();
  const autoDetectedSlug = useCurrentTool();
  const toolSlug = currentToolSlug || autoDetectedSlug;
  
  // Get similar tools with fallback logic to ensure consistent grid
  const getSimilarTools = (): SimilarTool[] => {
    if (!currentCategory) return [];
    
    let similarTools: SimilarTool[] = [];
    
    // Step 1: Same category tools
    Object.entries(toolSeoEnhancements).forEach(([slug, toolData]) => {
      if (excludeCurrent && slug === toolSlug) return;
      if (!toolExists(slug)) return;
      
      if (toolData.category === currentCategory) {
        similarTools.push({
          slug,
          title: toolData.title,
          description: toolData.description,
          category: toolData.category,
        });
      }
    });
    
    // Step 2: If less than 6 → add from other categories
    if (similarTools.length < 6) {
      Object.entries(toolSeoEnhancements).forEach(([slug, toolData]) => {
        if (similarTools.length >= 6) return;
        if (excludeCurrent && slug === toolSlug) return;
        if (!toolExists(slug)) return;
        
        // avoid duplicates
        if (!similarTools.find(t => t.slug === slug)) {
          similarTools.push({
            slug,
            title: toolData.title,
            description: toolData.description,
            category: toolData.category,
          });
        }
      });
    }
    
    // Step 3: Ensure minimum 3 cards for consistent layout
    while (similarTools.length < 3 && similarTools.length > 0) {
      similarTools.push(similarTools[0]); // duplicate fallback for perfect symmetry
    }
    
    // Return first 6 tools without randomness for consistent UX and SEO
    return similarTools.slice(0, 6);
  };
  
  const similarTools = getSimilarTools();
  
  if (similarTools.length === 0) return null;
  
  const getCategoryIcon = (category: string) => {
    // Return appropriate icon based on category
    const icons = {
      'PDF Tools': FileText,
      'Image Tools': Image,
      'Developer Tools': Code,
      'Security Tools': Shield,
      'Text Tools': Type,
      'SEO Tools': Search,
      'Finance Tools': DollarSign,
      'Video Tools': Video,
      'Audio Tools': Music,
      'Education Tools': GraduationCap,
      'Date & Time Tools': Calendar,
      'Internet Tools': Globe,
      'Social Media Tools': Share2,
      'Zip Tools': Archive,
      'General Tools': Wrench,
    };
    
    // Return the icon or default wrench icon
    return icons[category as keyof typeof icons] || Wrench;
  };
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-12 pt-8 border-t border-border/50"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Similar {currentCategory} Tools</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Explore more tools in this category</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 auto-rows-fr"
      >
        {similarTools.map((tool, index) => (
          <motion.div
            key={tool.slug}
            variants={fadeInUp}
            className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            <Link to={`/${tool.slug}`} className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {(() => {
                    const Icon = getCategoryIcon(tool.category);
                    return <Icon className="h-5 w-5 text-primary dark:text-primary-foreground" />;
                  })()}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
              
              <div className="flex flex-col flex-grow min-h-0">
                <h4 className="font-semibold text-base mb-2 line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-200 flex-shrink-0">
                  {tool.title.split(' - ')[0]}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3 flex-grow">
                  {tool.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/15 to-primary/10 dark:from-primary/25 dark:to-primary/20 text-primary dark:text-primary-foreground border border-primary/20 dark:border-primary/30">
                  {tool.category}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default SimilarTools;

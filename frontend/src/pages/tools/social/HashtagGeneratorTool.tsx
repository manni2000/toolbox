import { useState } from "react";
import { Copy, Check, Hash, Sparkles, TrendingUp, Users, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "330 80% 55%";

const HashtagGeneratorTool = () => {
  const toolSeoData = getToolSeoMetadata('hashtag-generator');
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("general");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: "general", label: "General" },
    { id: "photography", label: "Photography" },
    { id: "travel", label: "Travel" },
    { id: "food", label: "Food" },
    { id: "fitness", label: "Fitness" },
    { id: "fashion", label: "Fashion" },
    { id: "business", label: "Business" },
    { id: "tech", label: "Technology" },
  ];

  const hashtagSets: Record<string, string[]> = {
    general: ["love", "instagood", "photooftheday", "beautiful", "happy", "cute", "tbt", "followme", "picoftheday", "follow", "me", "selfie", "summer", "art", "instadaily", "friends", "repost", "nature", "girl", "fun"],
    photography: ["photography", "photooftheday", "photo", "photographer", "nature", "photoshoot", "canon", "travel", "portrait", "camera", "naturephotography", "landscape", "nikon", "travelphotography", "model", "sunset", "photographylovers", "streetphotography", "wildlife", "landscapephotography"],
    travel: ["travel", "travelgram", "traveling", "travelphotography", "instatravel", "travelblogger", "travelling", "traveltheworld", "traveler", "nature", "wanderlust", "photography", "trip", "adventure", "explore", "vacation", "holiday", "tourist", "travellers", "traveladdict"],
    food: ["food", "foodporn", "foodie", "instafood", "yummy", "foodphotography", "delicious", "foodstagram", "foodblogger", "tasty", "healthy", "homemade", "dinner", "lunch", "cooking", "restaurant", "chef", "dessert", "breakfast", "healthyfood"],
    fitness: ["fitness", "gym", "workout", "fitnessmotivation", "fit", "motivation", "training", "bodybuilding", "health", "fitfam", "lifestyle", "healthy", "strong", "exercise", "muscle", "healthylifestyle", "personaltrainer", "weightloss", "crossfit", "gymlife"],
    fashion: ["fashion", "style", "ootd", "fashionblogger", "fashionista", "streetstyle", "stylish", "outfit", "fashionstyle", "model", "clothing", "dress", "shopping", "trendy", "outfitoftheday", "lookoftheday", "fashionable", "instastyle", "styleblogger", "whatiwore"],
    business: ["business", "entrepreneur", "marketing", "success", "motivation", "startup", "money", "smallbusiness", "entrepreneurship", "businessowner", "inspiration", "branding", "digitalmarketing", "hustle", "mindset", "goals", "leadership", "growth", "finance", "investment"],
    tech: ["technology", "tech", "innovation", "coding", "programming", "developer", "software", "computer", "ai", "data", "startup", "digital", "code", "python", "javascript", "machinelearning", "cybersecurity", "ios", "android", "webdevelopment"],
  };

  const generate = () => {
    const baseHashtags = hashtagSets[category] || hashtagSets.general;
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    // Create hashtags from topic words
    const topicHashtags = topicWords.map(word => word.replace(/[^a-zA-Z0-9]/g, ""));
    
    // Combine topic hashtags with category hashtags
    const combined = [...new Set([...topicHashtags.slice(0, 5), ...baseHashtags])];
    
    // Shuffle and limit to 30
    const shuffled = combined.sort(() => Math.random() - 0.5).slice(0, 30);
    
    setHashtags(shuffled.map(h => `#${h}`));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Social(
        toolSeoData?.title || "Hashtag Generator",
        toolSeoData?.description || "Generate relevant hashtags for social media engagement",
        "hashtag-generator"
      )}
      <ToolLayout
      title={toolSeoData?.title || "Hashtag Generator"}
      description={toolSeoData?.description || "Generate relevant hashtags for social media engagement"}
      category="Social Tools"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Hash className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Hashtag Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Boost your social media reach with smart, relevant hashtags
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Topic or Keywords</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., sunset beach vacation"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      category === cat.id
                        ? "text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    style={{
                      background:
                        category === cat.id
                          ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                          : undefined,
                    }}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generate}
              className="w-full rounded-lg text-white px-4 py-3 font-medium transition-colors"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Sparkles className="inline h-4 w-4 mr-2" />
              Generate Hashtags
            </motion.button>
          </div>
        </motion.div>
          {/* Results Section */}
        {hashtags.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Generated Hashtags</h3>
                  <p className="text-sm text-muted-foreground">{hashtags.length} hashtags ready to use</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy all
                  </>
                )}
              </motion.button>
            </div>
            
            {/* Hashtag Pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 p-6 rounded-xl border border-border bg-card"
            >
              {hashtags.map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-full px-3 py-1.5 text-sm font-medium cursor-pointer transition-all"
                  style={{
                    backgroundColor: `hsl(${categoryColor} / 0.1)`,
                    color: `hsl(${categoryColor})`,
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Copy-ready Text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">Copy-ready format</p>
                <Zap className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {hashtags.join(" ")}
              </p>
            </motion.div>

            {/* Tips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-4"
            >
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Pro Tips</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Use 5-15 hashtags per post for optimal reach</li>
                    <li>• Mix popular and niche hashtags for better targeting</li>
                    <li>• Place hashtags in the first comment or at the end of caption</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            What is Hashtag Generation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Hashtag generation creates relevant, trending hashtags to increase social media visibility. These tags help categorize content, improve discoverability, and reach wider audiences interested in your topics.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your topic or keywords</li>
            <li>The tool generates relevant hashtags</li>
            <li>Filter by popularity or niche</li>
            <li>Copy and use in your posts</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Hashtag Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Trending tags</li>
                <li>• Niche-specific tags</li>
                <li>• Branded hashtags</li>
                <li>• Community tags</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Visibility Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Increased discoverability</li>
                <li>• Better categorization</li>
                <li>• Wider audience reach</li>
                <li>• Trend participation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How many hashtags should I use?",
            answer: "Use 5-10 relevant hashtags on Instagram, 2-3 on Twitter, and 3-5 on LinkedIn. Quality over quantity—use only relevant tags."
          },
          {
            question: "Should I use trending or niche hashtags?",
            answer: "Mix both: 1-2 trending tags for reach, and 3-8 niche tags for targeted engagement. Trending tags give visibility, niche tags give relevance."
          },
          {
            question: "Can I use the same hashtags every time?",
            answer: "Vary your hashtags to avoid looking spammy. Create hashtag sets for different topics and rotate them. Use brand-specific tags consistently."
          },
          {
            question: "Should I create my own hashtag?",
            answer: "Yes, create a branded hashtag for your business or campaign. It helps track conversations and builds brand identity. Keep it unique and memorable."
          },
          {
            question: "Do hashtags work on all platforms?",
            answer: "Hashtags work on Instagram, Twitter, TikTok, LinkedIn, Facebook, and Pinterest. Each platform has different optimal practices and limits."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default HashtagGeneratorTool;

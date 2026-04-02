import { useState } from "react";
import { Copy, Check, Hash, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "330 80% 55%";

const HashtagGeneratorTool = () => {
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
    <ToolLayout
      title="Hashtag Generator"
      description="Generate relevant hashtags for social media"
      category="Social Media"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Topic Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">Topic or Keywords</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., sunset beach vacation"
            className="input-tool"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  category === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} className="btn-primary w-full">
          <Hash className="h-5 w-5" />
          Generate Hashtags
        </button>

        {/* Results */}
        {hashtags.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{hashtags.length} Hashtags</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {hashtags.join(" ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HashtagGeneratorTool;

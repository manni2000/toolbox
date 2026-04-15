import { useState } from "react";
import { Copy, Check, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "330 80% 55%";

const BioGeneratorTool = () => {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [bio, setBio] = useState("");
  const [copied, setCopied] = useState(false);

  const platforms = [
    { id: "instagram", label: "Instagram", limit: 150 },
    { id: "twitter", label: "Twitter/X", limit: 160 },
    { id: "linkedin", label: "LinkedIn", limit: 220 },
    { id: "tiktok", label: "TikTok", limit: 80 },
  ];

  const tones = [
    { id: "professional", label: "Professional" },
    { id: "casual", label: "Casual" },
    { id: "creative", label: "Creative" },
    { id: "funny", label: "Funny" },
  ];

  const bioTemplates: Record<string, Record<string, string[]>> = {
    professional: {
      instagram: [
        "📍 {profession} | Passionate about {interests} | Building dreams one day at a time ✨",
        "{profession} 💼 | {interests} enthusiast | Let's connect and grow together 🌱",
        "🎯 {profession} | Exploring {interests} | Creating value through expertise",
      ],
      twitter: [
        "{profession} sharing insights on {interests}. Building in public. DMs open for collabs 🚀",
        "Your friendly neighborhood {profession}. Talking about {interests} & more. Opinions are my own.",
        "{profession} | {interests} advocate | Helping others level up 📈",
      ],
      linkedin: [
        "{profession} with a passion for {interests}. Helping organizations achieve their goals through strategic thinking and innovative solutions. Let's connect!",
        "Experienced {profession} | Specializing in {interests} | Open to new opportunities and meaningful connections.",
        "{profession} driving results through {interests}. Believer in continuous learning and professional growth.",
      ],
      tiktok: [
        "{profession} 💫 {interests} | Follow for tips!",
        "Your {profession} bestie 🎬 {interests}",
        "{profession} life ✨ {interests} lover",
      ],
    },
    casual: {
      instagram: [
        "Just a {profession} who loves {interests} ☕ | Living my best life ✌️",
        "{interests} addict | {profession} by day | Netflix by night 🍿",
        "Casually obsessed with {interests} 🤷 | {profession} vibes only",
      ],
      twitter: [
        "{profession} but make it casual. Into {interests}. Here for the memes and good vibes 😎",
        "just your average {profession} tweeting about {interests} and random thoughts 🙃",
        "{interests} lover | {profession} sometimes | coffee always ☕",
      ],
      linkedin: [
        "{profession} who believes work should be fun! Passionate about {interests} and making genuine connections.",
        "Friendly {profession} | Love discussing {interests} over coffee | Always learning something new!",
        "{profession} with a casual approach to success. Let's chat about {interests}!",
      ],
      tiktok: [
        "chill {profession} 😌 {interests}",
        "{interests} + good vibes = me",
        "just vibing as a {profession} ✨",
      ],
    },
    creative: {
      instagram: [
        "🎨 {profession} crafting dreams | {interests} is my muse | Every day is a canvas ✨",
        "Turning {interests} into art 🖌️ | {profession} with a creative soul | Dream. Create. Inspire.",
        "✨ {profession} × {interests} × Magic | Making the ordinary extraordinary",
      ],
      twitter: [
        "🌈 {profession} painting the world with {interests}. Every tweet is a brushstroke of creativity.",
        "Creative {profession} exploring the intersection of {interests} and imagination ✨",
        "{profession} | {interests} visionary | Turning ideas into reality, one pixel at a time 🎨",
      ],
      linkedin: [
        "Creative {profession} transforming {interests} into innovative solutions. I believe creativity is the bridge between imagination and reality.",
        "{profession} with an artistic approach to {interests}. Blending creativity with strategy to deliver unique results.",
        "Visionary {profession} | {interests} innovator | Creating tomorrow's solutions today",
      ],
      tiktok: [
        "✨ creative {profession} | {interests}",
        "making magic with {interests} 🪄",
        "{profession} but make it ✨art✨",
      ],
    },
    funny: {
      instagram: [
        "{profession} by accident 😅 | {interests} by choice | Adulting is hard 🙃",
        "Professional {profession} | Amateur {interests} person | Still figuring life out 🤪",
        "{interests} enthusiast | {profession} enthusiaster | Jokes enthusiastest 😂",
      ],
      twitter: [
        "{profession} but like, the funny one. {interests} keeps me sane. Send memes.",
        "I pretend to be a {profession} but really I just love {interests} and snacks 🍕",
        "{profession} | {interests} fanatic | My cat runs this account 🐱",
      ],
      linkedin: [
        "{profession} who brings humor to the workplace! Passionate about {interests} and keeping things light. Yes, I'm the one making dad jokes in meetings.",
        "Fun-loving {profession} | {interests} advocate | Proving that success and humor can coexist 😄",
        "{profession} with a side of comedy. Making {interests} fun since... recently.",
      ],
      tiktok: [
        "{profession} but chaotic 🤪 {interests}",
        "unhinged {profession} | {interests}",
        "the funny {profession} 😂 ← lie",
      ],
    },
  };

  const generate = () => {
    const templates = bioTemplates[tone]?.[platform] || bioTemplates.professional.instagram;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let generatedBio = template
      .replace(/{name}/g, name || "Creator")
      .replace(/{profession}/g, profession || "Creative")
      .replace(/{interests}/g, interests || "life");
    
    const limit = platforms.find(p => p.id === platform)?.limit || 150;
    if (generatedBio.length > limit) {
      generatedBio = generatedBio.slice(0, limit - 3) + "...";
    }
    
    setBio(generatedBio);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLimit = platforms.find(p => p.id === platform)?.limit || 150;

  return (
    <ToolLayout
      title="Bio Generator"
      description="Create engaging social media bios with character limits"
      category="Social Media"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Your Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John"
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Profession/Role</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g., Designer, Developer, Artist"
              className="input-tool"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Interests/Hobbies</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., photography, travel, coffee"
            className="input-tool"
          />
        </div>

        {/* Platform Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">Platform</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  platform === p.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p.label} ({p.limit})
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">Tone</label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tone === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} className="btn-primary w-full">
          <Sparkles className="h-5 w-5" />
          Generate Bio
        </button>

        {/* Result */}
        {bio && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Bio</h3>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${bio.length > currentLimit ? "text-destructive" : "text-muted-foreground"}`}>
                  {bio.length}/{currentLimit}
                </span>
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
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-base">{bio}</p>
            </div>

            <button onClick={generate} className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
              🎲 Generate Another
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default BioGeneratorTool;

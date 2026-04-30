import { useState } from "react";
import { Plus, Trash2, ExternalLink, Download, Eye, GripVertical, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "330 80% 55%";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

const LinkInBioTool = () => {
  const toolSeoData = getToolSeoMetadata('link-in-bio');
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([
    { id: "1", title: "", url: "" },
  ]);
  const [theme, setTheme] = useState("default");
  const [showPreview, setShowPreview] = useState(false);

  const themes = [
    { id: "default", name: "Default", bg: "bg-gradient-to-br from-purple-600 to-blue-500", button: "bg-white text-gray-900" },
    { id: "dark", name: "Dark", bg: "bg-gray-900", button: "bg-gray-800 text-white border border-gray-700" },
    { id: "light", name: "Light", bg: "bg-gray-100", button: "bg-white text-gray-900 shadow-sm" },
    { id: "sunset", name: "Sunset", bg: "bg-gradient-to-br from-orange-500 to-pink-500", button: "bg-white/90 text-gray-900" },
    { id: "ocean", name: "Ocean", bg: "bg-gradient-to-br from-cyan-500 to-blue-600", button: "bg-white text-gray-900" },
    { id: "forest", name: "Forest", bg: "bg-gradient-to-br from-green-600 to-emerald-500", button: "bg-white text-gray-900" },
  ];

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: "", url: "" }]);
  };

  const removeLink = (id: string) => {
    if (links.length > 1) {
      setLinks(links.filter((link) => link.id !== id));
    }
  };

  const updateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
  };

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  const generateHTML = () => {
    const validLinks = links.filter((l) => l.title && l.url);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profileName || "My Links"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      ${theme === "dark" ? "background: #111827;" : ""}
      ${theme === "light" ? "background: #f3f4f6;" : ""}
      ${theme === "default" ? "background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);" : ""}
      ${theme === "sunset" ? "background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);" : ""}
      ${theme === "ocean" ? "background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);" : ""}
      ${theme === "forest" ? "background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);" : ""}
    }
    .container { width: 100%; max-width: 400px; text-align: center; }
    .profile { margin-bottom: 24px; color: ${theme === "dark" || theme === "default" || theme === "sunset" || theme === "ocean" || theme === "forest" ? "#fff" : "#111827"}; }
    .profile h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .profile p { font-size: 14px; opacity: 0.9; }
    .links { display: flex; flex-direction: column; gap: 12px; }
    .link {
      display: block;
      padding: 16px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
      ${theme === "dark" ? "background: #1f2937; color: #fff; border: 1px solid #374151;" : ""}
      ${theme === "light" ? "background: #fff; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" : ""}
      ${theme === "default" || theme === "sunset" || theme === "ocean" || theme === "forest" ? "background: rgba(255,255,255,0.95); color: #111827;" : ""}
    }
    .link:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile">
      <h1>${profileName || "My Links"}</h1>
      ${profileBio ? `<p>${profileBio}</p>` : ""}
    </div>
    <div class="links">
      ${validLinks.map((link) => `<a href="${link.url}" class="link" target="_blank" rel="noopener">${link.title}</a>`).join("\n      ")}
    </div>
  </div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "link-in-bio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {CategorySEO.Social(
        toolSeoData?.title || "Link-in-Bio Page Generator",
        toolSeoData?.description || "Create a beautiful link-in-bio page for your social profiles",
        "link-in-bio"
      )}
      <ToolLayout
      breadcrumbTitle="Link in Bio"
      category="Social Tools"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-4xl">
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
              <ExternalLink className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Link in Bio Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a custom link-in-bio landing page with multiple links and beautiful themes.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">link in bio</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">bio link maker</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">landing page</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">multiple links</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile</h3>
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="linkinbio-profile-name"
                  name="linkinbio-profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your Name"
                  className="input-tool"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Bio (optional)</label>
                <input
                  type="text"
                  id="linkinbio-profile-bio"
                  name="linkinbio-profile-bio"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Short description"
                  className="input-tool"
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`rounded-lg p-3 text-sm font-medium transition-all ${
                      theme === t.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:opacity-80"
                    } ${t.bg} ${t.id === "light" ? "text-gray-900" : "text-white"}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Links</h3>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={link.id} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                    <GripVertical className="mt-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        id={`linkinbio-title-${link.id}`}
                        name={`linkinbio-title-${link.id}`}
                        value={link.title}
                        onChange={(e) => updateLink(link.id, "title", e.target.value)}
                        placeholder="Link Title"
                        className="input-tool"
                      />
                      <input
                        type="url"
                        id={`linkinbio-url-${link.id}`}
                        name={`linkinbio-url-${link.id}`}
                        value={link.url}
                        onChange={(e) => updateLink(link.id, "url", e.target.value)}
                        placeholder="https://example.com"
                        className="input-tool"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="mt-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      disabled={links.length === 1}
                      aria-label="Remove link"
                      title="Remove link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary flex-1 lg:hidden"
              >
                <Eye className="h-5 w-5" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button type="button" onClick={downloadHTML} className="btn-primary flex-1">
                <Download className="h-5 w-5" />
                Download HTML
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-24">
              <h3 className="mb-3 text-lg font-semibold">Preview</h3>
              <div
                className={`overflow-hidden rounded-2xl ${currentTheme.bg} p-6`}
                style={{ minHeight: "500px" }}
              >
                <div className="mx-auto max-w-[280px] text-center">
                  {/* Profile */}
                  <div className={`mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                    <h2 className="text-xl font-bold">{profileName || "Your Name"}</h2>
                    {profileBio && <p className="mt-1 text-sm opacity-90">{profileBio}</p>}
                  </div>

                  {/* Links */}
                  <div className="space-y-3">
                    {links
                      .filter((l) => l.title)
                      .map((link) => (
                        <a
                          key={link.id}
                          href={link.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all hover:scale-[1.02] ${currentTheme.button}`}
                        >
                          {link.title}
                          <ExternalLink className="h-4 w-4 opacity-50" />
                        </a>
                      ))}
                    {links.filter((l) => l.title).length === 0 && (
                      <div className={`rounded-xl px-4 py-3 ${currentTheme.button} opacity-50`}>
                        Add your first link
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            What is Link in Bio Creation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Link in bio tools create a single link that directs followers to multiple destinations. This is essential for platforms like Instagram where you only get one link in your profile.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Add your links with titles and icons</li>
            <li>Arrange links by priority</li>
            <li>The tool generates a single bio link</li>
            <li>Add to your social profile</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Link Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Multiple links in one</li>
                <li>• Custom icons</li>
                <li>• Click tracking</li>
                <li>• Mobile-optimized</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Instagram profiles</li>
                <li>• TikTok profiles</li>
                <li>• Link aggregators</li>
                <li>• Campaign landing pages</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why do I need a link in bio?",
            answer: "Platforms like Instagram and TikTok allow only one link in profiles. Link in bio tools let you share multiple links through a single URL."
          },
          {
            question: "How many links can I add?",
            answer: "Most link in bio tools allow unlimited links, but 5-10 is optimal for mobile usability. Too many options can overwhelm visitors."
          },
          {
            question: "Can I track link clicks?",
            answer: "Yes, most link in bio services provide analytics showing which links get clicked, helping you understand what your audience wants."
          },
          {
            question: "Should I order links by popularity?",
            answer: "Order links by priority and relevance. Put your most important links first. You can also use analytics to optimize ordering based on performance."
          },
          {
            question: "Do I need a custom domain?",
            answer: "Custom domains look more professional but aren't necessary. Free services work well for most personal use. Consider custom domains for businesses."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default LinkInBioTool;

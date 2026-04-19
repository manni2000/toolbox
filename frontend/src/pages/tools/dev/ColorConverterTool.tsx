import { useState } from "react";
import { Copy, Check, Palette, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "210 80% 55%";

const ColorConverterTool = () => {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const updateFromHex = (newHex: string) => {
    setHex(newHex);
    const newRgb = hexToRgb(newHex);
    if (newRgb) {
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }
  };

  const updateFromRgb = (newRgb: typeof rgb) => {
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHsl = (newHsl: typeof hsl) => {
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="mx-auto max-w-xl space-y-6">
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
              <Palette className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Color Converter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert between HEX, RGB, and HSL color formats with live preview
              </p>
            </div>
          </div>
        </motion.div>

        {/* Color Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-32 w-full rounded-xl border border-border shadow-lg"
          style={{ backgroundColor: hex }}
        />

        {/* Color Picker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center"
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            aria-label="Choose color"
            title="Choose color"
            className="h-14 w-32 cursor-pointer rounded-lg border border-border"
          />
        </motion.div>

        {/* HEX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between">
            <label htmlFor="hex-input" className="text-sm font-medium">HEX</label>
            <button
              onClick={() => handleCopy("hex", hex.toUpperCase())}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied === "hex" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <input
            id="hex-input"
            type="text"
            value={hex.toUpperCase()}
            onChange={(e) => updateFromHex(e.target.value)}
            className="mt-2 w-full rounded-lg bg-muted px-4 py-3 font-mono uppercase"
          />
        </motion.div>

        {/* RGB */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">RGB</label>
            <button
              onClick={() => handleCopy("rgb", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied === "rgb" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="rgb-r-input" className="text-xs text-muted-foreground">R</label>
              <input
                id="rgb-r-input"
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => updateFromRgb({ ...rgb, r: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="rgb-g-input" className="text-xs text-muted-foreground">G</label>
              <input
                id="rgb-g-input"
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => updateFromRgb({ ...rgb, g: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="rgb-b-input" className="text-xs text-muted-foreground">B</label>
              <input
                id="rgb-b-input"
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => updateFromRgb({ ...rgb, b: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
          </div>
          <p className="mt-2 text-center font-mono text-sm text-muted-foreground">
            rgb({rgb.r}, {rgb.g}, {rgb.b})
          </p>
        </motion.div>

        {/* HSL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HSL</label>
            <button
              onClick={() => handleCopy("hsl", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied === "hsl" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="hsl-h-input" className="text-xs text-muted-foreground">H</label>
              <input
                id="hsl-h-input"
                type="number"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => updateFromHsl({ ...hsl, h: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="hsl-s-input" className="text-xs text-muted-foreground">S%</label>
              <input
                id="hsl-s-input"
                type="number"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => updateFromHsl({ ...hsl, s: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="hsl-l-input" className="text-xs text-muted-foreground">L%</label>
              <input
                id="hsl-l-input"
                type="number"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => updateFromHsl({ ...hsl, l: Number(e.target.value) })}
                className="w-full rounded-lg bg-muted px-3 py-2 font-mono"
              />
            </div>
          </div>
          <p className="mt-2 text-center font-mono text-sm text-muted-foreground">
            hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
          </p>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-500" />
            What is Color Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Color conversion translates colors between different color formats like HEX, RGB, and HSL. Each format represents colors differently, and conversion ensures compatibility across web design, graphics, and development tools.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter a color value in any supported format</li>
            <li>The tool automatically converts to all other formats</li>
            <li>View the color preview and all representations</li>
            <li>Copy any format with one click</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Supported Formats</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• HEX (e.g., #3b82f6)</li>
                <li>• RGB (e.g., rgb(59, 130, 246))</li>
                <li>• HSL (e.g., hsl(217, 91%, 60%))</li>
                <li>• Real-time conversion</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Web design projects</li>
                <li>• CSS development</li>
                <li>• Graphic design</li>
                <li>• Color palette creation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is HEX color format?",
            answer: "HEX is a 6-digit hexadecimal representation of color, prefixed with #. Each pair of digits represents red, green, and blue values (00-FF). Example: #3b82f6"
          },
          {
            question: "What is RGB color format?",
            answer: "RGB represents colors using three values (0-255) for red, green, and blue. It's commonly used in CSS and graphics. Example: rgb(59, 130, 246)"
          },
          {
            question: "What is HSL color format?",
            answer: "HSL uses hue (0-360), saturation (0-100%), and lightness (0-100%) to describe colors. It's more intuitive for designers. Example: hsl(217, 91%, 60%)"
          },
          {
            question: "Can I convert between any formats?",
            answer: "Yes, you can input any of the supported formats (HEX, RGB, HSL) and the tool will automatically convert to all other formats instantly."
          },
          {
            question: "Why do I need different color formats?",
            answer: "Different tools and platforms use different color formats. Web uses HEX and RGB, while designers often prefer HSL. Conversion ensures compatibility across all tools."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default ColorConverterTool;

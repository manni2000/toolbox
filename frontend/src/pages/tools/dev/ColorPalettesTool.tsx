import { useState } from "react";
import { Copy, Check, Palette, RefreshCw, Download, Sparkles, Eye, Droplets, Zap, Sun, Moon, Flower, Mountain } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

interface Palette {
  name: string;
  colors: Color[];
  description?: string;
  category?: string;
}

const ColorPalettesTool = () => {
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [generatedPalette, setGeneratedPalette] = useState<Color[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [paletteType, setPaletteType] = useState<"monochromatic" | "analogous" | "complementary" | "triadic" | "tetradic" | "split-complementary">("monochromatic");
  const [colorCount, setColorCount] = useState(5);

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

  const createColor = (hex: string): Color => {
    const rgb = hexToRgb(hex)!;
    return {
      hex,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b)
    };
  };

  const generatePalette = () => {
    const baseRgb = hexToRgb(baseColor)!;
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const colors: Color[] = [];

    switch (paletteType) {
      case "monochromatic":
        const lightnessValues = Array.from({ length: colorCount }, (_, i) => 
          90 - (i * (70 / (colorCount - 1)))
        );
        lightnessValues.forEach(lightness => {
          const rgb = hslToRgb(baseHsl.h, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        });
        break;

      case "analogous":
        const hueStep = 30 / (colorCount - 1);
        for (let i = 0; i < colorCount; i++) {
          let hue = baseHsl.h - 15 + (i * hueStep * 2);
          if (hue < 0) hue += 360;
          if (hue > 360) hue -= 360;
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case "complementary":
        colors.push(createColor(baseColor));
        
        let complementHue = baseHsl.h + 180;
        if (complementHue > 360) complementHue -= 360;
        
        const complementRgb = hslToRgb(complementHue, baseHsl.s, baseHsl.l);
        colors.push(createColor(rgbToHex(complementRgb.r, complementRgb.g, complementRgb.b)));

        // Add variations
        for (let i = 1; i <= Math.floor((colorCount - 2) / 2); i++) {
          const lighterRgb = hslToRgb(baseHsl.h, baseHsl.s, Math.min(90, baseHsl.l + i * 15));
          const darkerRgb = hslToRgb(complementHue, baseHsl.s, Math.max(10, baseHsl.l - i * 15));
          
          if (colors.length < colorCount - 1) colors.push(createColor(rgbToHex(lighterRgb.r, lighterRgb.g, lighterRgb.b)));
          if (colors.length < colorCount) colors.push(createColor(rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b)));
        }
        break;

      case "triadic":
        const triadicHues = [0, 120, 240];
        triadicHues.forEach(offset => {
          let hue = baseHsl.h + offset;
          if (hue > 360) hue -= 360;
          
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        });

        // Add lighter versions
        if (colorCount > 3) {
          triadicHues.forEach(offset => {
            let hue = baseHsl.h + offset;
            if (hue > 360) hue -= 360;
            
            const rgb = hslToRgb(hue, Math.max(20, baseHsl.s - 20), Math.min(85, baseHsl.l + 20));
            if (colors.length < colorCount) colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
          });
        }
        break;

      case "tetradic":
        const tetradicHues = [0, 90, 180, 270];
        tetradicHues.forEach(offset => {
          let hue = baseHsl.h + offset;
          if (hue > 360) hue -= 360;
          
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        });
        break;

      case "split-complementary":
        colors.push(createColor(baseColor));
        
        let splitComplementHue = baseHsl.h + 180;
        if (splitComplementHue > 360) splitComplementHue -= 360;
        
        const split1 = splitComplementHue - 30;
        const split2 = splitComplementHue + 30;
        
        [split1, split2].forEach(hue => {
          if (hue < 0) hue += 360;
          if (hue > 360) hue -= 360;
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        });

        // Add base color variations
        for (let i = 1; i <= Math.floor((colorCount - 3) / 2); i++) {
          const lighterRgb = hslToRgb(baseHsl.h, baseHsl.s, Math.min(90, baseHsl.l + i * 12));
          if (colors.length < colorCount) colors.push(createColor(rgbToHex(lighterRgb.r, lighterRgb.g, lighterRgb.b)));
        }
        break;
    }

    setGeneratedPalette(colors);
    setSelectedPalette(null);
  };

  const presetPalettes: Palette[] = [
    {
      name: "Ocean Breeze",
      description: "Cool and refreshing ocean colors",
      category: "Nature",
      colors: [
        createColor("#0077be"),
        createColor("#00a8cc"),
        createColor("#74c0fc"),
        createColor("#a5d8ff"),
        createColor("#e7f5ff")
      ]
    },
    {
      name: "Sunset Glow",
      description: "Warm sunset colors",
      category: "Nature",
      colors: [
        createColor("#ff6b6b"),
        createColor("#f06292"),
        createColor("#ba68c8"),
        createColor("#9575cd"),
        createColor("#7986cb")
      ]
    },
    {
      name: "Forest Deep",
      description: "Deep forest greens",
      category: "Nature",
      colors: [
        createColor("#2d6a4f"),
        createColor("#40916c"),
        createColor("#52b788"),
        createColor("#74c69d"),
        createColor("#95d5b2")
      ]
    },
    {
      name: "Autumn Warmth",
      description: "Warm autumn colors",
      category: "Nature",
      colors: [
        createColor("#d84315"),
        createColor("#ff6f00"),
        createColor("#ff8f00"),
        createColor("#ffa000"),
        createColor("#ffb300")
      ]
    },
    {
      name: "Lavender Dream",
      description: "Soft lavender shades",
      category: "Floral",
      colors: [
        createColor("#6a4c93"),
        createColor("#8b7ab8"),
        createColor("#a689d3"),
        createColor("#c19ee0"),
        createColor("#d8b4fe")
      ]
    },
    {
      name: "Cherry Blossom",
      description: "Pink cherry blossom colors",
      category: "Floral",
      colors: [
        createColor("#ff6b9d"),
        createColor("#ff8fab"),
        createColor("#ffb3c1"),
        createColor("#ffccd5"),
        createColor("#ffe0ec")
      ]
    },
    {
      name: "Mint Fresh",
      description: "Fresh mint greens",
      category: "Food",
      colors: [
        createColor("#00695c"),
        createColor("#00897b"),
        createColor("#26a69a"),
        createColor("#4db6ac"),
        createColor("#81c784")
      ]
    },
    {
      name: "Citrus Burst",
      description: "Bright citrus colors",
      category: "Food",
      colors: [
        createColor("#f57c00"),
        createColor("#ff9800"),
        createColor("#ffa726"),
        createColor("#ffb74d"),
        createColor("#ffcc80")
      ]
    },
    {
      name: "Berry Mix",
      description: "Mixed berry colors",
      category: "Food",
      colors: [
        createColor("#8e24aa"),
        createColor("#ab47bc"),
        createColor("#ba68c8"),
        createColor("#ce93d8"),
        createColor("#e1bee7")
      ]
    },
    {
      name: "Sky Blue",
      description: "Clear sky colors",
      category: "Sky",
      colors: [
        createColor("#0277bd"),
        createColor("#0288d1"),
        createColor("#039be5"),
        createColor("#03a9f4"),
        createColor("#29b6f6")
      ]
    },
    {
      name: "Sunrise",
      description: "Early morning colors",
      category: "Sky",
      colors: [
        createColor("#ff6f00"),
        createColor("#ff8f00"),
        createColor("#ffa726"),
        createColor("#ffb74d"),
        createColor("#ffcc80")
      ]
    },
    {
      name: "Twilight",
      description: "Evening twilight colors",
      category: "Sky",
      colors: [
        createColor("#3949ab"),
        createColor("#5e35b1"),
        createColor("#7e57c2"),
        createColor("#9575cd"),
        createColor("#b39ddb")
      ]
    },
    {
      name: "Midnight",
      description: "Deep midnight blues",
      category: "Night",
      colors: [
        createColor("#1a237e"),
        createColor("#283593"),
        createColor("#303f9f"),
        createColor("#3949ab"),
        createColor("#5c6bc0")
      ]
    },
    {
      name: "Starlight",
      description: "Soft starlight colors",
      category: "Night",
      colors: [
        createColor("#424242"),
        createColor("#616161"),
        createColor("#757575"),
        createColor("#9e9e9e"),
        createColor("#bdbdbd")
      ]
    },
    {
      name: "Volcanic",
      description: "Hot volcanic colors",
      category: "Earth",
      colors: [
        createColor("#b71c1c"),
        createColor("#c62828"),
        createColor("#d32f2f"),
        createColor("#e53935"),
        createColor("#f44336")
      ]
    },
    {
      name: "Desert Sand",
      description: "Desert sand colors",
      category: "Earth",
      colors: [
        createColor("#8d6e63"),
        createColor("#a1887f"),
        createColor("#bcaaa4"),
        createColor("#d7ccc8"),
        createColor("#efebe9")
      ]
    },
    {
      name: "Ocean Deep",
      description: "Deep ocean blues",
      category: "Water",
      colors: [
        createColor("#004d40"),
        createColor("#00695c"),
        createColor("#00796b"),
        createColor("#00897b"),
        createColor("#009688")
      ]
    },
    {
      name: "Ice Blue",
      description: "Cool ice blue colors",
      category: "Water",
      colors: [
        createColor("#e0f7fa"),
        createColor("#b2ebf2"),
        createColor("#80deea"),
        createColor("#4dd0e1"),
        createColor("#26c6da")
      ]
    },
    {
      name: "Royal Purple",
      description: "Royal purple shades",
      category: "Royal",
      colors: [
        createColor("#4a148c"),
        createColor("#6a1b9a"),
        createColor("#7b1fa2"),
        createColor("#8e24aa"),
        createColor("#9c27b0")
      ]
    },
    {
      name: "Golden Hour",
      description: "Golden hour lighting",
      category: "Light",
      colors: [
        createColor("#ff6f00"),
        createColor("#ff8f00"),
        createColor("#ffa726"),
        createColor("#ffb74d"),
        createColor("#ffcc80")
      ]
    },
    {
      name: "Soft Pastel",
      description: "Soft pastel colors",
      category: "Pastel",
      colors: [
        createColor("#ffccdd"),
        createColor("#ffccbc"),
        createColor("#ffffcc"),
        createColor("#ccffcc"),
        createColor("#ccddff")
      ]
    },
    {
      name: "Neon Lights",
      description: "Bright neon colors",
      category: "Neon",
      colors: [
        createColor("#ff00ff"),
        createColor("#00ffff"),
        createColor("#ffff00"),
        createColor("#ff00aa"),
        createColor("#aa00ff")
      ]
    }
  ];

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportPalette = () => {
    const colors = selectedPalette ? selectedPalette.colors : generatedPalette;
    const paletteData = {
      name: selectedPalette?.name || "Custom Palette",
      description: selectedPalette?.description || "Generated color palette",
      category: selectedPalette?.category || "Custom",
      type: selectedPalette ? "preset" : paletteType,
      colorCount: colors.length,
      colors: colors.map(color => ({
        hex: color.hex,
        rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
      }))
    };
    
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${paletteData.name.replace(/\s+/g, '-').toLowerCase()}-palette.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const displayColors = selectedPalette ? selectedPalette.colors : generatedPalette;

  return (
    <ToolLayout
      title="Color Palettes Generator"
      description="Generate beautiful color palettes for your design projects with professional color theory"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Professional Color Palettes</h3>
              <p className="text-sm text-muted-foreground">
                Generate harmonious color combinations using color theory principles
              </p>
            </div>
          </div>
        </div>

        {/* Color Input */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <label htmlFor="base-color-hex" className="font-medium">Base Color</label>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              id="base-color-picker"
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              aria-label="Base color picker"
              title="Base color picker"
              className="h-12 w-20 cursor-pointer rounded-lg border border-border"
            />
            <input
              id="base-color-hex"
              type="text"
              value={baseColor.toUpperCase()}
              onChange={(e) => setBaseColor(e.target.value)}
              aria-label="Base color hex value"
              placeholder="Enter hex color"
              className="flex-1 rounded-lg bg-muted px-4 py-2 font-mono"
            />
            <button
              onClick={() => handleCopy("base", baseColor.toUpperCase())}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied === "base" ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Palette Generation Options */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <label className="font-medium">Generate Palette</label>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="palette-color-count" className="text-sm text-muted-foreground">Colors:</label>
              <select
                id="palette-color-count"
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                aria-label="Palette color count"
                title="Palette color count"
                className="rounded-lg bg-muted px-3 py-1 text-sm"
              >
                {[3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => { setPaletteType("monochromatic"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "monochromatic"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Sun className="h-4 w-4" />
              Monochromatic
            </button>
            <button
              onClick={() => { setPaletteType("analogous"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "analogous"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Palette className="h-4 w-4" />
              Analogous
            </button>
            <button
              onClick={() => { setPaletteType("complementary"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "complementary"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Complementary
            </button>
            <button
              onClick={() => { setPaletteType("triadic"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "triadic"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Zap className="h-4 w-4" />
              Triadic
            </button>
            <button
              onClick={() => { setPaletteType("tetradic"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "tetradic"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Mountain className="h-4 w-4" />
              Tetradic
            </button>
            <button
              onClick={() => { setPaletteType("split-complementary"); generatePalette(); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                paletteType === "split-complementary"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Flower className="h-4 w-4" />
              Split Complementary
            </button>
          </div>
        </div>

        {/* Preset Palettes */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <label className="font-medium">Professional Presets</label>
            </div>
            <div className="text-sm text-muted-foreground">
              {presetPalettes.length} curated palettes
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presetPalettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => setSelectedPalette(palette)}
                className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                  selectedPalette?.name === palette.name
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex gap-1 mb-3">
                  {palette.colors.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="h-8 w-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{palette.name}</p>
                  <p className="text-xs text-muted-foreground">{palette.description}</p>
                  <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {palette.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generated Palette Display */}
        {displayColors.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPalette ? selectedPalette.name : "Generated Palette"}
                </h3>
                {selectedPalette?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedPalette.description}</p>
                )}
              </div>
              <button
                onClick={exportPalette}
                className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>
            
            <div className="space-y-4">
              {displayColors.map((color, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 rounded-xl border border-border shadow-md"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                      <span className="font-mono text-sm font-medium">{color.hex.toUpperCase()}</span>
                      <button
                        onClick={() => handleCopy(`hex-${index}`, color.hex.toUpperCase())}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `hex-${index}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                      <span className="font-mono text-sm">rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</span>
                      <button
                        onClick={() => handleCopy(`rgb-${index}`, `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `rgb-${index}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                      <span className="font-mono text-sm">hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</span>
                      <button
                        onClick={() => handleCopy(`hsl-${index}`, `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `hsl-${index}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ColorPalettesTool;

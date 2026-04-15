import { useState } from "react";
import { ArrowUpDown, Copy, Check, Sparkles, Target, Calculator, RefreshCw, Ruler, Weight, Thermometer, SquareIcon, Droplet, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PresetButtonGroup, PresetOption } from "@/components/ui/preset-button-group";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "145 70% 45%";

type Category = "length" | "weight" | "temperature" | "area" | "volume" | "speed";

const units: Record<Category, { name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  length: [
    { name: "Meter (m)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Kilometer (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { name: "Centimeter (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { name: "Millimeter (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Mile", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { name: "Yard", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { name: "Foot (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { name: "Inch (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  ],
  weight: [
    { name: "Kilogram (kg)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Gram (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Milligram (mg)", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    { name: "Pound (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { name: "Ounce (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { name: "Ton (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  temperature: [
    { name: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
    { name: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  area: [
    { name: "Square Meter (m²)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Square Kilometer (km²)", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { name: "Hectare (ha)", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    { name: "Acre", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { name: "Square Foot (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
  ],
  volume: [
    { name: "Liter (L)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Milliliter (mL)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Gallon (US)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { name: "Cubic Meter (m³)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  speed: [
    { name: "Meter/sec (m/s)", toBase: (v) => v, fromBase: (v) => v },
    { name: "Kilometer/hour (km/h)", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { name: "Miles/hour (mph)", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { name: "Knot", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  ],
};

const categories: { id: Category; label: string }[] = [
  { id: "length", label: "Length" },
  { id: "weight", label: "Weight" },
  { id: "temperature", label: "Temperature" },
  { id: "area", label: "Area" },
  { id: "volume", label: "Volume" },
  { id: "speed", label: "Speed" },
];

const UnitConverterTool = () => {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const currentUnits = units[category];

  // Common conversion presets
  const commonConversions: Record<Category, PresetOption[]> = {
    length: [
      { label: "Km → Miles", value: { from: 1, to: 4 }, icon: Ruler, description: "Distance" },
      { label: "Feet → Meters", value: { from: 6, to: 0 }, icon: Ruler, description: "Height" },
      { label: "Inch → Cm", value: { from: 7, to: 2 }, icon: Ruler, description: "Small measure" },
    ],
    weight: [
      { label: "Kg → Lbs", value: { from: 0, to: 3 }, icon: Weight, description: "Body weight" },
      { label: "Lbs → Kg", value: { from: 3, to: 0 }, icon: Weight, description: "Body weight" },
      { label: "g → oz", value: { from: 1, to: 4 }, icon: Weight, description: "Recipe" },
    ],
    temperature: [
      { label: "°C → °F", value: { from: 0, to: 1 }, icon: Thermometer, description: "Weather" },
      { label: "°F → °C", value: { from: 1, to: 0 }, icon: Thermometer, description: "Weather" },
      { label: "K → °C", value: { from: 2, to: 0 }, icon: Thermometer, description: "Science" },
    ],
    area: [
      { label: "m² → ft²", value: { from: 0, to: 4 }, icon: SquareIcon, description: "Property" },
      { label: "Hectare → Acre", value: { from: 2, to: 3 }, icon: SquareIcon, description: "Land" },
    ],
    volume: [
      { label: "L → Gallon", value: { from: 0, to: 2 }, icon: Droplet, description: "Fuel" },
      { label: "mL → L", value: { from: 1, to: 0 }, icon: Droplet, description: "Liquid" },
    ],
    speed: [
      { label: "km/h → mph", value: { from: 1, to: 2 }, icon: Zap, description: "Speed limit" },
      { label: "mph → km/h", value: { from: 2, to: 1 }, icon: Zap, description: "Speed limit" },
      { label: "m/s → km/h", value: { from: 0, to: 1 }, icon: Zap, description: "Physics" },
    ],
  };

  const handlePresetSelect = (preset: { from: number; to: number }) => {
    setFromUnit(preset.from);
    setToUnit(preset.to);
  };

  const convert = (): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    const baseValue = currentUnits[fromUnit].toBase(num);
    const result = currentUnits[toUnit].fromBase(baseValue);
    return result.toFixed(6).replace(/\.?0+$/, "");
  };

  const result = convert();

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert length, weight, temperature and more with precision"
      category="Education Tools"
      categoryPath="/category/education"
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
              <RefreshCw className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Unit Converter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert length, weight, temperature and more with precision and ease
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="block text-sm font-medium mb-4">Select Category</label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCategory(cat.id); setFromUnit(0); setToUnit(1); }}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
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
        </motion.div>

        {/* Quick Conversions Presets */}
        {commonConversions[category] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
              Common Conversions
            </h3>
            <PresetButtonGroup
              options={commonConversions[category]}
              onSelect={handlePresetSelect}
              categoryColor={categoryColor}
              columns={3}
              variant="compact"
            />
          </motion.div>
        )}

        {/* Enhanced Converter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-6">
            {/* From Section */}
            <div>
              <label className="block text-sm font-medium mb-4">From</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(Number(e.target.value))}
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 appearance-none"
                  >
                    {currentUnits.map((unit, i) => (
                      <option key={i} value={i}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value..."
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={swap}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-muted to-muted/80 text-muted-foreground transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor} / 0.1) 0%, hsl(${categoryColor} / 0.2) 100%)`,
                }}
              >
                <ArrowUpDown className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              </motion.button>
            </div>

            {/* To Section */}
            <div>
              <label className="block text-sm font-medium mb-4">To</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(Number(e.target.value))}
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 appearance-none"
                  >
                    {currentUnits.map((unit, i) => (
                      <option key={i} value={i}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                    {result ? <Check className="h-4 w-4 text-green-600" /> : <Target className="h-4 w-4" />}
                  </div>
                  <input
                    type="text"
                    value={result}
                    readOnly
                    placeholder="Result..."
                    className="w-full rounded-lg bg-muted pl-10 pr-12 py-3 text-lg font-medium"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    disabled={!result}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted/50 p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-all"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conversion Info */}
        {result && value && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-blue-900 mb-2">Conversion Result</p>
                <p className="text-blue-700">
                  <span className="font-semibold">{value}</span> {currentUnits[fromUnit].name} = 
                  <span className="font-semibold"> {result}</span> {currentUnits[toUnit].name}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default UnitConverterTool;

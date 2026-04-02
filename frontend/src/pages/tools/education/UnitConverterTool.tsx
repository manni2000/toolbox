import { useState } from "react";
import { ArrowUpDown, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

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
      description="Convert length, weight, temperature and more"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setFromUnit(0); setToUnit(1); }}
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

        {/* Converter */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4">
            {/* From */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="from-unit" className="mb-2 block text-sm font-medium">From</label>
                <select
                  id="from-unit"
                  title="From unit"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(Number(e.target.value))}
                  className="input-tool"
                >
                  {currentUnits.map((unit, i) => (
                    <option key={i} value={i}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Value</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value..."
                  className="input-tool"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                title="Swap units"
                onClick={swap}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>
            </div>

            {/* To */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="to-unit" className="mb-2 block text-sm font-medium">To</label>
                <select
                  id="to-unit"
                  title="To unit"
                  value={toUnit}
                  onChange={(e) => setToUnit(Number(e.target.value))}
                  className="input-tool"
                >
                  {currentUnits.map((unit, i) => (
                    <option key={i} value={i}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Result</label>
                <div className="relative">
                  <input
                    type="text"
                    value={result}
                    readOnly
                    placeholder="Result..."
                    className="input-tool pr-12"
                  />
                  <button
                    onClick={handleCopy}
                    disabled={!result}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default UnitConverterTool;

import { useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const CurrencyConverterTool = () => {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  // Static exchange rates (base: USD)
  const exchangeRates: Record<string, { rate: number; name: string; symbol: string }> = {
    USD: { rate: 1, name: "US Dollar", symbol: "$" },
    EUR: { rate: 0.92, name: "Euro", symbol: "€" },
    GBP: { rate: 0.79, name: "British Pound", symbol: "£" },
    INR: { rate: 83.12, name: "Indian Rupee", symbol: "₹" },
    JPY: { rate: 149.50, name: "Japanese Yen", symbol: "¥" },
    AUD: { rate: 1.53, name: "Australian Dollar", symbol: "A$" },
    CAD: { rate: 1.36, name: "Canadian Dollar", symbol: "C$" },
    CHF: { rate: 0.88, name: "Swiss Franc", symbol: "Fr" },
    CNY: { rate: 7.24, name: "Chinese Yuan", symbol: "¥" },
    AED: { rate: 3.67, name: "UAE Dirham", symbol: "د.إ" },
    SGD: { rate: 1.34, name: "Singapore Dollar", symbol: "S$" },
    HKD: { rate: 7.82, name: "Hong Kong Dollar", symbol: "HK$" },
    NZD: { rate: 1.64, name: "New Zealand Dollar", symbol: "NZ$" },
    KRW: { rate: 1320.50, name: "South Korean Won", symbol: "₩" },
    MXN: { rate: 17.15, name: "Mexican Peso", symbol: "$" },
    BRL: { rate: 4.97, name: "Brazilian Real", symbol: "R$" },
    ZAR: { rate: 18.65, name: "South African Rand", symbol: "R" },
    RUB: { rate: 89.50, name: "Russian Ruble", symbol: "₽" },
    THB: { rate: 35.20, name: "Thai Baht", symbol: "฿" },
    MYR: { rate: 4.72, name: "Malaysian Ringgit", symbol: "RM" },
  };

  const currencies = Object.keys(exchangeRates);

  const convert = (value: number, from: string, to: string): number => {
    const fromRate = exchangeRates[from]?.rate || 1;
    const toRate = exchangeRates[to]?.rate || 1;
    const usdValue = value / fromRate;
    return usdValue * toRate;
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const inputAmount = parseFloat(amount) || 0;
  const convertedAmount = convert(inputAmount, fromCurrency, toCurrency);
  const exchangeRate = convert(1, fromCurrency, toCurrency);

  return (
    <ToolLayout
      title="Currency Converter"
      description="Convert between currencies with static exchange rates"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Converter */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* From */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1"
                  className="input-tool flex-1"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="input-tool w-24"
                >
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapCurrencies}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:bg-secondary/80 sm:mb-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>

            {/* To */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Converted To</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={convertedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  readOnly
                  className="input-tool flex-1 bg-muted"
                />
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="input-tool w-24"
                >
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Currency Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="mt-1 text-2xl font-bold">
              {exchangeRates[fromCurrency]?.symbol}{inputAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {exchangeRates[fromCurrency]?.name}
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">To</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {exchangeRates[toCurrency]?.symbol}{convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">
              {exchangeRates[toCurrency]?.name}
            </p>
          </div>
        </div>

        {/* Quick Conversions */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">Quick Conversions from {fromCurrency}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {currencies
              .filter((c) => c !== fromCurrency)
              .slice(0, 8)
              .map((code) => (
                <button
                  key={code}
                  onClick={() => setToCurrency(code)}
                  className={`rounded-lg border p-3 text-left transition-all hover:border-primary/50 ${
                    toCurrency === code ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{code}</p>
                  <p className="font-semibold">
                    {exchangeRates[code]?.symbol}
                    {convert(inputAmount, fromCurrency, code).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>⚠️ Note:</strong> These are static exchange rates for reference only. 
            Actual rates may vary. For accurate conversions, please check with your bank or 
            a live currency service.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CurrencyConverterTool;

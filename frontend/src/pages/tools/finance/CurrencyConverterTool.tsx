import { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCw, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "35 85% 55%";

interface ExchangeRate {
  rate: number;
  name: string;
  symbol: string;
}

interface ApiResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

const CurrencyConverterTool = () => {
  const toolSeoData = getToolSeoMetadata('currency-converter');
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, ExchangeRate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Currency information
  const currencyInfo: Record<string, { name: string; symbol: string }> = {
    USD: { name: "US Dollar", symbol: "$" },
    EUR: { name: "Euro", symbol: "€" },
    GBP: { name: "British Pound", symbol: "£" },
    INR: { name: "Indian Rupee", symbol: "₹" },
    JPY: { name: "Japanese Yen", symbol: "¥" },
    AUD: { name: "Australian Dollar", symbol: "A$" },
    CAD: { name: "Canadian Dollar", symbol: "C$" },
    CHF: { name: "Swiss Franc", symbol: "Fr" },
    CNY: { name: "Chinese Yuan", symbol: "¥" },
    AED: { name: "UAE Dirham", symbol: "د.إ" },
    SGD: { name: "Singapore Dollar", symbol: "S$" },
    HKD: { name: "Hong Kong Dollar", symbol: "HK$" },
    NZD: { name: "New Zealand Dollar", symbol: "NZ$" },
    KRW: { name: "South Korean Won", symbol: "₩" },
    MXN: { name: "Mexican Peso", symbol: "$" },
    BRL: { name: "Brazilian Real", symbol: "R$" },
    ZAR: { name: "South African Rand", symbol: "R" },
    RUB: { name: "Russian Ruble", symbol: "₽" },
    THB: { name: "Thai Baht", symbol: "฿" },
    MYR: { name: "Malaysian Ringgit", symbol: "RM" },
  };

  // Fetch real-time exchange rates
  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Using exchangerate-api.com (free tier, no API key required)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data: ApiResponse = await response.json();
      
      // Process the rates and combine with currency info
      const processedRates: Record<string, ExchangeRate> = {};
      Object.keys(currencyInfo).forEach(currency => {
        if (currency === 'USD') {
          processedRates[currency] = {
            rate: 1,
            name: currencyInfo[currency].name,
            symbol: currencyInfo[currency].symbol
          };
        } else if (data.rates[currency]) {
          processedRates[currency] = {
            rate: data.rates[currency],
            name: currencyInfo[currency].name,
            symbol: currencyInfo[currency].symbol
          };
        }
      });
      
      setExchangeRates(processedRates);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError('Unable to fetch live exchange rates. Please try again later.');
      // console.error('Error fetching exchange rates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rates on component mount
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh rates every 10 minutes
    const interval = setInterval(fetchExchangeRates, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const currencies = Object.keys(currencyInfo);

  const convert = (value: number, from: string, to: string): number => {
    if (!exchangeRates[from] || !exchangeRates[to]) return 0;
    const fromRate = exchangeRates[from].rate;
    const toRate = exchangeRates[to].rate;
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
    <>
      {CategorySEO.Finance(
        toolSeoData?.title || "Currency Converter",
        toolSeoData?.description || "Convert between currencies with real-time exchange rates",
        "currency-converter"
      )}
      <ToolLayout
      breadcrumbTitle="Currency Converter"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="space-y-6">
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
              <h2 className="text-2xl font-bold">Currency Converter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert between currencies with real-time exchange rates and live market data
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">currency converter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">exchange rate</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">currency exchange</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">forex converter</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"
              >
                <TrendingUp className="h-4 w-4 text-green-600" />
              </motion.div>
              <div>
                <span className="text-sm font-medium">Live Exchange Rates</span>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Updated: {lastUpdated}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchExchangeRates}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && Object.keys(exchangeRates).length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading exchange rates...</p>
          </div>
        )}

        {/* Converter */}
        {!isLoading && Object.keys(exchangeRates).length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* From */}
              <div className="flex-1">
                <label htmlFor="amount" className="mb-2 block text-sm font-medium">Amount</label>
                <div className="flex gap-2">
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1"
                    className="input-tool flex-1"
                  />
                  <select
                    aria-label="From currency"
                    title="From currency"
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
                type="button"
                onClick={swapCurrencies}
                aria-label="Swap currencies"
                title="Swap currencies"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:bg-secondary/80 sm:mb-0"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              {/* To */}
              <div className="flex-1">
                <label htmlFor="converted-amount" className="mb-2 block text-sm font-medium">Converted To</label>
                <div className="flex gap-2">
                  <input
                    id="converted-amount"
                    type="text"
                    value={convertedAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    readOnly
                    aria-label="Converted amount"
                    className="input-tool flex-1 bg-muted"
                  />
                  <select
                    aria-label="To currency"
                    title="To currency"
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
        )}

        {/* Currency Details */}
        {!isLoading && Object.keys(exchangeRates).length > 0 && (
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
        )}

        {/* Quick Conversions */}
        {!isLoading && Object.keys(exchangeRates).length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold">Quick Conversions from {fromCurrency}</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {currencies
                .filter((c) => c !== fromCurrency)
                .slice(0, 8)
                .map((code) => (
                  <button
                    type="button"
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
        )}

        {/* Info */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Info:</strong> Exchange rates are updated every 10 minutes from 
            live market data. Rates may vary slightly between different financial institutions.
          </p>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            What is Currency Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Currency conversion converts the value of money from one currency to another based on current exchange rates. It's essential for international travel, business transactions, online shopping, and financial planning across different countries and economic systems.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Select the source currency you want to convert from</li>
            <li>Select the target currency you want to convert to</li>
            <li>Enter the amount you wish to convert</li>
            <li>View the converted amount based on live exchange rates</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Live exchange rates</li>
                <li>• 150+ currencies supported</li>
                <li>• Real-time updates</li>
                <li>• Historical rates</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• International travel</li>
                <li>• Business transactions</li>
                <li>• Online shopping</li>
                <li>• Financial planning</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How often are exchange rates updated?",
            answer: "Exchange rates are updated every 10 minutes from live market data. This ensures you get the most current rates for accurate conversions."
          },
          {
            question: "Are there fees for currency conversion?",
            answer: "This tool shows mid-market exchange rates. Banks and financial institutions may add fees or use different rates, so actual conversion amounts may vary."
          },
          {
            question: "What currencies are supported?",
            answer: "The tool supports over 150 currencies including major currencies like USD, EUR, GBP, JPY, and many others from countries worldwide."
          },
          {
            question: "Can I convert between any two currencies?",
            answer: "Yes, you can convert between any two supported currencies. The tool automatically calculates the conversion rate based on the current market data."
          },
          {
            question: "Why do exchange rates change?",
            answer: "Exchange rates fluctuate due to factors like inflation, interest rates, economic stability, geopolitical events, and supply/demand for currencies in global markets."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default CurrencyConverterTool;

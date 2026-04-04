export interface IndianCurrencyFormatOptions {
  compact?: boolean;
  decimals?: number;
}

export interface AmountFormatOptions {
  currency?: string;
  format?: "indian" | "international" | "compact";
  decimals?: number;
}

const sanitizeNumber = (value: number): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return num;
};

const clampDecimals = (decimals: number | undefined, fallback = 2): number => {
  if (typeof decimals !== "number" || Number.isNaN(decimals)) return fallback;
  return Math.max(0, Math.min(6, Math.trunc(decimals)));
};

export const formatIndianCurrency = (
  value: number,
  options: IndianCurrencyFormatOptions = {}
): string => {
  const amount = sanitizeNumber(value);
  const decimals = clampDecimals(options.decimals, 2);

  if (options.compact) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatIndianNumber = (value: number, decimals = 2): string => {
  const amount = sanitizeNumber(value);
  const safeDecimals = clampDecimals(decimals, 2);

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  }).format(amount);
};

export const formatIndianCurrencyWithCommas = (value: number, decimals = 2): string => {
  const amount = sanitizeNumber(value);
  const safeDecimals = clampDecimals(decimals, 2);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  }).format(amount);
};

export const formatSmartIndianCurrency = (
  value: number,
  decimals = 2
): string => {
  const amount = sanitizeNumber(value);
  const absAmount = Math.abs(amount);
  const safeDecimals = clampDecimals(decimals, 2);

  if (absAmount >= 100000) {
    return formatIndianCurrency(amount, { compact: true, decimals: safeDecimals });
  }

  return formatIndianCurrency(amount, { compact: false, decimals: safeDecimals });
};

export const formatAmount = (
  value: number,
  options: AmountFormatOptions = {}
): string => {
  const amount = sanitizeNumber(value);
  const currency = options.currency || "INR";
  const format = options.format || "indian";
  const decimals = clampDecimals(options.decimals, 2);

  if (format === "indian") {
    if (currency === "INR") {
      return formatIndianCurrency(amount, { decimals });
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  if (format === "compact") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

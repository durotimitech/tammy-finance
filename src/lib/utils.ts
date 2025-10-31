import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, currency: string = "EUR") => {
  // Determine locale based on currency for proper formatting
  const localeMap: Record<string, string> = {
    EUR: "en-IE", // European English for Euro
    USD: "en-US",
    GBP: "en-GB",
    JPY: "ja-JP",
    CAD: "en-CA",
    AUD: "en-AU",
    CHF: "de-CH",
    CNY: "zh-CN",
    INR: "en-IN",
    NZD: "en-NZ",
    SEK: "sv-SE",
    NOK: "nb-NO",
    DKK: "da-DK",
    PLN: "pl-PL",
    BRL: "pt-BR",
    ZAR: "en-ZA",
    MXN: "es-MX",
    KRW: "ko-KR",
  };

  const locale = localeMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCompactNumber = (value: number, prefix = "$") => {
  if (value >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${prefix}${(value / 1000).toFixed(0)}K`;
  }
  return `${prefix}${value}`;
};

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const group = String(item[key]);
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function calculateSubtotals<T>(
  groupedData: Record<string, T[]>,
  valueKey: keyof T,
): Record<string, number> {
  return Object.entries(groupedData).reduce(
    (acc, [category, items]) => {
      acc[category] = items.reduce(
        (sum, item) => sum + Number(item[valueKey]),
        0,
      );
      return acc;
    },
    {} as Record<string, number>,
  );
}

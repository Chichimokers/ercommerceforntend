import { publicIpv4 } from 'public-ip';
import { currencies } from './currency-codes-list';

// Define types for better type safety
interface UserLocation {
  country: string;
  currency: string;
}

interface CurrencyData {
  country?: string;
  currency: string;
  exchangeRate: number;
  symbol: string;
}

/**
 * Formats a date for API requests
 */
function formatDate(date: Date): string {
  const pad = (num: number) => (num < 10 ? '0' + num : num);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Gets user location based on IP address
 */
async function getUserLocation(): Promise<UserLocation> {
  try {
    const ip = await publicIpv4();
    const response = await fetch(`https://apip.cc/api-json/${ip}`);

    if (!response.ok) {
      throw new Error(`Location API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      country: data.CountryName || 'Unknown',
      currency: data.Currency || 'USD'
    };
  } catch (error) {
    console.error('Failed to get user location:', error);
    // Return defaults if location detection fails
    return { country: 'United States', currency: 'USD' };
  }
}

/**
 * Gets exchange rate for a target currency
 */
async function getExchangeRate(targetCurrency: string): Promise<number> {
  try {
    const normalizedCurrency = targetCurrency.toLowerCase();
    const response = await fetch(`https://apip.cc/api-rates/1-usd2${normalizedCurrency}`);

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.text();

    if (!data || data.trim() === '') {
      throw new Error('Empty response from exchange rate API');
    }

    const cleanedData = data.trim().replace(',', '.');
    const rate = parseFloat(cleanedData);

    if (isNaN(rate)) {
      throw new Error(`Invalid exchange rate format: ${data}`);
    }

    return rate;
  } catch (error) {
    console.error(`Failed to get exchange rate for ${targetCurrency}:`, error);
    return 1;
  }
}

async function getElToqueExchangeRate(): Promise<number | null> {
  try {
    const response = await fetch('/api/exchange-rate', {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`API route error: ${response.status}`);
    }

    const data = await response.json();
    return data.usdRate;
  } catch (error) {
    console.error('Error fetching El Toque exchange rate:', error);
    return null;
  }
}

export async function getUserCurrencyAndRate(selectedCurrency?: string): Promise<CurrencyData | null> {
  try {
    let location: UserLocation | null = null;
    let targetCurrency: string;

    if (!selectedCurrency) {
      location = await getUserLocation();
      targetCurrency = location.currency;
    } else {
      targetCurrency = selectedCurrency;
    }

    let exchangeRate: number;
    if (targetCurrency.toUpperCase() === "CUP") {
      const elToqueRate = await getElToqueExchangeRate();
      exchangeRate = elToqueRate || 1;
    } else {
      exchangeRate = await getExchangeRate(targetCurrency);
    }

    const symbol = currencies[targetCurrency.toUpperCase()]?.symbol || '$';

    return {
      country: location?.country,
      currency: targetCurrency,
      exchangeRate,
      symbol
    };
  } catch (error) {
    console.error('Error in getUserCurrencyAndRate:', error);

    return {
      country: 'United States',
      currency: 'USD',
      exchangeRate: 1,
      symbol: '$'
    };
  }
}

const cache: Record<string, { data: CurrencyData, timestamp: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000;

export async function getCachedUserCurrencyAndRate(selectedCurrency?: string): Promise<CurrencyData | null> {
  const cacheKey = selectedCurrency || 'default';

  const cachedItem = cache[cacheKey];
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data;
  }

  const data = await getUserCurrencyAndRate(selectedCurrency);

  if (data) {
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
  }

  return data;
}

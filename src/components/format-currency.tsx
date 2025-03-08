export const formatCurrency = (
  amount: number,
  currencyCode = 'USD',
  symbol?: string
): string => {
  if (isNaN(amount)) return '0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: symbol ? 'narrowSymbol' : 'symbol',
  }).format(amount).replace(currencyCode, symbol || '');
};
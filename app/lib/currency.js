export const formatToNOK = (priceInCents) => {
  if (priceInCents === null || priceInCents === undefined) return '';
  
  const price = priceInCents / 100;
  
  // Format: 1.200,00 kr
  // 'de-DE' locale provides the desired format: period for thousands, comma for decimal
  const formattedNumber = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(price);
  
  return `${formattedNumber} kr`;
};
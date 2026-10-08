export const COMMISSION_RATES = {
  default: 10,
  Fashion: 15,
  Electronics: 8,
  Phones: 8,
  Computing: 10,
  Beauty: 12,
  Supermarket: 5,
  "Home & Office": 8
}
export function calculateCommission(price, category){
  const rate = COMMISSION_RATES[category] || COMMISSION_RATES.default
  const commission = (price * rate)/100
  return { rate, commission, vendorPayout: price-commission }
}

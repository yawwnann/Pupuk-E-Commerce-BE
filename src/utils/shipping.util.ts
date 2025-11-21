export const calculateShippingPrice = (totalWeight: number): number => {
  const baseRate = 10000;
  const weightInKg = totalWeight / 1000;
  const additionalRate = Math.ceil(weightInKg) * 5000;

  return baseRate + additionalRate;
};

export const calculateShipingPrice = ( totalWeight: number ): number => {
    const baseRate = 10000;
    const weightInKg = totalWeight / 1000;
    const additionalRate = Math.ceil(weightInKg) * 500;

    return baseRate + additionalRate;
}
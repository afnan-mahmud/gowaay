/**
 * Calculate commission based on room base price
 * 
 * Commission Rules:
 * - If base price < 2800 TK → Fixed 490 TK
 * - If base price >= 2800 TK → 18% of base price
 * 
 * @param basePriceTk - The base price of the room per night
 * @returns The calculated commission amount in TK
 */
export function calculateCommission(basePriceTk: number): number {
  if (basePriceTk < 2800) {
    return 490;
  }
  return Math.round(basePriceTk * 0.18);
}

/**
 * Calculate total price including commission
 * 
 * @param basePriceTk - The base price of the room per night
 * @returns Object containing commission and total price
 */
export function calculatePricing(basePriceTk: number): { commissionTk: number; totalPriceTk: number } {
  const commissionTk = calculateCommission(basePriceTk);
  const totalPriceTk = basePriceTk + commissionTk;
  
  return {
    commissionTk,
    totalPriceTk
  };
}


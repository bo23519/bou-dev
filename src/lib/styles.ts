/**
 * Reusable style utilities and patterns
 */

/**
 * Diagonal stripe pattern generator
 * @param baseColor - Base color for the pattern
 * @param stripeColor - Color for the stripes
 * @param stripeWidth - Width of each stripe in pixels
 * @returns CSS background-image value
 */
export const diagonalStripePattern = (
  baseColor: string = "#181818",
  stripeColor: string = "#1a1a1a",
  stripeWidth: number = 6
) => {
  return `repeating-linear-gradient(
    45deg,
    ${baseColor},
    ${baseColor} ${stripeWidth}px,
    ${stripeColor} ${stripeWidth}px,
    ${stripeColor} ${stripeWidth * 2}px
  )`;
};

/**
 * Common style patterns as template strings for Tailwind classes
 */
export const stylePatterns = {
  // Input fields
  input: "w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]",
  
  // Button variants
  buttonPrimary: "px-4 py-2 rounded-lg font-medium transition-all duration-300",
  buttonNav: "px-4 py-2 rounded-lg font-medium transition-all duration-300 text-[#787878] hover:text-[#D8FA00]",
  
  // Card styles
  card: "bg-[#181818] border border-[#767678] rounded-lg p-6",
} as const;

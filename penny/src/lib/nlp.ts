export interface NlpResult {
  amount: number | null
  category: string
  emoji: string
  confidence: number
}

const CATEGORY_RULES: Array<{ keywords: string[]; category: string; emoji: string }> = [
  { keywords: ['bubble tea', 'boba', 'coffee', 'tea', 'drink', 'drinks', 'juice', 'soda', 'smoothie'], category: 'Drinks', emoji: '🧋' },
  { keywords: ['lunch', 'dinner', 'breakfast', 'food', 'meal', 'eat', 'pizza', 'burger', 'sushi', 'rice', 'noodle', 'snack', 'fries'], category: 'Food', emoji: '🍟' },
  { keywords: ['shoes', 'sneakers', 'shirt', 'clothes', 'shopping', 'buy', 'bought', 'store', 'mall', 'outfit', 'dress', 'pants'], category: 'Shopping', emoji: '👟' },
  { keywords: ['game', 'games', 'netflix', 'spotify', 'movie', 'cinema', 'fun', 'play', 'steam', 'app', 'subscription'], category: 'Fun', emoji: '🎮' },
]

const AMOUNT_REGEX = /\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)/i

function extractPlainNumber(lower: string): number | null {
  const match =
    lower.match(/(?:spent|paid|cost|costs?|for|got)\s+(\d+(?:\.\d{1,2})?)/) ??
    lower.match(/^(\d+(?:\.\d{1,2})?)$/)
  return match ? parseFloat(match[1]) : null
}

export function parseTransaction(input: string): NlpResult {
  const lower = input.toLowerCase().trim()
  const match = lower.match(AMOUNT_REGEX)
  const amount = match ? parseFloat(match[1] ?? match[2]) : extractPlainNumber(lower)

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return { amount, category: rule.category, emoji: rule.emoji, confidence: amount !== null ? 0.9 : 0.4 }
    }
  }

  return { amount, category: 'Other', emoji: '➕', confidence: amount !== null ? 0.7 : 0 }
}

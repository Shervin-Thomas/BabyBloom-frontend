// Minimal local sentiment analyzer - works offline
// Uses a small list of positive/negative words to produce a simple score

const POSITIVE = ['good','happy','joy','relaxed','excited','calm','great','fine','content','peaceful','hopeful'];
const NEGATIVE = ['sad','depressed','anxious','angry','upset','tired','lonely','stressed','worried','scared','overwhelmed'];

export function analyzeSentiment(text: string) {
  const t = (text || '').toLowerCase();
  let score = 0;
  POSITIVE.forEach(w => { if (t.includes(w)) score += 1; });
  NEGATIVE.forEach(w => { if (t.includes(w)) score -= 1; });
  const normalized = Math.max(-1, Math.min(1, score / 5));
  let label = 'Neutral';
  if (normalized > 0.2) label = 'Positive';
  if (normalized < -0.2) label = 'Negative';
  return { score: (normalized + 1) / 2, label }; // map to 0..1
}

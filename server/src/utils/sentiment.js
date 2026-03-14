const positiveWords = [
  'calm', 'better', 'good', 'great', 'hopeful', 'productive', 'relieved', 'steady', 'clear', 'grateful',
  'confident', 'supported', 'peaceful', 'balanced', 'improving', 'strong', 'proud', 'okay', 'focused', 'rested',
];

const negativeWords = [
  'anxious', 'anxiety', 'bad', 'burnout', 'drained', 'empty', 'exhausted', 'failure', 'fear', 'guilty',
  'hopeless', 'low', 'numb', 'overwhelmed', 'panic', 'pressured', 'sad', 'stressed', 'stress', 'tired',
  'unsafe', 'worthless', 'crying', 'alone', 'lonely', 'heartbroken', 'rejected', 'struggling', 'worried', 'stuck',
];

const crisisWords = [
  'suicide', 'kill myself', 'end my life', 'self harm', 'self-harm', 'want to die', 'not safe', 'hurt myself',
];

const tokenize = (text) =>
  `${text || ''}`
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const analyzeSentiment = (text) => {
  const normalizedText = `${text || ''}`.trim();
  if (!normalizedText) {
    return {
      label: 'neutral',
      score: 0,
      intensity: 'low',
      flags: [],
    };
  }

  const tokens = tokenize(normalizedText);
  let score = 0;

  tokens.forEach((token) => {
    if (positiveWords.includes(token)) {
      score += 1;
    }
    if (negativeWords.includes(token)) {
      score -= 1;
    }
  });

  const lowered = normalizedText.toLowerCase();
  const flags = [];
  if (crisisWords.some((phrase) => lowered.includes(phrase))) {
    flags.push('crisis_language');
    score -= 4;
  }

  let label = 'neutral';
  if (score >= 2) {
    label = 'positive';
  } else if (score <= -2) {
    label = 'negative';
  }

  const absoluteScore = Math.abs(score);
  const intensity = absoluteScore >= 4 ? 'high' : absoluteScore >= 2 ? 'medium' : 'low';

  return {
    label,
    score,
    intensity,
    flags,
  };
};

module.exports = {
  analyzeSentiment,
};

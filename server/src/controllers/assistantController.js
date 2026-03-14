const mongoose = require('mongoose');
const MoodLog = require('../models/MoodLog');
const Resource = require('../models/Resource');
const curatedResources = require('../data/curatedResources');

const crisisPatterns = [
  /suicid/i,
  /kill myself/i,
  /end my life/i,
  /hurt myself/i,
  /self[-\s]?harm/i,
  /not safe/i,
  /want to die/i,
  /can't go on/i,
];

const categoryKeywords = {
  exam_stress: ['exam', 'test', 'marks', 'result', 'assignment', 'deadline', 'study'],
  anxiety: ['anxious', 'anxiety', 'panic', 'overthink', 'racing thoughts', 'nervous'],
  depression: ['depressed', 'empty', 'hopeless', 'numb', 'low energy', 'worthless'],
  heartbreak: ['breakup', 'heartbreak', 'rejected', 'relationship', 'love failure'],
  sleep: ['sleep', 'insomnia', 'awake', 'bedtime', 'restless', 'tired'],
  burnout: ['burnout', 'burned out', 'exhausted', 'drained', 'overworked'],
  focus: ['focus', 'concentrate', 'distracted', 'procrastinating', 'attention'],
  motivation: ['motivation', 'stuck', 'failed', 'confidence', 'discouraged'],
  suicide_support: ['unsafe', 'self harm', 'suicidal'],
  stress: ['stress', 'pressure', 'overwhelmed'],
};

const fallbackAdvice = {
  exam_stress: [
    'Shrink the workload to one 20-minute study block and one clearly defined topic.',
    'Switch from rereading to retrieval: answer questions from memory or teach the idea out loud.',
    'Plan only the next hour, not the whole semester, so your brain has something concrete to act on.',
  ],
  anxiety: [
    'Ground yourself in one thing you can see, one thing you can touch, and one task you can finish in under ten minutes.',
    'Reduce reassurance loops like repeated checking or over-scanning messages, notes, or schedules.',
    'Tell one trusted person that your anxiety is louder than usual so you are not carrying it alone.',
  ],
  depression: [
    'Lower the bar to a bridge task such as reviewing flashcards, reading one page, or replying to one email.',
    'Put structure outside your head with a timer, visible notes, and one written next step.',
    'If low mood is affecting sleep, appetite, attendance, or safety, reach for human support early.',
  ],
  heartbreak: [
    'Create some distance from triggers for a while, including old messages and constant profile checking.',
    'Let the feeling move somewhere useful by journaling, walking, or talking to one steady person.',
    'Ask for a small restart, not a full comeback: one class, one task, one routine you can complete today.',
  ],
  sleep: [
    'Give yourself a gentler wind-down tonight by reducing screens and bright light before bed.',
    'Avoid turning bedtime into a performance test; aim for rest and quiet, not perfect sleep.',
    'If sleep problems keep disrupting classes or mood, bring it into a conversation with support.',
  ],
  burnout: [
    'Pause long enough to separate what is urgent from what is only loud.',
    'Protect one block today for recovery, not productivity theatre.',
    'See whether any commitment can be delayed, delegated, or made smaller for this week.',
  ],
  focus: [
    'Remove one distraction source completely for the next 15 to 20 minutes.',
    'Write the exact task in a sentence so your mind is aiming at something specific.',
    'Start with momentum tasks like solving one problem or summarizing one page from memory.',
  ],
  motivation: [
    'Treat this as a recovery moment, not proof that you cannot do hard things.',
    'Choose one task that creates evidence of movement instead of waiting to feel fully confident.',
    'Review what went wrong with kindness and specificity, not self-attack.',
  ],
  stress: [
    'Slow the situation down by naming the next one or two actions instead of the whole problem at once.',
    'Take a brief body reset with a longer exhale than inhale and unclench your shoulders intentionally.',
    'Reach for support before stress becomes the only thing driving your decisions.',
  ],
};

const normalizeResource = (resource) => ({
  id: resource._id ? resource._id.toString() : resource.id,
  title: resource.title,
  summary: resource.summary,
  category: resource.category,
  internal: Boolean(resource.internal),
  sourceName: resource.sourceName || '',
  url: resource.url || '',
});

const detectCategory = (message) => {
  const lowerMessage = message.toLowerCase();
  let bestCategory = 'stress';
  let bestScore = 0;

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((count, keyword) => count + (lowerMessage.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  });

  return bestCategory;
};

const getMoodSummary = async (userId) => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  const logs = await MoodLog.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean();
  if (!logs.length) {
    return null;
  }

  const latest = logs[0];
  const averageMood = Number((logs.reduce((sum, log) => sum + log.moodScore, 0) / logs.length).toFixed(1));

  return {
    latestMoodLabel: latest.moodLabel,
    latestMoodScore: latest.moodScore,
    latestMoodNote: latest.note || '',
    averageMood,
  };
};

const getRecommendedResources = async (category) => {
  if (mongoose.connection.readyState === 1) {
    const resources = await Resource.find({ category }).sort({ featured: -1, viewCount: -1, createdAt: -1 }).limit(3).lean();
    if (resources.length) {
      return resources.map(normalizeResource);
    }
  }

  const matchedFallback = curatedResources
    .filter((resource) => resource.category === category)
    .slice(0, 3)
    .map(normalizeResource);

  if (matchedFallback.length) {
    return matchedFallback;
  }

  return curatedResources.filter((resource) => resource.featured).slice(0, 3).map(normalizeResource);
};

const buildResourceContext = (resources) => {
  if (!resources.length) {
    return 'No curated resources were found for this topic.';
  }

  return resources
    .map((resource) => `${resource.title} (${resource.category}): ${resource.summary}`)
    .join('\n');
};

const buildMoodContext = (moodSummary) => {
  if (!moodSummary) {
    return 'No recent mood tracker data is available.';
  }

  return [
    `Latest mood: ${moodSummary.latestMoodLabel} (${moodSummary.latestMoodScore}/5).`,
    `Average mood over recent check-ins: ${moodSummary.averageMood}/5.`,
    moodSummary.latestMoodNote ? `Latest mood note: ${moodSummary.latestMoodNote}` : '',
  ]
    .filter(Boolean)
    .join(' ');
};

const extractGeminiText = (responseData) => {
  const candidates = Array.isArray(responseData.candidates) ? responseData.candidates : [];
  const parts = [];

  candidates.forEach((candidate) => {
    const contentParts = Array.isArray(candidate.content?.parts) ? candidate.content.parts : [];
    contentParts.forEach((part) => {
      if (part.text) {
        parts.push(part.text.trim());
      }
    });
  });

  return parts.join('\n\n').trim();
};

const createSuggestionSet = (resources, requiresHumanSupport) => {
  const suggestions = [
    {
      label: 'Open support chat',
      to: '/chat',
      type: 'internal',
      description: 'Talk with a counsellor or peer mentor if you want a real person involved.',
    },
    {
      label: 'Review resources',
      to: '/resources',
      type: 'internal',
      description: 'Browse the wider resource hub for guides and articles.',
    },
  ];

  if (resources[0]) {
    suggestions.unshift({
      label: 'Read suggested guide',
      to: resources[0].internal ? `/resources/${resources[0].id}` : resources[0].url,
      type: resources[0].internal ? 'internal' : 'external',
      description: `Start with ${resources[0].title}.`,
    });
  }

  if (requiresHumanSupport) {
    suggestions.unshift({
      label: 'Get urgent help',
      to: '/chat',
      type: 'internal',
      description: 'Use support chat now and contact emergency help if you are in immediate danger.',
    });
  }

  return suggestions;
};

const createFallbackReply = ({ message, category, moodSummary, requiresHumanSupport }) => {
  const advice = fallbackAdvice[category] || fallbackAdvice.stress;
  const lowerMessage = message.toLowerCase();

  let opening = 'It sounds like a lot is landing on you at once.';
  if (lowerMessage.includes('exam') || lowerMessage.includes('study')) {
    opening = 'This sounds like academic pressure mixed with emotional overload.';
  } else if (category === 'anxiety') {
    opening = 'What you described sounds a lot like an anxious spiral, and that can make small things feel huge.';
  } else if (category === 'depression') {
    opening = 'That kind of heaviness can make even simple tasks feel unfairly difficult.';
  } else if (category === 'heartbreak') {
    opening = 'Heartbreak can shake focus, confidence, and routine all at the same time.';
  }

  const moodLine = moodSummary
    ? `Your recent mood tracker data also shows a latest check-in of ${moodSummary.latestMoodLabel} (${moodSummary.latestMoodScore}/5), so it may help to keep the next step especially small.`
    : 'Keeping the next step small and specific can help you regain some footing.';

  const urgentLine = requiresHumanSupport
    ? 'If you might hurt yourself or you do not feel safe being alone, contact emergency help now. If you are in the United States or Canada, call or text 988. Otherwise, call your local emergency number or crisis service and get another person physically or virtually with you right away.'
    : 'If this keeps intensifying or starts affecting your safety, use support chat so a counsellor or peer mentor can step in.';

  return [
    opening,
    moodLine,
    'Try this next:',
    `1. ${advice[0]}`,
    `2. ${advice[1]}`,
    `3. ${advice[2]}`,
    urgentLine,
  ].join('\n');
};

const createCrisisReply = () =>
  [
    'I am really glad you said this out loud.',
    'If there is any chance you might hurt yourself or you do not feel safe, stop using this chat as your only support and contact urgent help right now.',
    'If you are in the United States or Canada, call or text 988 now. If there is immediate danger, call emergency services or go to the nearest emergency room. If you are elsewhere, contact your local emergency number or crisis line right away.',
    'Please also get another person with you now if you can: a friend, roommate, family member, resident advisor, or campus staff member. You deserve human support in this moment.',
  ].join('\n');

const fetchGeminiReply = async ({ history, message, moodSummary, resources }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: [
                'You are Mind Haven, a supportive mental wellness assistant for students.',
                'Be warm, concise, and practical.',
                'Do not present yourself as a therapist, doctor, or crisis service.',
                'Do not diagnose or promise outcomes.',
                'Validate feelings, then offer 2 to 4 concrete next steps.',
                'If the user mentions self-harm, suicide, or immediate danger, prioritize urgent safety guidance and tell them to contact human or emergency support now.',
                'When relevant, mention the app features available: mood tracker, support chat, and curated resources.',
                `Recent mood context: ${buildMoodContext(moodSummary)}`,
                `Relevant curated resources:\n${buildResourceContext(resources)}`,
              ].join('\n\n'),
            },
          ],
        },
        contents: [
          ...history.map((entry) => ({
            role: entry.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: entry.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 450,
        },
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini request failed.');
    }

    const outputText = extractGeminiText(data);
    return outputText || null;
  } finally {
    clearTimeout(timeout);
  }
};

const respondToAssistant = async (req, res) => {
  const message = req.body.message?.trim();
  const history = Array.isArray(req.body.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ message: 'Please enter a message for the assistant.' });
  }

  const sanitizedHistory = history
    .filter((entry) => entry && ['user', 'assistant'].includes(entry.role) && typeof entry.content === 'string')
    .slice(-6)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim().slice(0, 800),
    }))
    .filter((entry) => entry.content);

  const requiresHumanSupport = crisisPatterns.some((pattern) => pattern.test(message));
  const category = requiresHumanSupport ? 'suicide_support' : detectCategory(message);
  const [moodSummary, recommendedResources] = await Promise.all([
    getMoodSummary(req.user.id),
    getRecommendedResources(category),
  ]);

  if (requiresHumanSupport) {
    return res.json({
      mode: 'safety',
      requiresHumanSupport: true,
      reply: {
        role: 'assistant',
        content: createCrisisReply(),
      },
      recommendedResources,
      suggestedActions: createSuggestionSet(recommendedResources, true),
      moodSummary,
    });
  }

  let replyText = '';
  let mode = 'fallback';

  try {
    const geminiReply = await fetchGeminiReply({
      history: sanitizedHistory,
      message,
      moodSummary,
      resources: recommendedResources,
    });

    if (geminiReply) {
      replyText = geminiReply;
      mode = 'gemini';
    }
  } catch (_error) {
    mode = 'fallback';
  }

  if (!replyText) {
    replyText = createFallbackReply({
      message,
      category,
      moodSummary,
      requiresHumanSupport: false,
    });
  }

  return res.json({
    mode,
    requiresHumanSupport: false,
    reply: {
      role: 'assistant',
      content: replyText,
    },
    recommendedResources,
    suggestedActions: createSuggestionSet(recommendedResources, false),
    moodSummary,
  });
};

module.exports = {
  respondToAssistant,
};

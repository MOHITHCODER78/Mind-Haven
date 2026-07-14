const createArtwork = ({ title, subtitle, accentA = '#2f7c71', accentB = '#d8e8c0', accentC = '#f7efe5', glyph = 'MH' }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accentC}"/>
          <stop offset="55%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="${accentB}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${accentA}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${accentA}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="260" cy="250" r="180" fill="${accentA}" opacity="0.08"/>
      <circle cx="960" cy="220" r="220" fill="${accentA}" opacity="0.06"/>
      <circle cx="600" cy="450" r="280" fill="url(#glow)"/>
      <rect x="120" y="560" width="960" height="170" rx="40" fill="#ffffff" opacity="0.72"/>
      <rect x="170" y="610" width="320" height="22" rx="11" fill="${accentA}" opacity="0.8"/>
      <rect x="170" y="650" width="220" height="16" rx="8" fill="#6f7f79" opacity="0.35"/>
      <rect x="170" y="680" width="260" height="16" rx="8" fill="#6f7f79" opacity="0.25"/>
      <circle cx="880" cy="610" r="96" fill="${accentA}" opacity="0.15"/>
      <circle cx="1020" cy="665" r="58" fill="${accentB}" opacity="0.65"/>
      <circle cx="820" cy="685" r="34" fill="${accentA}" opacity="0.22"/>
      <text x="170" y="500" fill="#18302b" font-family="Arial, Helvetica, sans-serif" font-size="68" font-weight="700">${title}</text>
      <text x="170" y="548" fill="#4c6760" font-family="Arial, Helvetica, sans-serif" font-size="28">${subtitle}</text>
      <rect x="170" y="180" width="150" height="150" rx="36" fill="#ffffff" opacity="0.75"/>
      <text x="245" y="274" text-anchor="middle" fill="${accentA}" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">${glyph}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
};

export const pageImages = {
  homeHero: createArtwork({ title: 'Mind Haven', subtitle: 'Practical support for student life', glyph: 'MH' }),
  studentLogin: createArtwork({ title: 'Student sign in', subtitle: 'Use email OTP to continue', accentA: '#4aab9f', accentB: '#d8e8c0', glyph: 'OTP' }),
  supportLogin: createArtwork({ title: 'Support workspace', subtitle: 'Private conversations and follow-up', accentA: '#3d9487', accentB: '#dde8d0', glyph: 'CS' }),
  adminLogin: createArtwork({ title: 'Admin workspace', subtitle: 'Moderation and analytics in one view', accentA: '#c96b63', accentB: '#f2d7d3', glyph: 'AD' }),
  register: createArtwork({ title: 'Create your account', subtitle: 'A simple and private onboarding flow', accentA: '#73a88b', accentB: '#e6f0de', glyph: 'OK' }),
  assistant: createArtwork({ title: 'Assistant', subtitle: 'A calm space for one clear next step', accentA: '#2f7c71', accentB: '#d8e8c0', glyph: 'AI' }),
  resourcesBanner: createArtwork({ title: 'Resource library', subtitle: 'Short reads, guides, and videos', accentA: '#2f7c71', accentB: '#d8e8c0', glyph: 'RD' }),
  dashboardBanner: createArtwork({ title: 'Dashboard', subtitle: 'Mood, notes, and practical next steps', accentA: '#6f8f7b', accentB: '#e6efd9', glyph: 'DB' }),
};

const categoryCovers = {
  stress: [createArtwork({ title: 'Stress management', subtitle: 'A steadier way through pressure', accentA: '#3d9487', accentB: '#d8e8c0', glyph: 'ST' })],
  exam_stress: [createArtwork({ title: 'Exam stress', subtitle: 'Smaller steps before the next test', accentA: '#4aab9f', accentB: '#dde8d0', glyph: 'EX' })],
  anxiety: [createArtwork({ title: 'Anxiety', subtitle: 'Grounding tools for crowded moments', accentA: '#6b8acb', accentB: '#dce3f6', glyph: 'AN' })],
  depression: [createArtwork({ title: 'Depression awareness', subtitle: 'Gentle support for low-energy days', accentA: '#7d7db8', accentB: '#e4e4f3', glyph: 'DP' })],
  suicide_support: [createArtwork({ title: 'Crisis support', subtitle: 'Immediate help and safety first', accentA: '#c96b63', accentB: '#f5dfdb', glyph: 'CS' })],
  heartbreak: [createArtwork({ title: 'Relationships', subtitle: 'Recovery after rejection or breakup', accentA: '#d18b72', accentB: '#f5e5db', glyph: 'RL' })],
  motivation: [createArtwork({ title: 'Healthy habits', subtitle: 'Find momentum in small routines', accentA: '#73a88b', accentB: '#e4efe0', glyph: 'HB' })],
  sleep: [createArtwork({ title: 'Sleep', subtitle: 'Wind down and rest better tonight', accentA: '#758cc2', accentB: '#e0e6f4', glyph: 'SL' })],
  burnout: [createArtwork({ title: 'Burnout', subtitle: 'Recovery after long periods of strain', accentA: '#7f8f7a', accentB: '#e4eadf', glyph: 'BR' })],
  focus: [createArtwork({ title: 'Focus', subtitle: 'Return attention to one task', accentA: '#2f7c71', accentB: '#d8e8c0', glyph: 'FC' })],
};

export const getResourceCoverImage = (category, index = 0) => {
  const covers = categoryCovers[category];

  if (!covers || !covers.length) {
    return pageImages.resourcesBanner;
  }

  return covers[index % covers.length];
};

export const getPageImage = (key) => pageImages[key] || pageImages.homeHero;
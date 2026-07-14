import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, MessageCircleHeart, ShieldCheck, Sparkles } from 'lucide-react';
import { resourceHighlights, wallHighlights } from '../data/mockData';
import { getPageImage } from '../data/visualAssets';
import SectionHeading from '../components/shared/SectionHeading';
import { Reveal, HoverCard } from '../components/shared/Animations';

const faqs = [
  {
    question: 'What is Mind Haven?',
    answer: 'Mind Haven is a calm space for students to check in with their mood, explore practical resources, and reach out for support when things feel heavy.',
  },
  {
    question: 'Who is this for?',
    answer: 'Students who want a private way to notice patterns in how they feel, find practical guidance, or talk to someone before stress builds up.',
  },
  {
    question: 'Is this a replacement for therapy or crisis help?',
    answer: 'No. Mind Haven is not emergency care. It is a companion to professional support, not a substitute. If you are in crisis, contact your campus counselling service or emergency services.',
  },
  {
    question: 'When should I use support chat?',
    answer: 'Whenever you want to talk to a real person, feel overwhelmed, or need help that articles and exercises cannot provide on their own.',
  },
  {
    question: 'Will anyone see my posts or mood history?',
    answer: 'Your mood history stays private. Posts on the feelings wall are anonymous by design, and the space is moderated to keep conversations supportive.',
  },
];

const homepageStats = [
  { value: '24/7', label: 'Resources and support whenever you need them' },
  { value: '5 min', label: 'Reads designed for busy student weeks' },
  { value: 'Private', label: 'Your mood history stays personal' },
  { value: 'Moderated', label: 'A safer anonymous community space' },
];

const howItWorks = [
  {
    icon: Sparkles,
    title: 'Check in with yourself',
    description: 'Note how you feel, add a short thought, and see the week at a glance.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Take the next step',
    description: 'Browse a resource, share on the wall, or start a direct conversation with support.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep it safe',
    description: 'Your space stays yours. Anonymous posting, moderation, and clear roles keep things usable and protected.',
  },
];

const testimonials = [
  {
    quote: 'The interface feels calm and easy to trust. I can find help without digging through a cluttered dashboard.',
    name: 'Student user',
  },
  {
    quote: 'The support flow is straightforward. It keeps conversations organized and avoids unnecessary noise.',
    name: 'Counsellor',
  },
  {
    quote: 'The resource library is useful because it focuses on practical next steps instead of vague advice.',
    name: 'Peer mentor',
  },
];

const contactLinks = [
  { label: 'Email us', value: 'support@mindhaven.app', href: 'mailto:support@mindhaven.app' },
  { label: 'Support chat', value: 'Talk to a real person', href: '/chat' },
  { label: 'Resource library', value: 'Explore practical guidance', href: '/resources' },
];

function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="hero-panel home-hero">
          <div className="hero-copy">
            <p className="eyebrow">A calmer way to handle student life</p>
            <h2>Check in with yourself, find practical support, and reach help when you need it.</h2>
            <p>
              Mind Haven combines mood tracking, a moderated community wall, practical resources, and direct support routes in one quiet workspace.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/login">Get started</Link>
              <Link className="button secondary" to="/resources">Browse the library</Link>
              <Link className="button secondary" to="/chat">Talk to support</Link>
            </div>
          </div>
          <HoverCard>
            <div className="hero-card hero-visual-card premium-card">
              <div className="hero-image-shell">
                <img className="hero-image" src={getPageImage('homeHero')} alt="Student studying in a calm workspace" />
              </div>
              <div className="hero-visual-stack">
                <span className="status-pill">Support routes are ready</span>
                <div className="hero-visual-text">
                  <h3>Everything you need, grouped by the next best action</h3>
                  <p>The platform keeps private work, community support, and admin tools separated so each space stays clear and easy to use.</p>
                </div>
                <ul className="feature-list">
                  <li>Role-based access for students, support staff, and admins</li>
                  <li>Anonymous posting with moderation-aware design</li>
                  <li>Mood summaries and guided resource discovery</li>
                  <li>Real-time chat routes for support conversations</li>
                </ul>
              </div>
            </div>
          </HoverCard>
        </section>
      </Reveal>

      <section className="grid-section">
        <Reveal delay={0.12} y={28}>
          <div className="panel">
            <SectionHeading
              eyebrow="At a glance"
              title="Steady support, less noise"
              description="The platform is built around one idea: help students notice what they need, and make the next step easy."
            />
            <div className="card-grid stats-grid">
              {homepageStats.map((stat) => (
                <article key={stat.label} className="metric-card stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="grid-section">
        <Reveal delay={0.16} y={30}>
          <div className="panel">
            <SectionHeading
              eyebrow="How it works"
              title="A simple path when you are ready"
              description="No complex dashboards or guesswork. Check in, choose what feels useful, and move forward at your own pace."
            />
            <div className="card-grid process-grid">
              {howItWorks.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="info-card process-card">
                    <span className="icon-badge"><Icon size={18} strokeWidth={2.2} /></span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="grid-section two-up">
        <Reveal delay={0.2} y={30}>
          <div className="panel soft-panel">
            <SectionHeading
              eyebrow="Resource hub"
              title="Practical support, not filler"
              description="Short reads, guided exercises, and tools grouped by what students actually need on a busy week."
            />
            <div className="card-grid compact">
              {resourceHighlights.map((item) => (
                <HoverCard key={item.title}>
                  <article className="info-card">
                    <span className="tag">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </article>
                </HoverCard>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.3} y={30}>
          <div className="panel accent-panel">
            <SectionHeading
              eyebrow="Anonymous support"
              title="Share without showing who you are"
              description="Post thoughts and reactions anonymously in a moderated space that keeps conversation supportive and readable."
            />
            <div className="wall-preview">
              {wallHighlights.map((item) => (
                <HoverCard key={item.message}>
                  <article className="wall-card">
                    <p>{item.message}</p>
                    <div className="wall-meta">
                      <span className="tag muted">{item.tag}</span>
                      <span>{item.support} support reactions</span>
                    </div>
                  </article>
                </HoverCard>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="grid-section">
        <Reveal delay={0.22} y={28}>
          <div className="panel">
            <SectionHeading
              eyebrow="What students say"
              title="Quietly built for how students actually feel"
              description="The goal is to feel like a tool made by people who understand pressure, not a product designed to look productive."
            />
            <div className="card-grid testimonial-grid">
              {testimonials.map((item) => (
                <article key={item.name} className="info-card testimonial-card">
                  <p>“{item.quote}”</p>
                  <strong>{item.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal delay={0.2}>
        <section id="faqs" className="panel faq-panel">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Questions worth asking upfront"
            description="These are the questions students ask most often before they decide to use the platform."
          />
          <div className="faq-list">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <motion.article
                  key={item.question}
                  className={`faq-item${isOpen ? ' open' : ''}`}
                  initial={false}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={20} strokeWidth={2.2} className={isOpen ? 'faq-icon open' : 'faq-icon'} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        <p>{item.answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.18} y={24}>
        <section className="panel contact-panel">
          <SectionHeading
            eyebrow="Contact"
            title="Not sure where to start?"
            description="Use the support email for general questions, or open the support chat if you want to talk to someone directly."
          />
          <div className="contact-grid">
            {contactLinks.map((item) => (
              <a key={item.label} className="contact-card" href={item.href}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <ArrowRight size={16} strokeWidth={2.1} />
              </a>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

export default HomePage;

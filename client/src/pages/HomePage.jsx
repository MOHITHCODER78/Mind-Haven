import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { resourceHighlights, wallHighlights } from '../data/mockData';
import HeroIllustration from '../components/shared/illustrations/HeroIllustration';
import SectionHeading from '../components/shared/SectionHeading';
import { Reveal, HoverCard, Floating } from '../components/shared/Animations';

const faqs = [
  {
    question: 'What is Mind Haven?',
    answer:
      'Mind Haven is a student mental wellness platform that brings together mood tracking, guided self-help, private support chat, an AI assistant, and a moderated feelings wall in one calm space.',
  },
  {
    question: 'Who is Mind Haven for?',
    answer:
      'It is designed for students who want a private place to check in with themselves, find practical support, or reach out before stress, burnout, or loneliness starts to feel too heavy.',
  },
  {
    question: 'What Mind Haven is not',
    answer:
      'Mind Haven is not emergency care, diagnosis, or a replacement for licensed therapy. It is a supportive platform that helps students reflect, get grounded, and connect with the right next step.',
  },
  {
    question: 'When should I choose support chat over self-help tools?',
    answer:
      'Choose support chat when you want a human conversation, feel stuck, or need reassurance that goes beyond articles and exercises. Use self-help tools when you want quick, private guidance at your own pace.',
  },
  {
    question: 'Does Mind Haven provide therapy?',
    answer:
      'No. Mind Haven supports students with guided tools, wellbeing resources, and supportive workflows, but it does not directly provide licensed therapy inside the app.',
  },
  {
    question: 'Is my information private?',
    answer:
      'Yes. The platform is designed to keep student wellbeing interactions private, and features like the feelings wall are built around anonymity and safer moderation-aware sharing.',
  },
];

function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Safe, private, supportive</p>
            <h2>A professional mental health support platform built for students.</h2>
            <p>
              Anonymous expression, guided self-help, mood tracking, and verified support channels in one calm digital space.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/dashboard">Explore Dashboard</Link>
              <Link className="button secondary" to="/resources">Browse Resources</Link>
            </div>
          </div>
          <HoverCard>
            <div className="hero-card hero-visual-card">
              <Floating>
                <HeroIllustration className="section-illustration hero-illustration" />
              </Floating>
              <span className="status-pill">Live wellness features</span>
              <h3>Why this project stands out</h3>
              <ul className="feature-list">
                <li>Role-based auth for students, admins, and counsellors</li>
                <li>Anonymous wall with moderation-friendly design</li>
                <li>Mood analytics and guided resource discovery</li>
                <li>Real-time support chat foundation with Socket.IO</li>
              </ul>
            </div>
          </HoverCard>
        </section>
      </Reveal>

      <section className="grid-section two-up">
        <Reveal delay={0.2} y={30}>
          <div className="panel soft-panel">
            <SectionHeading
              eyebrow="Resource hub"
              title="Curated support students can actually use"
              description="The platform mixes fast relief tools with deeper content so students can get help in the way that suits the moment."
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
              title="Students can share feelings without exposing identity"
              description="This is one of the strongest modules because it combines privacy, moderation, and community care in a single workflow."
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

      <Reveal delay={0.2}>
        <section id="faqs" className="panel faq-panel">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Common questions, answered clearly"
            description="If you are not sure where to start, these are the answers most students look for first."
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
    </div>
  );
}

export default HomePage;

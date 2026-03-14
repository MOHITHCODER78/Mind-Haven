import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, SendHorizonal, Sparkles } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';
import assistantHero from '../assets/images/assistant-hero.png.png';

const starterPrompts = [
  "I'm feeling overwhelmed",
  'How can I reduce stress?',
  'Give me a quick breathing exercise',
];

const createMessage = (role, content) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
});

function AiAssistantPage() {
  const threadRef = useRef(null);
  const [messages, setMessages] = useState([
    createMessage(
      'assistant',
      'I am here to help you slow things down, find your footing, and take one clear next step. You can be brief, messy, or honest.'
    ),
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('guided');
  const [moodSummary, setMoodSummary] = useState(null);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (messageText) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || sending) {
      return;
    }

    const userMessage = createMessage('user', trimmedMessage);
    const history = messages.map((message) => ({ role: message.role, content: message.content }));

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setError('');
    setSending(true);

    try {
      const response = await api.post('/assistant/respond', {
        message: trimmedMessage,
        history,
      });

      setMessages((current) => [...current, createMessage('assistant', response.data.reply?.content || 'I could not form a response just now.')]);
      setMode(response.data.mode || 'guided');
      setMoodSummary(response.data.moodSummary || null);
      setRecommendedResources(response.data.recommendedResources || []);
      setSuggestedActions(response.data.suggestedActions || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reach the assistant right now.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleSend(draft);
  };

  const modeLabel = mode === 'gemini' ? 'Gemini live' : mode === 'safety' ? 'Safety-first guidance' : 'Guided support mode';

  return (
    <div className="page-stack">
      <section className="dashboard-hero panel compact-dashboard-hero">
        <div>
          <p className="eyebrow">AI assistant</p>
          <h2>A calm space for overloaded moments, quick grounding, and honest reflection.</h2>
          <p>
            This assistant is supportive and practical, but it is not a therapist or emergency service. If you feel unsafe, contact urgent human help right away.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/chat">Open support chat</Link>
            <Link className="button secondary" to="/resources">Browse resources</Link>
          </div>
        </div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="assistant-summary-card">
          <img className="section-illustration assistant-illustration" src={assistantHero} alt="AI assistant support illustration" />
          <span className="status-pill">{modeLabel}</span>
          <strong>Use this when you need clarity, grounding, or one small next step.</strong>
          <p>
            It can reflect what you share, use your recent mood context, and point you toward the most relevant Mind Haven guides.
          </p>
          {moodSummary ? (
            <div className="assistant-mood-summary">
              <span>Latest mood</span>
              <strong>{moodSummary.latestMoodLabel} ({moodSummary.latestMoodScore}/5)</strong>
              <span>Recent average: {moodSummary.averageMood}/5</span>
            </div>
          ) : (
            <p className="muted-inline">No recent mood data yet. A quick mood check-in can make support suggestions more personal.</p>
          )}
        </motion.div>
      </section>

      <section className="grid-section two-up assistant-layout">
        <div className="assistant-side-stack">
          <div className="panel compact-panel assistant-side-panel">
            <SectionHeading
              eyebrow="Prompt ideas"
              title="Start gently"
              description="Tap a prompt if you want help getting the first words out."
            />
            <div className="assistant-prompt-list assistant-chip-row">
              {starterPrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  type="button"
                  className="assistant-prompt-button"
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setDraft(prompt)}
                >
                  <Sparkles size={16} strokeWidth={2.1} />
                  <span>{prompt}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="panel compact-panel assistant-side-panel">
            <SectionHeading
              eyebrow="Suggested actions"
              title="Keep support close"
              description="If you want something more concrete than a conversation, use one of these next steps."
            />
            <div className="assistant-action-list">
              {suggestedActions.length ? suggestedActions.map((action) => (
                action.type === 'external' ? (
                  <motion.a key={action.label} className="assistant-action-card" href={action.to} target="_blank" rel="noreferrer" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </motion.a>
                ) : (
                  <motion.div key={action.label} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Link className="assistant-action-card" to={action.to}>
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </Link>
                  </motion.div>
                )
              )) : (
                <div className="assistant-action-card static">
                  <strong>Support chat and resources will appear here</strong>
                  <span>Once you send a message, the assistant will suggest the most useful next steps.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel compact-panel assistant-chat-shell">
          <div className="chat-panel-header assistant-chat-header">
            <div>
              <h3>Mind Haven assistant</h3>
              <p>Share what is on your mind. There is no need to phrase it perfectly.</p>
            </div>
            <span className="status-chip"><Bot size={14} strokeWidth={2.1} /> Students only</span>
          </div>

          <div ref={threadRef} className="assistant-thread">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.article
                  key={message.id}
                  className={message.role === 'user' ? 'assistant-message user' : 'assistant-message'}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <span>{message.role === 'user' ? 'You' : 'Assistant'}</span>
                  <p>{message.content}</p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <form className="assistant-composer assistant-chat-input" onSubmit={handleSubmit}>
            <div className="assistant-input-shell">
              <textarea
                rows="4"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type what is weighing on you..."
                maxLength="1200"
              />
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="resource-actions assistant-composer-actions">
              <button className="button secondary" type="button" onClick={() => setDraft('')} disabled={sending || !draft}>
                Clear
              </button>
              <button className="button primary" type="submit" disabled={sending || !draft.trim()}>
                <SendHorizonal size={16} strokeWidth={2.2} />
                <span>{sending ? 'Thinking...' : 'Send message'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="Recommended resources"
          title="Helpful reads tied to your conversation"
          description="The assistant pulls from the same Mind Haven resource library you already use elsewhere in the app."
        />
        <div className="card-grid assistant-resource-grid">
          {recommendedResources.length ? recommendedResources.map((resource) => (
            resource.internal ? (
              <motion.div key={resource.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Link className="resource-card hero-card" to={`/resources/${resource.id}`}>
                  <div className="resource-card-top">
                    <span className="tag">{resource.category.replace('_', ' ')}</span>
                    <span>{resource.sourceName || 'Mind Haven'}</span>
                  </div>
                  <strong>{resource.title}</strong>
                  <p>{resource.summary}</p>
                </Link>
              </motion.div>
            ) : (
              <motion.a key={resource.id} className="resource-card hero-card" href={resource.url} target="_blank" rel="noreferrer" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <div className="resource-card-top">
                  <span className="tag">{resource.category.replace('_', ' ')}</span>
                  <span>{resource.sourceName || 'External'}</span>
                </div>
                <strong>{resource.title}</strong>
                <p>{resource.summary}</p>
              </motion.a>
            )
          )) : (
            <article className="resource-card hero-card">
              <strong>Your assistant suggestions will appear here.</strong>
              <p>After the first message, you will see tailored articles and guides connected to what you are working through.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

export default AiAssistantPage;

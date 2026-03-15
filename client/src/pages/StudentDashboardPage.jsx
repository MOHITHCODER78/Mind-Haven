import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import SectionHeading from '../components/shared/SectionHeading';
import useAuth from '../context/useAuth';
import api from '../services/api';
import { Reveal, HoverCard } from '../components/shared/Animations';
import { Calendar, MessageSquare, BookOpen, BarChart3, Heart, Zap } from 'lucide-react';

function StudentDashboardPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [moodsResponse, recommendationsResponse] = await Promise.all([
        api.get('/moods'),
        api.get('/resources/recommendations'),
      ]);
      setLogs(moodsResponse.data.logs || []);
      setStats(moodsResponse.data.stats || { currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
      setRecommendations(recommendationsResponse.data.recommendations || []);
    } catch (err) {
      console.error('Data sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="panel" style={{ padding: '2rem 2.5rem', background: 'rgba(255,255,255,0.6)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background glow for streak */}
          {stats.currentStreak > 0 && (
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(47, 124, 113, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 600 }}>Student Overview</p>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]}</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>Here is a summary of your recent wellness journey.</p>

            <div className="metrics-grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <Reveal delay={0.1} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff', border: stats.currentStreak > 0 ? '1.5px solid rgba(47, 124, 113, 0.2)' : '' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: stats.currentStreak > 0 ? 'var(--primary)' : 'inherit' }}>
                      {stats.currentStreak > 0 ? <Zap size={18} fill="currentColor" /> : <Calendar size={18} />} Streak
                    </span>
                    <strong>{stats.currentStreak} Days</strong>
                  </div>
                </HoverCard>
              </Reveal>
              <Reveal delay={0.2} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Heart size={18} /> Avg Mood
                    </span>
                    <strong>{stats.averageMood} / 5</strong>
                  </div>
                </HoverCard>
              </Reveal>
              <Reveal delay={0.3} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={18} /> Logs
                    </span>
                    <strong>{logs.length}</strong>
                  </div>
                </HoverCard>
              </Reveal>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="grid-section two-up">
        {/* ── Recent Trend (Visual Snippet) ── */}
        <Reveal delay={0.2} path="left">
          <div className="panel chart-panel">
            <SectionHeading title="Recent Trend" description="Your emotional pulse over the last 7 days." />
            <div className="chart-wrap" style={{ height: '180px', marginTop: '1rem', opacity: logs.length ? 1 : 0.3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs.slice(-7).map(l => ({ mood: l.moodScore }))}>
                  <Area type="monotone" dataKey="mood" stroke="#2f7c71" fill="#2f7c71" fillOpacity={0.1} strokeWidth={2} />
                  <YAxis domain={[1, 5]} hide />
                  <XAxis hide />
                </AreaChart>
              </ResponsiveContainer>
              {!logs.length && <p style={{ textAlign: 'center', marginTop: '-100px', fontWeight: 600 }}>No logs yet</p>}
            </div>
            <Link to="/mood-tracker" className="button secondary" style={{ width: '100%', marginTop: '1.5rem' }}>View Detail Tracker</Link>
          </div>
        </Reveal>

        {/* ── Quick Actions ── */}
        <Reveal delay={0.3} path="right">
          <div className="panel" style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
            <SectionHeading title="Quick Links" description="Most used tools by students." />
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <HoverCard>
                <Link to="/mood-tracker" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Calendar size={20} color="var(--primary)" />
                  <div>
                    <strong>Daily Check-in</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Log your mood for today</p>
                  </div>
                </Link>
              </HoverCard>
              <HoverCard>
                <Link to="/assistant" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <MessageSquare size={20} color="var(--primary)" />
                  <div>
                    <strong>Talk to AI Assistant</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Get instant emotional support</p>
                  </div>
                </Link>
              </HoverCard>
              <HoverCard>
                <Link to="/resources" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <BookOpen size={20} color="var(--primary)" />
                  <div>
                    <strong>Browse Resources</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Read mental wellness guides</p>
                  </div>
                </Link>
              </HoverCard>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Top Recommendations ── */}
      <Reveal delay={0.4}>
        <section className="panel compact-panel">
          <SectionHeading
            title="Recommended for You"
            description="Curated based on your recent activity."
          />
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {recommendations.slice(0, 3).map((resource, idx) => (
              <Reveal key={resource.id} delay={0.1 * idx} y={20}>
                <HoverCard>
                  <article className="info-card resource-card">
                    <span className="tag">{resource.category.replace('_', ' ')}</span>
                    <h3 style={{ marginTop: '0.5rem' }}>{resource.title}</h3>
                    <p style={{ fontSize: '0.9rem' }}>{resource.summary}</p>
                    <Link className="text-button" to={`/resources/${resource.id}`} style={{ marginTop: 'auto' }}>Read Article</Link>
                  </article>
                </HoverCard>
              </Reveal>
            ))}
            {!recommendations.length && <p>Log some moods to get personalized recommendations!</p>}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

export default StudentDashboardPage;

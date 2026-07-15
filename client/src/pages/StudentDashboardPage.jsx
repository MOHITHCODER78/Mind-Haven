import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';
import useAuth from '../context/useAuth';
import api from '../services/api';
import { Reveal, HoverCard } from '../components/shared/Animations';
import { Calendar, MessageSquare, BookOpen, BarChart3, Heart, Zap } from 'lucide-react';
import RecommendationCard from '../components/shared/MemoizedResources';

const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const Area = lazy(() => import('recharts').then(module => ({ default: module.Area })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));

function StudentDashboardPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
  const [recommendations, setRecommendations] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [moodsResponse, recommendationsResponse] = await Promise.all([
        api.get('/api/moods'),
        api.get('/api/resources/recommendations'),
      ]);
      setLogs(moodsResponse.data.logs || []);
      setStats(moodsResponse.data.stats || { currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
      setRecommendations(recommendationsResponse.data.recommendations || []);
    } catch (_err) {
      console.error('Data sync failed');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-stack">
      <Reveal>
        <section className="panel" style={{ padding: '2rem 2.5rem', background: 'rgba(255,255,255,0.6)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background glow for streak */}
          {stats.currentStreak > 0 && (
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(47, 124, 113, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 600 }}>Your space</p>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]}</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>A quick look at how you have been feeling and a few ideas for what might help next.</p>

            <div className="metrics-grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <Reveal delay={0.1} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff', border: stats.currentStreak > 0 ? '1.5px solid rgba(47, 124, 113, 0.2)' : '' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: stats.currentStreak > 0 ? 'var(--primary)' : 'inherit' }}>
                      {stats.currentStreak > 0 ? <Zap size={18} fill="currentColor" /> : <Calendar size={18} />} Check-in streak
                    </span>
                    <strong>{stats.currentStreak} days</strong>
                  </div>
                </HoverCard>
              </Reveal>
              <Reveal delay={0.2} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Heart size={18} /> Mood average
                    </span>
                    <strong>{stats.averageMood} / 5</strong>
                  </div>
                </HoverCard>
              </Reveal>
              <Reveal delay={0.3} y={15}>
                <HoverCard>
                  <div className="metric-card" style={{ padding: '1.5rem', background: '#fff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={18} /> Entries
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
            <SectionHeading title="Recent trend" description="Your mood over the past week." />
            <div className="chart-wrap" style={{ height: '180px', marginTop: '1rem', opacity: logs.length ? 1 : 0.3 }}>
              <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs.slice(-7).map(l => ({ mood: l.moodScore }))}>
                    <Area type="monotone" dataKey="mood" stroke="#2f7c71" fill="#2f7c71" fillOpacity={0.1} strokeWidth={2} />
                    <YAxis domain={[1, 5]} hide />
                    <XAxis hide />
                  </AreaChart>
                </ResponsiveContainer>
              </Suspense>
              {!logs.length && <p style={{ textAlign: 'center', marginTop: '-100px', fontWeight: 600 }}>No entries yet</p>}
            </div>
            <Link to="/mood-tracker" className="button secondary" style={{ width: '100%', marginTop: '1.5rem' }}>Open tracker</Link>
          </div>
        </Reveal>

        {/* ── Quick Actions ── */}
        <Reveal delay={0.3} path="right">
          <div className="panel" style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
            <SectionHeading title="Quick links" description="A few places to start when you are ready." />
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <HoverCard>
                <Link to="/mood-tracker" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Calendar size={20} color="var(--primary)" />
                  <div>
                    <strong>Daily check-in</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Add a short note about how you are feeling</p>
                  </div>
                </Link>
              </HoverCard>
              <HoverCard>
                <Link to="/assistant" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <MessageSquare size={20} color="var(--primary)" />
                  <div>
                    <strong>Open assistant</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Talk through something when you need a moment to slow down</p>
                  </div>
                </Link>
              </HoverCard>
              <HoverCard>
                <Link to="/resources" className="assistant-prompt-button" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <BookOpen size={20} color="var(--primary)" />
                  <div>
                    <strong>Browse resources</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Find practical guides and short reads</p>
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
          <SectionHeading title="For you" description="A few suggestions based on what you have been exploring." />
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {recommendations.slice(0, 3).map((resource, idx) => (
              <Reveal key={resource.id} delay={0.1 * idx} y={20}>
                <RecommendationCard resource={resource} index={idx} />
              </Reveal>
            ))}
            {!recommendations.length && <p>Keep checking in and we will suggest things that might help.</p>}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

export default StudentDashboardPage;
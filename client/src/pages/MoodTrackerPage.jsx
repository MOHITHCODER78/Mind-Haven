import { useEffect, useState, lazy, Suspense } from 'react';
import { Reveal, HoverCard } from '../components/shared/Animations';
import MoodAnalytics from '../components/shared/MoodAnalytics';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const Area = lazy(() => import('recharts').then(module => ({ default: module.Area })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));

const moodOptions = [
    { score: 1, label: 'Low' },
    { score: 2, label: 'Uneasy' },
    { score: 3, label: 'Steady' },
    { score: 4, label: 'Good' },
    { score: 5, label: 'Great' },
];

function MoodTrackerPage() {
    const [logs, setLogs] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [fetchError, setFetchError] = useState('');
    const [formData, setFormData] = useState({ moodScore: 3, note: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        setFetchError('');

        try {
            const response = await api.get('/api/moods');
            setLogs(response.data.logs || []);
        // eslint-disable-next-line no-unused-vars
        } catch (_err) {
            setFetchError('We could not load your mood history right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await api.post('/api/moods', formData);
            setMessage('Your check-in has been saved.');
            setFormData((current) => ({ ...current, note: '' }));
            fetchLogs();
        // eslint-disable-next-line no-unused-vars
        } catch (_err) {
            setMessage('We could not save this check-in. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-stack">
            <Reveal>
                <section className="panel compact-panel hero-panel" style={{ gridTemplateColumns: '1fr', padding: '2.5rem' }}>
                        <SectionHeading
                            eyebrow="Mood tracker"
                            title="How have you been feeling?"
                            description="Log a quick check-in, add a short note if you like, and see what shows up over time."
                        />
                </section>
            </Reveal>

            <section className="panel">
            <SectionHeading title="Daily check-in" description="Pick the mood that fits best. A short note helps later, but it is optional." />
                <form
                    className="resource-form"
                    onSubmit={handleSubmit}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}
                >
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <label>
                            <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Which mood fits today?</span>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {moodOptions.map(opt => (
                                    <button
                                        key={opt.score}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, moodScore: opt.score })}
                                        style={{
                                          padding: '0.75rem 1.25rem',
                                          borderRadius: '12px',
                                          border: formData.moodScore === opt.score ? '2px solid var(--primary)' : '1px solid #e0e0e0',
                                          backgroundColor: formData.moodScore === opt.score ? 'rgba(47, 124, 113, 0.05)' : '#fff',
                                          color: formData.moodScore === opt.score ? 'var(--primary)' : '#666',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </label>
                        <button className="button primary" style={{ width: 'fit-content' }} disabled={saving}>
                            {saving ? 'Saving...' : 'Save entry'}
                        </button>
                        {message && <p className="form-success">{message}</p>}
                    </div>

                    <label style={{ margin: 0 }}>
                        <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Private note</span>
                        <textarea
                            rows="5"
                            placeholder="What is on your mind today?"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            style={{ borderRadius: '16px', padding: '1.25rem' }}
                        />
                    </label>
                </form>
            </section>

            <section className="grid-section two-up">
                <Reveal delay={0.2}>
                    <div className="panel" style={{ height: '100%' }}>
                        <SectionHeading title="Past week" description="A simple view of your recent check-ins." />
                        <div className="chart-wrap" style={{ height: '300px', marginTop: '1.5rem' }}>
                            <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={logs.map(l => ({ day: l.day, mood: l.moodScore }))}>
                                        <defs>
                                            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2f7c71" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2f7c71" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} style={{ fontSize: '0.8rem' }} />
                                        <YAxis domain={[1, 5]} hide />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                                        <Area type="monotone" dataKey="mood" stroke="#2f7c71" fillOpacity={1} fill="url(#moodGrad)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Suspense>
                        </div>
                    </div>
                </Reveal>

                <MoodAnalytics logs={logs} />
            </section>

            <Reveal delay={0.4}>
                <section className="panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <SectionHeading title="Recent notes" description="The thoughts you jotted down with your last check-ins." />
                    <div className="mood-log-strip" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginTop: '1.5rem' }}>
                        {logs.slice(0, 6).map((log, idx) => (
                            <Reveal key={log.id} delay={0.1 * idx} y={15}>
                                <HoverCard>
                                    <div className="mood-log-card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid #efefef' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>{log.day}</span>
                                            <span className={`sentiment-pill ${log.sentimentLabel}`} style={{ textTransform: 'capitalize' }}>{log.sentimentLabel}</span>
                                        </div>
                                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                                            {moodOptions.find(o => o.score === log.moodScore)?.label}
                                        </strong>
                                        <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                            {log.note || 'No note was added for this check-in.'}
                                        </p>
                                    </div>
                                </HoverCard>
                            </Reveal>
                        ))}
                        {!logs.length && <p style={{ color: 'var(--muted)' }}>No entries yet. Your first check-in will show up here.</p>}
                    </div>
                </section>
            </Reveal>
        </div>
    );
}

export default MoodTrackerPage;
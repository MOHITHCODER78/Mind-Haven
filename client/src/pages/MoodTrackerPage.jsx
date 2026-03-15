import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

const moodOptions = [
    { score: 1, label: 'Low' },
    { score: 2, label: 'Uneasy' },
    { score: 3, label: 'Steady' },
    { score: 4, label: 'Good' },
    { score: 5, label: 'Great' },
];

function MoodTrackerPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ moodScore: 3, note: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/moods');
            setLogs(response.data.logs || []);
        } catch (err) {
            setError('Unable to fetch your mood history.');
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
            await api.post('/moods', formData);
            setMessage('Mood logged successfully!');
            setFormData({ ...formData, note: '' });
            fetchLogs();
        } catch (err) {
            setError('Could not save your mood.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-stack">
            <section className="panel compact-panel hero-panel" style={{ gridTemplateColumns: '1fr', padding: '2.5rem' }}>
                <SectionHeading
                    eyebrow="Personal Tracker"
                    title="Mood & Emotional Journal"
                    description="Consistent tracking helps you identify triggers and celebrate progress in your mental well-being Journey."
                />
            </section>

            <section className="grid-section two-up">
                <div className="panel">
                    <SectionHeading title="Daily Check-in" />
                    <form className="resource-form" onSubmit={handleSubmit}>
                        <label>
                            <span>How are you feeling?</span>
                            <select
                                value={formData.moodScore}
                                onChange={(e) => setFormData({ ...formData, moodScore: Number(e.target.value) })}
                            >
                                {moodOptions.map(opt => (
                                    <option key={opt.score} value={opt.score}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Journal entry (Optional)</span>
                            <textarea
                                rows="6"
                                placeholder="What's on your mind? Writing it down helps clear the mental noise."
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </label>
                        {message && <p className="form-success">{message}</p>}
                        {error && <p className="form-error">{error}</p>}
                        <button className="button primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Complete Check-in'}
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <SectionHeading title="Mood Trend" />
                    <div className="chart-wrap" style={{ height: '320px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={logs.map(l => ({ day: l.day, mood: l.moodScore }))}>
                                <defs>
                                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2f7c71" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2f7c71" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis domain={[1, 5]} hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="mood" stroke="#2f7c71" fillOpacity={1} fill="url(#moodGrad)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="panel">
                <SectionHeading title="Recent Entries" />
                <div className="mood-log-strip" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {logs.slice(0, 6).map(log => (
                        <div key={log.id} className="mood-log-card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span className="eyebrow">{log.day}</span>
                                <span className={`sentiment-pill ${log.sentimentLabel}`}>{log.sentimentLabel}</span>
                            </div>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                                {moodOptions.find(o => o.score === log.moodScore)?.label}
                            </strong>
                            <p style={{ fontStyle: 'italic' }}>"{log.note || 'No note added for this day.'}"</p>
                        </div>
                    ))}
                    {!logs.length && <p>No mood logs found. Start by completing a check-in!</p>}
                </div>
            </section>
        </div>
    );
}

export default MoodTrackerPage;

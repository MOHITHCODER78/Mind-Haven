import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Reveal } from './Animations';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#2f7c71'];
const LABELS = ['Low', 'Uneasy', 'Steady', 'Good', 'Great'];

const MoodAnalytics = ({ logs }) => {
    // Calculate distribution
    const distribution = logs.reduce((acc, log) => {
        const score = Math.round(log.moodScore);
        acc[score - 1] = (acc[score - 1] || 0) + 1;
        return acc;
    }, [0, 0, 0, 0, 0]);

    const data = distribution.map((count, index) => ({
        name: LABELS[index],
        value: count
    })).filter(d => d.value > 0);

    return (
        <Reveal delay={0.2}>
            <div className="analytics-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #efefef' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Mood Distribution</h3>
                <div style={{ height: '240px' }}>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[LABELS.indexOf(entry.name)]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            Log more moods to see insights
                        </div>
                    )}
                </div>
            </div>
        </Reveal>
    );
};

export default MoodAnalytics;

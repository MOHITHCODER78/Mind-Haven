import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import useAuth from '../context/useAuth';
import api from '../services/api';
import dashboardBanner from '../assets/images/dashboard-banner.png.png';

const moodOptions = [
  { score: 1, label: 'Low' },
  { score: 2, label: 'Uneasy' },
  { score: 3, label: 'Steady' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Great' },
];

function StudentDashboardPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
  const [recommendations, setRecommendations] = useState([]);
  const [recommendedCategories, setRecommendedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ moodScore: 3, note: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const metrics = useMemo(
    () => [
      { label: 'Mood logs tracked', value: String(logs.length).padStart(2, '0') },
      { label: 'Current streak', value: String(stats.currentStreak).padStart(2, '0') },
      { label: 'Average mood', value: stats.averageMood ? stats.averageMood.toFixed(1) : '0.0' },
      { label: 'Latest mood', value: logs.length ? logs[logs.length - 1].moodLabel : 'None' },
    ],
    [logs, stats]
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [moodsResponse, recommendationsResponse] = await Promise.all([
        api.get('/moods'),
        api.get('/resources/recommendations'),
      ]);
      setLogs(moodsResponse.data.logs || []);
      setStats(moodsResponse.data.stats || { currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } });
      setRecommendations(recommendationsResponse.data.recommendations || []);
      setRecommendedCategories(recommendationsResponse.data.categories || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your dashboard right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: name === 'moodScore' ? Number(value) : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const response = await api.post('/moods', formData);
      setMessage(response.data.message);
      setFormData((current) => ({ ...current, note: '' }));
      await fetchDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your mood right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="dashboard-hero panel compact-dashboard-hero">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h2>Track your mood and notice patterns before stress becomes overload.</h2>
          <p>{user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Your private support space is ready.'}</p>
          <div className="hero-actions">
            <Link className="button primary" to="/assistant">Talk to AI assistant</Link>
            <Link className="button secondary" to="/chat">Open support chat</Link>
          </div>
        </div>
        <div className="dashboard-hero-side">
          <img className="section-illustration dashboard-banner-image" src={dashboardBanner} alt="Student dashboard wellness illustration" />
          <div className="metrics-grid compact-metrics-grid">
            {metrics.map((metric) => (
              <article key={metric.label} className="metric-card compact-metric-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-section two-up dashboard-layout-compact">
        <div className="panel chart-panel compact-panel">
          <SectionHeading
            eyebrow="Mood tracker"
            title="Your recent mood trend"
            description="A simple visual snapshot of the last several check-ins so you can spot patterns early."
          />
          {loading ? <p>Loading mood history...</p> : null}
          {!loading && error ? <p className="form-error">{error}</p> : null}
          {!loading && !error ? (
            <>
              <div className="chart-wrap compact-chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={logs.map((log) => ({ day: log.day, mood: log.moodScore }))}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#2f7c71" stopOpacity={0.42} />
                        <stop offset="95%" stopColor="#2f7c71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#d9e6e0" strokeDasharray="4 4" />
                    <XAxis dataKey="day" stroke="#57706a" />
                    <YAxis domain={[1, 5]} stroke="#57706a" />
                    <Tooltip />
                    <Area type="monotone" dataKey="mood" stroke="#2f7c71" fill="url(#moodGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mood-log-strip">
                {logs.slice(-5).map((log) => (
                  <article key={log.id || `${log.day}-${log.moodScore}`} className="mood-log-card">
                    <span>{log.day}</span>
                    <strong>{log.moodLabel}</strong>
                    <p>{log.note || 'No note added.'}</p>
                    <span className={`sentiment-pill ${log.sentimentLabel || 'neutral'}`}>
                      {log.sentimentLabel || 'neutral'} sentiment
                    </span>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="panel compact-panel mood-form-panel">
          <SectionHeading
            eyebrow="Daily check-in"
            title="Log how today feels"
            description="One check-in per day is enough. Updating the same day will replace today's entry instead of cluttering the history."
          />
          <form className="resource-form" onSubmit={handleSubmit}>
            <label>
              <span>Mood score</span>
              <select name="moodScore" value={formData.moodScore} onChange={handleChange}>
                {moodOptions.map((option) => (
                  <option key={option.score} value={option.score}>{option.score} - {option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Short note</span>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="5"
                maxLength="280"
                placeholder="What influenced your mood today?"
              />
            </label>
            <div className="sentiment-summary-row">
              <span className="sentiment-pill positive">Positive notes: {stats.sentimentSummary?.positive || 0}</span>
              <span className="sentiment-pill neutral">Neutral notes: {stats.sentimentSummary?.neutral || 0}</span>
              <span className="sentiment-pill negative">Negative notes: {stats.sentimentSummary?.negative || 0}</span>
            </div>
            {message ? <p className="form-success">{message}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : "Save today's mood"}
            </button>
          </form>
        </div>
      </section>

      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="Recommendations"
          title="Resources matched to your recent mood pattern"
          description={recommendedCategories.length ? `Current focus areas: ${recommendedCategories.map((category) => category.replace('_', ' ')).join(', ')}.` : 'These suggestions adapt as you log more moods and notes.'}
        />
        {loading ? <p>Loading recommendations...</p> : null}
        {!loading && !error ? (
          <div className="card-grid recommendation-grid">
            {recommendations.map((resource) => (
              <article key={resource.id} className="info-card resource-card recommendation-card">
                <div className="resource-card-top">
                  <span className="tag">{resource.category.replace('_', ' ')}</span>
                  {resource.featured ? <span className="tag muted">Featured</span> : null}
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <p className="recommendation-reason">{resource.recommendationReason}</p>
                <div className="resource-actions">
                  <span className="muted-inline">{resource.sourceName || 'Curated source'}</span>
                  {resource.internal ? (
                    <Link className="text-button" to={`/resources/${resource.id}`}>
                      Read inside app
                    </Link>
                  ) : resource.url ? (
                    <a className="text-button" href={resource.url} target="_blank" rel="noreferrer">Open source</a>
                  ) : (
                    <span className="muted-inline">Link coming soon</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default StudentDashboardPage;

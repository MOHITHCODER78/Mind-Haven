import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

const chartColors = ['#2f7c71', '#73a88b', '#d6a26f', '#c96b63'];

function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moderationMessage, setModerationMessage] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/overview');
      setOverview(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admin data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const metrics = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      { label: 'Total users', value: overview.metrics.totalUsers, to: '/admin/users' },
      { label: 'Admin users', value: overview.metrics.adminUsers, to: '/admin/users' },
      { label: 'Resources', value: overview.metrics.totalResources, to: '/admin/resources' },
      { label: 'Flagged wall posts', value: overview.metrics.flaggedPosts, to: '/admin/dashboard#moderation' },
      { label: 'Mood logs', value: overview.metrics.totalMoodLogs, to: '/admin/dashboard#analytics' },
    ];
  }, [overview]);

  const handleModeration = async (postId, status) => {
    setModerationMessage('');

    try {
      const response = await api.patch(`/admin/wall/${postId}/status`, { status });
      setModerationMessage(response.data.message);
      await fetchOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update post moderation right now.');
    }
  };

  return (
    <div className="page-stack">
      <section className="panel admin-overview-panel">
        <SectionHeading
          eyebrow="Admin dashboard"
          title="Moderation, content, and engagement in one place"
          description="This is now a working admin workspace with clickable sections, charts, and moderation actions."
        />
        {loading ? <p>Loading admin overview...</p> : null}
        {!loading && error ? <p className="form-error">{error}</p> : null}
        {!loading && !error && overview ? (
          <>
            <div className="admin-metrics-grid">
              {metrics.map((metric) => (
                <Link key={metric.label} to={metric.to} className="metric-link-card">
                  <article className="metric-card compact-metric-card">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </article>
                </Link>
              ))}
            </div>
            <div className="admin-shortcuts">
              <Link className="admin-shortcut-card" to="/admin/users">
                <strong>Manage Users</strong>
                <span>Review roles, verification, and account activity.</span>
              </Link>
              <Link className="admin-shortcut-card" to="/admin/resources">
                <strong>Manage Resources</strong>
                <span>Add, remove, and maintain article content.</span>
              </Link>
              <Link className="admin-shortcut-card" to="/chat">
                <strong>Support Inbox</strong>
                <span>Access all active student chats and moderate conversations.</span>
              </Link>
              <Link className="admin-shortcut-card" to="/admin/dashboard#moderation">
                <strong>Moderation Queue</strong>
                <span>Review flagged content from the Feelings Wall.</span>
              </Link>
            </div>
          </>
        ) : null}
      </section>

      {!loading && !error && overview ? (
        <section id="analytics" className="grid-section two-up admin-sections">
          <div className="panel compact-panel">
            <SectionHeading
              eyebrow="Role distribution"
              title="User mix by role"
              description="A quick distribution view of students and support-side accounts."
            />
            <div className="admin-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={overview.roleBreakdown} dataKey="value" nameKey="label" outerRadius={90} innerRadius={52}>
                    {overview.roleBreakdown.map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="admin-role-grid">
              {overview.roleBreakdown.map((item) => (
                <article key={item.label} className="admin-role-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="panel compact-panel">
            <SectionHeading
              eyebrow="Content performance"
              title="Top resource views"
              description="The resources students are opening most often right now."
            />
            <div className="admin-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={overview.topResources} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid stroke="#d9e6e0" strokeDasharray="4 4" />
                  <XAxis type="number" stroke="#57706a" />
                  <YAxis type="category" dataKey="title" width={110} stroke="#57706a" />
                  <Tooltip />
                  <Bar dataKey="viewCount" fill="#2f7c71" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error && overview ? (
        <section id="moderation" className="grid-section two-up admin-sections">
          <div className="panel compact-panel">
            <SectionHeading
              eyebrow="Flagged posts"
              title="Items waiting for moderation"
              description="These are the posts that crossed safety or report thresholds and should be reviewed first."
            />
            {moderationMessage ? <p className="form-success">{moderationMessage}</p> : null}
            <div className="admin-list-grid">
              {overview.flaggedPosts.length ? overview.flaggedPosts.map((post) => (
                <article key={post.id} className="admin-list-card">
                  <div className="resource-card-top">
                    <span className="tag muted">{post.tag.replace('_', ' ')}</span>
                    <span className="muted-inline">Reports: {post.reportCount}</span>
                  </div>
                  <p>{post.excerpt}</p>
                  <span className="muted-inline">{post.moderationReason || 'Review needed'}</span>
                  <div className="admin-action-row">
                    <button type="button" className="text-button" onClick={() => handleModeration(post.id, 'published')}>Approve</button>
                    <button type="button" className="text-button danger-text" onClick={() => handleModeration(post.id, 'hidden')}>Hide</button>
                  </div>
                </article>
              )) : <p>No flagged posts right now.</p>}
            </div>
          </div>

          <div className="panel compact-panel">
            <SectionHeading
              eyebrow="Top resources"
              title="Most visible support content"
              description="These cards now link into the actual resource library where relevant."
            />
            <div className="admin-list-grid">
              {overview.topResources.map((resource) => (
                <article key={resource.id || resource.title} className="admin-list-card">
                  <div className="resource-card-top">
                    <span className="tag">{resource.category || 'resource'}</span>
                    <span className="muted-inline">{resource.viewCount} views</span>
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.sourceName}</p>
                  {resource.internal ? (
                    <Link className="text-button" to={`/resources/${resource.id}`}>Open article</Link>
                  ) : resource.url ? (
                    <a className="text-button" href={resource.url} target="_blank" rel="noreferrer">Open source</a>
                  ) : (
                    <Link className="text-button" to="/admin/resources">Manage in resources</Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;

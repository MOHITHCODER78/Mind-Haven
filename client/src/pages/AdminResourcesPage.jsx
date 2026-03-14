import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

const categories = [
  'stress',
  'exam_stress',
  'anxiety',
  'depression',
  'suicide_support',
  'heartbreak',
  'motivation',
  'sleep',
  'burnout',
  'focus',
];

const types = ['article', 'video', 'guide'];

const emptyForm = {
  title: '',
  summary: '',
  category: 'stress',
  type: 'article',
  url: '',
  videoUrl: '',
  thumbnailUrl: '',
  sourceName: '',
  featured: false,
  internal: false,
  readTime: '',
};

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/resources');
      setResources(response.data.resources || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load resources right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      await api.post('/resources', formData);
      setFormData(emptyForm);
      setMessage('Resource saved successfully.');
      await fetchResources();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save resource right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setMessage('');
    setError('');

    try {
      await api.delete(`/resources/${id}`);
      setMessage('Resource deleted successfully.');
      await fetchResources();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete resource right now.');
    }
  };

  const internalCount = useMemo(() => resources.filter((resource) => resource.internal).length, [resources]);
  const videoCount = useMemo(() => resources.filter((resource) => resource.type === 'video').length, [resources]);

  return (
    <div className="page-stack">
      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="Resources"
          title="Create and manage support content"
          description="This is the right admin-side workflow for article publishing instead of placing content tools on the public resource page."
        />
        <div className="admin-metrics-grid">
          <article className="metric-card compact-metric-card"><span>Total resources</span><strong>{resources.length}</strong></article>
          <article className="metric-card compact-metric-card"><span>Internal articles</span><strong>{internalCount}</strong></article>
          <article className="metric-card compact-metric-card"><span>Video resources</span><strong>{videoCount}</strong></article>
        </div>
      </section>

      <section className="grid-section two-up admin-sections">
        <div className="panel compact-panel">
          <SectionHeading eyebrow="Publish" title="Add a new resource" description="Create external links, embedded videos, or internal articles that show up in the student resource hub." />
          <form className="resource-form" onSubmit={handleSubmit}>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Resource title" required />
            <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="Short summary" rows="4" required />
            <select name="category" value={formData.category} onChange={handleChange}>
              {categories.map((category) => <option key={category} value={category}>{category.replace('_', ' ')}</option>)}
            </select>
            <select name="type" value={formData.type} onChange={handleChange}>
              {types.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="External article URL or fallback link" />
            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="Video URL for embeds (YouTube/Vimeo)" />
            <input type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="Thumbnail image URL" />
            <input type="text" name="sourceName" value={formData.sourceName} onChange={handleChange} placeholder="Source name" />
            <input type="text" name="readTime" value={formData.readTime} onChange={handleChange} placeholder="e.g. 5 min read or 8 min watch" />
            <label className="checkbox-row"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /><span>Featured</span></label>
            <label className="checkbox-row"><input type="checkbox" name="internal" checked={formData.internal} onChange={handleChange} /><span>Internal article</span></label>
            {message ? <p className="form-success">{message}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
            <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save resource'}</button>
          </form>
        </div>

        <div className="panel compact-panel">
          <SectionHeading eyebrow="Library" title="Existing resources" description="A live list of currently published resource entries." />
          <div className="admin-list-grid">
            {loading ? <p>Loading resources...</p> : resources.map((resource) => (
              <article key={resource.id} className="admin-list-card">
                <div className="resource-card-top">
                  <span className="tag">{resource.category.replace('_', ' ')}</span>
                  <span className="muted-inline">{resource.viewCount} views</span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.sourceName || 'Mind Haven'}</p>
                <p className="muted-inline">{resource.type === 'video' ? (resource.videoUrl || resource.url || 'No video URL') : (resource.url || 'Internal article')}</p>
                <div className="admin-action-row">
                  {resource.url ? <a className="text-button" href={resource.url} target="_blank" rel="noreferrer">Open</a> : <span className="muted-inline">Internal article</span>}
                  <button type="button" className="text-button danger-text" onClick={() => handleDelete(resource.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminResourcesPage;

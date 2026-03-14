import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';
import { getYouTubeThumbnail } from '../utils/video';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'exam_stress', label: 'Exam stress' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'suicide_support', label: 'Crisis support' },
  { value: 'heartbreak', label: 'Love failure' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'stress', label: 'General stress' },
  { value: 'focus', label: 'Focus' },
];

const types = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'guide', label: 'Guide' },
];

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: 'all', type: 'all' });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    if (filters.category !== 'all') {
      params.set('category', filters.category);
    }

    if (filters.type !== 'all') {
      params.set('type', filters.type);
    }

    return params.toString();
  }, [filters]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/resources${queryString ? `?${queryString}` : ''}`);
        setResources(response.data.resources || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load resources right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [queryString]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <SectionHeading
          eyebrow="Resource hub"
          title="Real articles, in-app reads, and support for the situations students actually face"
          description="This library now includes your own 5-minute reads, guided practices, and curated videos for exam stress, anxiety, depression, heartbreak, crisis support, and recovery after setbacks."
        />
        <div className="resource-toolbar">
          <label className="search-field">
            <span>Search</span>
            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by topic, source, or feeling"
            />
          </label>
          <label>
            <span>Category</span>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              {types.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="resource-grid-section">
        {loading ? <div className="panel"><p>Loading resources...</p></div> : null}
        {!loading && error ? <div className="panel"><p className="form-error">{error}</p></div> : null}
        {!loading && !error ? (
          <div className="card-grid resource-grid">
            {resources.map((item) => {
              const mediaUrl = item.videoUrl || item.url || '';
              const thumbnail = item.thumbnailUrl || (item.type === 'video' ? getYouTubeThumbnail(mediaUrl) : '');

              return (
                <article key={item.id || item._id || item.title} className="info-card resource-card">
                  {thumbnail ? (
                    <div className="resource-thumbnail-wrap">
                      <img className="resource-thumbnail" src={thumbnail} alt={item.title} />
                      <span className="resource-play-badge">Video</span>
                    </div>
                  ) : null}
                  <div className="resource-card-top">
                    <span className="tag">{item.category.replace('_', ' ')}</span>
                    {item.featured ? <span className="tag muted">Featured</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="resource-meta">
                    <span>{item.type}</span>
                    <span>{item.readTime || 'Quick read'}</span>
                  </div>
                  <div className="resource-actions">
                    <span className="muted-inline">{item.sourceName || 'Curated source'}</span>
                    {item.internal ? (
                      <Link className="text-button" to={`/resources/${item.id || item._id}`}>
                        Read inside app
                      </Link>
                    ) : (item.url || item.videoUrl) ? (
                      <Link className="text-button" to={`/resources/${item.id || item._id}`}>
                        {item.type === 'video' ? 'Watch now' : 'Open source'}
                      </Link>
                    ) : (
                      <span className="muted-inline">Link coming soon</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ResourcesPage;

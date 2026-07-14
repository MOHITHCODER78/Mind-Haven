import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';
import { getResourceCoverImage } from '../data/visualAssets';
import api from '../services/api';
import { getYouTubeThumbnail } from '../utils/video';

const categories = [
  { value: 'all', label: 'All topics' },
  { value: 'exam_stress', label: 'Exam stress' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'suicide_support', label: 'Crisis support' },
  { value: 'heartbreak', label: 'Relationships' },
  { value: 'motivation', label: 'Healthy habits' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'stress', label: 'Stress management' },
  { value: 'focus', label: 'Focus' },
];

const types = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'guide', label: 'Guide' },
];

const categoryLabels = {
  stress: 'Stress',
  exam_stress: 'Exam stress',
  anxiety: 'Anxiety',
  depression: 'Depression',
  suicide_support: 'Crisis support',
  heartbreak: 'Relationships',
  motivation: 'Healthy habits',
  sleep: 'Sleep',
  burnout: 'Burnout',
  focus: 'Focus',
};

const formatDate = (value) => {
  if (!value) {
    return 'Mind Haven editorial';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Mind Haven editorial';
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

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

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', type: 'all' });
  };

  const hasFilters = Boolean(filters.search.trim() || filters.category !== 'all' || filters.type !== 'all');

  return (
    <div className="page-stack">
      <section className="panel resource-hero-panel">
        <SectionHeading
          eyebrow="Resources"
          title="Practical support when you need it"
          description="Short guides, videos, and articles on topics students actually deal with."
        />
        <div className="resource-summary-row">
          <span className="tag">{resources.length} resources</span>
          <span className="muted-inline">Filter by topic, type, or category.</span>
          {hasFilters ? (
            <button type="button" className="text-button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : null}
        </div>
        <div className="resource-toolbar">
              <label className="search-field">
                <span>Search</span>
                <input
                  type="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Try anxiety, sleep, or burnout"
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
        {loading ? <div className="panel empty-state"><p>Loading the resource library...</p></div> : null}
        {!loading && error ? <div className="panel empty-state"><p className="form-error">{error}</p></div> : null}
        {!loading && !error && !resources.length ? (
          <div className="panel empty-state">
            <h3>Nothing matched those filters.</h3>
            <p>Try another search term, or clear the filters to browse everything.</p>
            <button type="button" className="button secondary" onClick={clearFilters}>Show all resources</button>
          </div>
        ) : null}
        {!loading && !error && resources.length ? (
          <div className="card-grid resource-grid">
            {resources.map((item, index) => {
              const mediaUrl = item.videoUrl || item.url || '';
              const thumbnail = item.thumbnailUrl || (item.type === 'video' ? getYouTubeThumbnail(mediaUrl) : getResourceCoverImage(item.category, index));

              return (
                <article key={item.id || item._id || item.title} className="info-card resource-card">
                  <div className="resource-card-top">
                    <span className="tag">{categoryLabels[item.category] || item.category.replace('_', ' ')}</span>
                    {item.featured ? <span className="tag muted">Featured</span> : null}
                  </div>
                  {thumbnail ? (
                    <div className="resource-thumbnail-wrap">
                      <img className="resource-thumbnail" src={thumbnail} alt={item.title} />
                      {item.type === 'video' ? <span className="resource-play-badge">Video</span> : null}
                    </div>
                  ) : null}
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="resource-meta resource-meta-grid">
                    <span>{item.sourceName || 'Mind Haven editorial'}</span>
                    <span>{formatDate(item.createdAt)}</span>
                    <span>{item.readTime || 'Quick read'}</span>
                  </div>
                  <div className="resource-actions">
                    <span className="muted-inline">{item.type.replace('_', ' ')}</span>
                     {item.internal ? (
                       <Link className="text-button" to={`/resources/${item.id || item._id}`}>
                         Read article
                       </Link>
                     ) : (item.url || item.videoUrl) ? (
                       <Link className="text-button" to={`/resources/${item.id || item._id}`}>
                         {item.type === 'video' ? 'Watch' : 'Open link'}
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

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { getEmbedUrl, getYouTubeThumbnail } from '../utils/video';

function ResourceArticlePage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/resources/${id}`);
        setResource(response.data.resource);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load this article right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return <div className="panel article-shell"><p>Loading article...</p></div>;
  }

  if (error || !resource) {
    return (
      <div className="panel article-shell">
        <p className="form-error">{error || 'Article not found.'}</p>
        <Link className="text-button" to="/resources">Back to resources</Link>
      </div>
    );
  }

  const mediaUrl = resource.videoUrl || resource.url || '';
  const embedUrl = resource.type === 'video' ? getEmbedUrl(mediaUrl) : '';
  const thumbnail = resource.thumbnailUrl || (resource.type === 'video' ? getYouTubeThumbnail(mediaUrl) : '');

  return (
    <article className="page-stack article-shell">
      <section className="panel article-header">
        <Link className="back-link" to="/resources">Back to resources</Link>
        <div className="article-meta-stack">
          <div className="resource-card-top">
            <span className="tag">{resource.category.replace('_', ' ')}</span>
            <span className="tag muted">{resource.readTime || resource.type}</span>
          </div>
          <h2>{resource.title}</h2>
          <p>{resource.summary}</p>
          <div className="resource-meta">
            <span>{resource.sourceName || 'Mind Haven'}</span>
            <span>{resource.type}</span>
          </div>
        </div>
      </section>

      {resource.category === 'suicide_support' ? (
        <section className="panel article-emergency">
          <strong>Immediate support matters.</strong>
          <p>
            If you feel unsafe or think you may harm yourself, call or text 988 immediately if you are in the U.S. or Canada, or contact your local emergency service or nearest hospital right now.
          </p>
        </section>
      ) : null}

      {!resource.internal && resource.type === 'video' ? (
        <section className="panel article-body">
          {embedUrl ? (
            <div className="video-embed-shell">
              <iframe
                className="video-embed-frame"
                src={embedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : thumbnail ? (
            <div className="resource-thumbnail-wrap article-video-fallback">
              <img className="resource-thumbnail" src={thumbnail} alt={resource.title} />
            </div>
          ) : null}
          <div className="article-paragraphs">
            <p>This video is available from the original publisher. You can watch it here or open it directly on the source platform.</p>
            {mediaUrl ? (
              <a className="button primary article-cta" href={mediaUrl} target="_blank" rel="noreferrer">
                Watch on source platform
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {resource.internal && resource.type === 'video' ? (
        <section className="panel article-body">
          <div className="article-video-card">
            <span className="status-pill">Guided practice</span>
            <strong>Follow this like a short wellness video.</strong>
            <p>Read one step at a time, pause between steps, and treat it like a guided session rather than a long article.</p>
          </div>
          <div className="article-paragraphs">
            {resource.content.map((step) => (
              <p key={step.slice(0, 40)}>{step}</p>
            ))}
          </div>
        </section>
      ) : null}

      {resource.internal && resource.type !== 'video' && Array.isArray(resource.content) && resource.content.length ? (
        <section className="panel article-body">
          <div className="article-paragraphs">
            {resource.content.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      {!resource.internal && resource.type !== 'video' ? (
        <section className="panel article-body">
          <div className="article-paragraphs">
            <p>This resource opens on the original publisher site so you can read the full official article.</p>
            {resource.url ? (
              <a className="button primary article-cta" href={resource.url} target="_blank" rel="noreferrer">
                Visit official source
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default ResourceArticlePage;

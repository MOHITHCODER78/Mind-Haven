import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { HoverCard } from './Animations';
import { getResourceCoverImage } from '../../data/visualAssets';

const RecommendationCard = memo(({ resource, index }) => (
  <HoverCard>
    <article className="info-card resource-card">
      <span className="tag">{resource.category.replace('_', ' ')}</span>
      <div className="resource-thumbnail-wrap resource-thumbnail-compact">
        <img
          className="resource-thumbnail"
          src={resource.thumbnailUrl || getResourceCoverImage(resource.category, index)}
          alt={resource.title}
          loading="lazy"
        />
      </div>
      <h3 style={{ marginTop: '0.5rem' }}>{resource.title}</h3>
      <p style={{ fontSize: '0.9rem' }}>{resource.summary}</p>
      <Link className="text-button" to={`/resources/${resource.id}`} style={{ marginTop: 'auto' }}>
        Open resource
      </Link>
    </article>
  </HoverCard>
));

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;
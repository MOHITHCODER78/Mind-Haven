import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';
import useAuth from '../context/useAuth';
import api from '../services/api';

const tags = [
  { value: 'all', label: 'All feelings' },
  { value: 'exam_stress', label: 'Exam stress' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'loneliness', label: 'Loneliness' },
  { value: 'heartbreak', label: 'Love failure' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'placements', label: 'Placements' },
];

function FeelingsWallPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [postForm, setPostForm] = useState({ content: '', tag: 'exam_stress' });
  const [postMessage, setPostMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const queryString = useMemo(() => {
    if (selectedTag === 'all') {
      return '';
    }

    return `?tag=${selectedTag}`;
  }, [selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/wall${queryString}`);
      setPosts(response.data.posts || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load wall posts right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [queryString]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setPostForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPostMessage('');
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/wall', postForm);
      setPostMessage(response.data.message);
      setPostForm({ content: '', tag: postForm.tag });
      await fetchPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to post right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (postId, reaction) => {
    if (!user) {
      setError('Please sign in to react supportively.');
      return;
    }

    try {
      await api.post(`/wall/${postId}/react`, { reaction });
      await fetchPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add your reaction right now.');
    }
  };

  const handleReport = async (postId) => {
    if (!user) {
      setError('Please sign in to report posts.');
      return;
    }

    try {
      const response = await api.post(`/wall/${postId}/report`);
      setPostMessage(response.data.message);
      await fetchPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to report this post right now.');
    }
  };

  return (
    <div className="page-stack">
      <section className="panel wall-hero-panel">
        <SectionHeading
          eyebrow="Anonymous wall"
          title="A positive-only space for honest emotional check-ins"
          description="Students can share what they are carrying without exposing identity. Sensitive content is moderation-ready and supportive reactions stay positive-only."
        />
        <div className="wall-filter-row">
          {tags.map((tag) => (
            <button
              key={tag.value}
              type="button"
              className={selectedTag === tag.value ? 'chip-button active' : 'chip-button'}
              onClick={() => setSelectedTag(tag.value)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid-section two-up wall-layout">
        <div className="panel wall-compose-panel">
          <SectionHeading
            eyebrow="Share safely"
            title="Post anonymously"
            description={user ? 'Your name stays hidden on the wall. Use the tag that best matches what you are feeling.' : 'Sign in to post, react, and report while keeping wall posts anonymous.'}
          />
          {user ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <select name="tag" value={postForm.tag} onChange={handleFormChange}>
                {tags.filter((tag) => tag.value !== 'all').map((tag) => (
                  <option key={tag.value} value={tag.value}>{tag.label}</option>
                ))}
              </select>
              <textarea
                name="content"
                value={postForm.content}
                onChange={handleFormChange}
                rows="6"
                maxLength="500"
                placeholder="Write what is on your mind. Keep it honest, gentle, and safe."
                required
              />
              <div className="wall-compose-footer">
                <span>{postForm.content.length}/500</span>
                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Anonymously'}
                </button>
              </div>
            </form>
          ) : (
            <div className="wall-signin-card">
              <p>Posting stays anonymous, but account login helps us keep the space safer.</p>
              <Link className="button primary" to="/login">Sign in to post</Link>
            </div>
          )}
          {postMessage ? <p className="form-success">{postMessage}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </div>

        <div className="wall-stream">
          {loading ? <div className="panel"><p>Loading posts...</p></div> : null}
          {!loading && !posts.length ? <div className="panel"><p>No posts yet for this filter.</p></div> : null}
          {!loading && posts.length ? (
            posts.map((post) => (
              <article key={post.id || post._id} className="panel wall-post-card">
                <div className="resource-card-top">
                  <span className="tag muted">{post.tag.replace('_', ' ')}</span>
                  <span className={`sentiment-pill ${post.sentimentLabel || 'neutral'}`}>
                    {post.sentimentLabel || 'neutral'}
                  </span>
                </div>
                <p className="wall-post-content">{post.content}</p>
                <div className="wall-post-footer">
                  <span className="muted-inline">{post.createdAtLabel || 'Recently posted'}</span>
                  <div className="wall-reactions">
                    <button type="button" className="reaction-button" onClick={() => handleReaction(post.id || post._id, 'support')}>
                      Support {post.reactions?.support || 0}
                    </button>
                    <button type="button" className="reaction-button" onClick={() => handleReaction(post.id || post._id, 'relate')}>
                      Relate {post.reactions?.relate || 0}
                    </button>
                    <button type="button" className="reaction-button" onClick={() => handleReaction(post.id || post._id, 'strength')}>
                      Strength {post.reactions?.strength || 0}
                    </button>
                  </div>
                </div>
                <button type="button" className="text-button danger-text" onClick={() => handleReport(post.id || post._id)}>
                  Report for review
                </button>
              </article>
            ))
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default FeelingsWallPage;

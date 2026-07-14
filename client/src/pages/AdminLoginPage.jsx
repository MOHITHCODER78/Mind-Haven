import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { getPageImage } from '../data/visualAssets';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdminWithPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await loginAdminWithPassword(formData);
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-wide auth-card-compact">
        <div className="auth-copy admin-auth-copy">
          <div className="auth-copy-body">
            <p className="eyebrow">Admin access</p>
            <h2>Sign in to the moderation and analytics workspace.</h2>
            <p>Use your admin email and password to manage users, resources, moderation, and platform operations.</p>
          </div>
          <div className="auth-image-shell">
            <img className="auth-image" src={getPageImage('adminLogin')} alt="Admin reviewing analytics on a laptop" />
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Admin email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@mindhaven.app" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
          </label>
          <p className="auth-helper-text">Admin accounts use password sign in instead of student verification codes.</p>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Open admin dashboard'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminLoginPage;

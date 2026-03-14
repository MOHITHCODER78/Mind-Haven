import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/admin/users');
        setUsers(response.data.users || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load users right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return users;
    }

    return users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(needle));
  }, [search, users]);

  return (
    <div className="page-stack">
      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="Users"
          title="Accounts and role overview"
          description="This section helps admins understand who is using the platform and which support roles are already configured."
        />
        <div className="resource-toolbar admin-search-row">
          <label className="search-field">
            <span>Search users</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or role" />
          </label>
        </div>
      </section>

      <section className="admin-list-grid">
        {loading ? <div className="panel"><p>Loading users...</p></div> : null}
        {!loading && error ? <div className="panel"><p className="form-error">{error}</p></div> : null}
        {!loading && !error ? filteredUsers.map((user) => (
          <article key={user.id} className="panel admin-list-card">
            <div className="resource-card-top">
              <span className="tag">{user.role.replace('_', ' ')}</span>
              <span className="muted-inline">{user.isVerified ? 'Verified' : 'Pending verification'}</span>
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="muted-inline">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </article>
        )) : null}
      </section>
    </div>
  );
}

export default AdminUsersPage;

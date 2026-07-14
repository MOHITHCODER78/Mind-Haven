import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import api from '../services/api';

const roleOptions = [
  { value: 'all', label: 'All roles' },
  { value: 'student', label: 'Students' },
  { value: 'admin', label: 'Admins' },
  { value: 'counsellor', label: 'Counsellors' },
  { value: 'peer_mentor', label: 'Peer mentors' },
];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
    return users.filter((user) => {
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      const textMatch = !needle || `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(needle);
      return roleMatch && textMatch;
    });
  }, [roleFilter, search, users]);

  return (
    <div className="page-stack">
      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="User management"
          title="Review accounts and keep roles in order"
          description="Use this list to confirm who has access, which roles are configured, and whether an account is verified."
        />
        <div className="resource-toolbar admin-search-row">
          <label className="search-field">
            <span>Search users</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or role" />
          </label>
          <label>
            <span>Role</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-list-grid">
        {loading ? <div className="panel"><p>Loading users...</p></div> : null}
        {!loading && error ? <div className="panel"><p className="form-error">{error}</p></div> : null}
        {!loading && !error && filteredUsers.length ? filteredUsers.map((user) => (
          <article key={user.id} className="panel admin-list-card">
            <div className="resource-card-top">
              <span className="tag">{user.role.replace('_', ' ')}</span>
              <span className={user.isVerified ? 'status-chip online' : 'status-chip'}>{user.isVerified ? 'Verified' : 'Pending'}</span>
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="muted-inline">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </article>
        )) : null}
        {!loading && !error && !filteredUsers.length ? <div className="panel"><p>No users match these filters.</p></div> : null}
      </section>
    </div>
  );
}

export default AdminUsersPage;

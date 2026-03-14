import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  Home,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Mail,
  MessageCircleHeart,
  MessagesSquare,
  Shield,
  Sparkles,
  UserRound,
  Youtube,
} from 'lucide-react';
import useAuth from '../../context/useAuth';

const publicNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/wall', label: 'Feelings Wall', icon: Sparkles },
];

const privateNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/mood-tracker', label: 'Mood Tracker', icon: MessageCircleHeart },
  { to: '/chat', label: 'Support Chat', icon: MessagesSquare },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/wall', label: 'Feelings Wall', icon: Sparkles },
];

const supportNavItems = [
  { to: '/chat', label: 'Support Inbox', icon: MessagesSquare },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/wall', label: 'Feelings Wall', icon: Sparkles },
];

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: UserRound },
  { to: '/admin/resources', label: 'Resources', icon: BookOpen },
  { to: '/chat', label: 'Support Chat', icon: MessagesSquare },
];

const socialLinks = [
  { href: 'https://www.linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: Youtube },
];

const footerColumns = [
  {
    title: 'Platform',
    items: [
      { type: 'internal', label: 'Home', to: '/' },
      { type: 'internal', label: 'Dashboard', to: '/dashboard' },
      { type: 'internal', label: 'Mood Tracker', to: '/mood-tracker' },
      { type: 'internal', label: 'AI Assistant', to: '/assistant' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { type: 'internal', label: 'Resource Library', to: '/resources' },
      { type: 'internal', label: 'Feelings Wall', to: '/wall' },
      { type: 'internal', label: 'Support Chat', to: '/chat' },
    ],
  },
  {
    title: 'Support',
    items: [
      { type: 'internal', label: 'Open Support Chat', to: '/chat' },
      { type: 'external', label: 'Contact Us', href: 'mailto:support@mindhaven.app' },
      { type: 'external', label: 'FAQs', href: '/#faqs' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { type: 'static', label: 'Privacy & safety' },
      { type: 'static', label: 'Terms of use' },
    ],
  },
];

function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  let navItems = publicNavItems;
  if (user?.role === 'admin') {
    navItems = adminNavItems;
  } else if (['counsellor', 'peer_mentor'].includes(user?.role)) {
    navItems = supportNavItems;
  } else if (user) {
    navItems = privateNavItems;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <p className="eyebrow">Student mental wellness platform</p>
          <Link to="/" className="brand-link">
            <h1 className="brand">Mind Haven</h1>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon size={16} strokeWidth={2.2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {user ? (
            <button type="button" className="nav-button" onClick={logout}>
              <LogOut size={16} strokeWidth={2.2} />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                <UserRound size={16} strokeWidth={2.2} />
                <span>Student</span>
              </Link>
              <Link className="nav-link" to="/support/login">
                <MessagesSquare size={16} strokeWidth={2.2} />
                <span>Support</span>
              </Link>
              <Link className="nav-link" to="/admin/login">
                <Shield size={16} strokeWidth={2.2} />
                <span>Admin</span>
              </Link>
              <Link className="nav-link active" to="/register">
                <Sparkles size={16} strokeWidth={2.2} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-top">
            <div className="site-footer-brand-block">
              <div className="site-footer-logo-row">
                <span className="site-footer-logo-mark">
                  <Sparkles size={18} strokeWidth={2.2} />
                </span>
                <strong>Mind Haven</strong>
              </div>
              <p>
                Empowering students with a calmer digital space for mood check-ins, guided support, trusted resources, and safe conversations.
              </p>
              <a className="footer-contact-link" href="mailto:support@mindhaven.app">
                <Mail size={18} strokeWidth={2.1} />
                <span>support@mindhaven.app</span>
              </a>
              <div className="site-footer-social" aria-label="Social media links">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a key={item.label} className="site-footer-social-link" href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                      <Icon size={18} strokeWidth={2.1} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="site-footer-columns">
              {footerColumns.map((column) => (
                <div key={column.title} className="site-footer-column">
                  <h3>{column.title}</h3>
                  <div className="site-footer-link-list">
                    {column.items.map((item) => {
                      if (item.type === 'internal') {
                        return <Link key={item.label} className="site-footer-link" to={item.to}>{item.label}</Link>;
                      }

                      if (item.type === 'external') {
                        return <a key={item.label} className="site-footer-link" href={item.href}>{item.label}</a>;
                      }

                      return <span key={item.label} className="site-footer-link muted">{item.label}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="site-footer-divider" />

          <div className="site-footer-newsletter">
            <div>
              <h3>Stay Updated</h3>
              <p>Get new wellness resources, support ideas, and platform updates delivered to your inbox.</p>
            </div>
            <div className="site-footer-subscribe">
              <input type="email" placeholder="Enter your email" aria-label="Email for updates" />
              <button type="button" className="site-footer-subscribe-button">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-bottom-inner">
            <span>? {new Date().getFullYear()} Mind Haven by Mohit Naidu. All rights reserved.</span>
            <span>Made with care for students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;

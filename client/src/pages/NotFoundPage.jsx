import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { Reveal, Floating } from '../components/shared/Animations';

const NotFoundPage = () => {
    return (
        <div className="page-stack" style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Reveal>
                <div style={{ textAlign: 'center', maxWidth: '560px', padding: '2.25rem' }}>
                    <Floating duration={3}>
                        <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--primary)', opacity: 0.15, marginBottom: '-2rem' }}>
                            404
                        </div>
                    </Floating>

                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>This page does not exist.</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                        The link may be outdated or the page may have moved. You can return home or open the resource library from here.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/" className="button primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Home size={18} /> Go home
                        </Link>
                        <Link to="/resources" className="button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={18} /> Open resources
                        </Link>
                    </div>
                </div>
            </Reveal>
        </div>
    );
};

export default NotFoundPage;

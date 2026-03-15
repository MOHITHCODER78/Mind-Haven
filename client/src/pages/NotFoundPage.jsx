import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Reveal, Floating } from '../components/shared/Animations';

const NotFoundPage = () => {
    return (
        <div className="page-stack" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Reveal>
                <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
                    <Floating duration={3}>
                        <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--primary)', opacity: 0.15, marginBottom: '-2rem' }}>
                            404
                        </div>
                    </Floating>

                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Lost in the Haven?</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                        It looks like you've wandered off the path. Don't worry, even in a safe space like this, it's easy to lose your way sometimes.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/" className="button primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Home size={18} /> Back Home
                        </Link>
                        <Link to="/resources" className="button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={18} /> Find Resources
                        </Link>
                    </div>
                </div>
            </Reveal>
        </div>
    );
};

export default NotFoundPage;

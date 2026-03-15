import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary)',
                        borderRadius: '16px',
                        margin: '0 auto 1.5rem'
                    }}
                />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>MIND HAVEN</h2>
            </div>
        </motion.div>
    );
};

export default PageLoader;

import { motion } from 'framer-motion';

/**
 * A wrapper component that adds a smooth "fade and slide" 
 * entrance animation to any section of the app.
 */
export const Reveal = ({ children, delay = 0, width = "100%", y = 20 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.22, 1, 0.36, 1] // Professional cubic-bezier ease
            }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};

/**
 * A wrapper for cards or buttons that should "pop" slightly
 * when the user interacts with them.
 */
export const HoverCard = ({ children }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.div>
    );
};

/**
 * A subtle floating animation for illustrations.
 */
export const Floating = ({ children, duration = 4 }) => {
    return (
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
};

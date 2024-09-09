import { motion } from 'framer-motion';

// PageTransition.js
const PageTransition = ({ children }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      scale: 1,
    },
    out: {
      opacity: 0,
      scale: 0.96,
    },
  };

  const pageTransition = {
    duration: 0.15,
    ease: [0.26, 0.08, 0.25, 1],
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

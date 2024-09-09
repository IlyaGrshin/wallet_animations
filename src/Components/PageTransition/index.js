import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function useNavigationDirection() {
    const location = useLocation();
    const [navigationDirection, setNavigationDirection] = useState('forward');
    const [lastPathname, setLastPathname] = useState(location.pathname);
  
    useEffect(() => {
      // Определяем направление навигации
      const direction = location.pathname === lastPathname ? 'same' : location.pathname.startsWith(lastPathname) || location.pathname.length > lastPathname.length ? 'forward' : 'backward';
      setNavigationDirection(direction);
      setLastPathname(location.pathname);
    }, [location]);
  
    return navigationDirection;
  }

// PageTransition.js
const PageTransition = ({ children }) => {
  const navigationDirection = useNavigationDirection();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: navigationDirection === 'backward' ? -100 : 100,
      scale: 0.8,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: navigationDirection === 'forward' ? -100 : 100,
      scale: 0.8,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
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

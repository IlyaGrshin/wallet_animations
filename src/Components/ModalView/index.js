import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const ModalView = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const overlayAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalAnimation = {
    hidden: { 
      transform: 'translateY(100dvh)',
    },
    visible: { 
      transform: 'translateY(0dvh)',
      transition: { type: 'spring', damping: 30, stiffness: 250 }
    },
    exit: { 
      transform: 'translateY(100dvh)',
    }
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div className='overlay' variants={overlayAnimation} initial='hidden' animate='visible' exit='exit' onClick={onClose}>
                <motion.div className='modal' variants={modalAnimation} initial='hidden' animate='visible' exit='exit' onClick={(e) => e.stopPropagation()}>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default ModalView;

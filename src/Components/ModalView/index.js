import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

function blendColors(color1, color2, alpha2) {
  function hexToRgb(hex) {
      hex = hex.replace('#', '')
      return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
      ];
  }

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  alpha2 = alpha2 / 100;

  const r = Math.round(r2 * alpha2 + r1 * (1 - alpha2));
  const g = Math.round(g2 * alpha2 + g1 * (1 - alpha2));
  const b = Math.round(b2 * alpha2 + b1 * (1 - alpha2));

  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

const ModalView = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    const WebApp = window?.Telegram?.WebApp;
    const headerColor = (WebApp?.themeParams.length > 0) ? WebApp?.themeParams.secondary_bg_color : '#EFEFF4'
    const headerColorWithOverlay = '#' + blendColors('#000000', headerColor, 50)

    if (isOpen) {
      WebApp?.setHeaderColor(headerColorWithOverlay)
      WebApp?.MainButton.setText('Done').show().onClick(() => {
        onClose()
        WebApp?.setHeaderColor(headerColor);
        WebApp?.MainButton.hide()
      });
    } else {
      WebApp?.setHeaderColor(headerColor);
      WebApp?.MainButton.hide()
    }

    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, onClose]);

  const overlayAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalAnimation = {
    hidden: { transform: 'translateY(100dvh)' },
    visible: { transform: 'translateY(0dvh)', transition: { type: 'spring', damping: 30, stiffness: 250 } },
    exit: { transform: 'translateY(100dvh)', transition: { duration: 0.2, ease: 'linear' } },
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

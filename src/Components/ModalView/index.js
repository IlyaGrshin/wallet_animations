import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

import WebApp from '@twa-dev/sdk';
import { BackButton, MainButton } from '@twa-dev/sdk/react';

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

const ModalView = ({ isOpen, onClose, useCssAnimation = false, children, ...props }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    
        const headerColor = WebApp.themeParams.secondary_bg_color || '#EFEFF4';
        const headerColorWithOverlay = `#${blendColors('#000000', headerColor, 50)}`;

        console.log('Telegram API', WebApp.themeParams.secondary_bg_color)
        console.log('headerColor var', headerColor)
        console.log('blendColor var', headerColorWithOverlay)
    
        if (useCssAnimation) {
            if (isOpen) {
                WebApp.disableVerticalSwipes()
                setShouldRender(true)
                setTimeout(() => {
                    setAnimate(true)
                    WebApp.setHeaderColor(headerColorWithOverlay)
                }, 10);
            } else {
                WebApp.enableVerticalSwipes()
                WebApp.BackButton.hide()
                WebApp.MainButton.hide()
                WebApp.setHeaderColor(headerColor)
                setAnimate(false);
            }
        } else {
            if (isOpen) {
                WebApp.setHeaderColor(headerColorWithOverlay)
                WebApp.disableVerticalSwipes()
            } else {
                WebApp.enableVerticalSwipes()
                WebApp.BackButton.hide()
                WebApp.MainButton.hide()
                WebApp.setHeaderColor(headerColor)
            }
        }
    }, [isOpen, useCssAnimation]);    
    
    const overlayAnimation = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2, ease: 'linear' } },
        exit: { opacity: 0, transition: { duration: 0.2, ease: 'linear' } },
    };
    
    const modalAnimation = {
        hidden: { transform: 'translateY(100dvh)' },
        visible: { transform: 'translateY(0dvh)', transition: { type: 'spring', damping: 30, stiffness: 250 } },
        exit: { transform: 'translateY(100dvh)', transition: { duration: 0.2, ease: 'linear' } },
    };

    const onAnimationEnd = (e) => {
        if (e.target === e.currentTarget && !animate) {
            setShouldRender(false);
        }
    };

    if (useCssAnimation) {
        return (
            shouldRender && (
                <>
                    <BackButton onClick={onClose} />
                    <div
                        className={`overlay animation ${animate ? 'open' : ''}`}
                        onClick={onClose}
                        onTransitionEnd={onAnimationEnd}
                    >
                        <div
                            className={`modal animation ${animate ? 'open' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                            {...props}
                        >
                            {children}
                        </div>
                    </div>
                    <MainButton text='Done' onClick={onClose} />
                </>
            )
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <BackButton onClick={onClose} />
                    <motion.div className='overlay' variants={overlayAnimation} initial='hidden' animate='visible' exit='exit' onClick={onClose}>
                        <motion.div className='modal' variants={modalAnimation} initial='hidden' animate='visible' exit='exit' onClick={(e) => e.stopPropagation()} {...props}>
                            {children}
                        </motion.div>
                    </motion.div>
                    <MainButton text='Done' onClick={onClose} />
                </>
            )}
        </AnimatePresence>
    );
};

export default ModalView;
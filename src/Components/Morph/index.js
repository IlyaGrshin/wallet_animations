import { motion, AnimatePresence } from 'motion/react';

function Morph({ children }) {
    function generateKeys(text) {
        const charCount = {};
        return text.split("").map((char, index) => {
            if (!charCount[char]) {
                charCount[char] = 0;
            }
            const key = `${char}-${charCount[char]}-${index}`;
            charCount[char]++;
            return { char, key };
        });
    }

    const textToDisplay = generateKeys(children);

    return (
        <AnimatePresence mode='popLayout' initial={false}>
            {textToDisplay.map(({ char, key }) => (
                <motion.span
                    key={key}
                    layoutId={key}
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.25,
                        type: 'spring',
                        bounce: 0,
                        opacity: {
                            duration: 0.35,
                            type: 'spring',
                            bounce: 0,
                        },
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </AnimatePresence>
    );
}

export default Morph
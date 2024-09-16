import { useEffect } from 'react';
import WebApp from "@twa-dev/sdk";

let platform = {
    'ios': 'apple',
    'macos': 'apple',

    'android': 'material',
    'android_x': 'material',
    'tdesktop': 'material',
    'webk': 'material',
    'webz': 'material',
    'unigram': 'material',
}


let telegramPlatform = WebApp.platform

export const ios = platform[telegramPlatform] === 'apple';
export const material = platform[telegramPlatform] === 'material';

function DeviceProvider() {
    useEffect(() => {
        const platformClass = platform[telegramPlatform] || 'apple';
        document.body.setAttribute('class', platformClass);
    }, []);

    return null;
}

export default DeviceProvider
import { useEffect } from 'react';
import WebApp from "@twa-dev/sdk";

let platform = {
    'ios': 'apple',
    'macos': 'apple',

    'android': 'android',
    'android_x': 'android',
    'tdesktop': 'android',
    'webk': 'android',
    'webz': 'android',
    'unigram': 'android',
}


let telegramPlatform = WebApp.platform

export const ios = platform[telegramPlatform] === 'apple';
export const android = platform[telegramPlatform] === 'android';

function DeviceProvider() {
    useEffect(() => {
        const platformClass = platform[telegramPlatform] || 'apple';
        document.body.setAttribute('class', platformClass);
    }, []);

    return null;
}

export default DeviceProvider
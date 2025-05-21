import React from 'react';
import { headers } from 'next/headers';
import SupportPageComponent from '.';
import Social from '../../components/Social';
import DeviceDetector from 'device-detector-js';

export { generateMetadata } from './generateMetadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NotFoundPage = async () => {
    const headersList = headers();
    const userAgent = headersList.get('user-agent')?.toLowerCase() || '';

    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(userAgent);

    const isFacebookBot = userAgent.includes('facebookexternalhit') || userAgent.includes('facebot');
    const isInstagramBot = userAgent.includes('instagram');
    const isTelegramBot = userAgent.includes('telegrambot');

    const isAllowedBot = isFacebookBot || isInstagramBot || isTelegramBot;

    if (device.bot && !isAllowedBot) {
        return <Social />;
    }

    return <SupportPageComponent />;
};

export default NotFoundPage;

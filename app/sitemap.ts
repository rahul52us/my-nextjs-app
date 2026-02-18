import { MetadataRoute } from 'next';
import { SITE_URL } from './config/utils/variables';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ['', '/login', '/register'].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes];
}

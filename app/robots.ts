import { MetadataRoute } from 'next';
import { SITE_URL } from './config/utils/variables';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/admin/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

import rss from '@astrojs/rss';
import { getEntry } from 'astro:content';
import { livePosts, urlOf } from '../lib/content';

export async function GET(context) {
  const posts = await livePosts();
  const items = await Promise.all(
    posts.map(async (p) => {
      const s = p.data.series ? await getEntry('series', p.data.series) : undefined;
      return {
        title: s ? `${s.data.title}, Day ${p.data.day}: ${p.data.title}` : p.data.title,
        pubDate: p.data.date,
        description: p.data.summary ?? '',
        link: urlOf(p),
      };
    }),
  );
  return rss({
    title: 'Dave Randall',
    description: 'Practical Intune guidance: RBAC, Microsoft Graph, and more.',
    site: context.site,
    items,
  });
}

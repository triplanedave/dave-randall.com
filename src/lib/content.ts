import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Series = CollectionEntry<'series'>;
export type Topic = CollectionEntry<'topics'>;

// Set SHOW_FUTURE=1 when building a preview to include posts dated in the future.
const showFuture = process.env.SHOW_FUTURE === '1';

export const topicOf = (p: Post) => p.id.split('/')[0];
export const slugOf = (p: Post) => p.id.split('/').slice(1).join('/');
export const urlOf = (p: Post) => `/${topicOf(p)}/${slugOf(p)}/`;

export function isLive(p: Post, now = new Date()) {
  if (p.data.status !== 'published') return false;
  return showFuture || p.data.date.getTime() <= now.getTime();
}

export async function livePosts() {
  const all = await getCollection('posts');
  return all.filter((p) => isLive(p)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function allTopics() {
  return (await getCollection('topics')).sort((a, b) => a.data.order - b.data.order);
}

/** Every entry in a series (live and upcoming), in day order. */
export async function seriesPosts(seriesId: string) {
  const all = await getCollection('posts');
  return all
    .filter((p) => p.data.series === seriesId)
    .sort((a, b) => (a.data.day ?? 0) - (b.data.day ?? 0));
}

export function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });
}

export const pad = (n: number) => String(n).padStart(2, '0');

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

/** A series entry without a day number (an extra, like a deep dive), listed at the end of its week. */
export const isExtra = (p: Post) => p.data.series !== undefined && p.data.day === undefined;

/** Every entry in a series (live and upcoming), in day order, with extras after the numbered days. */
export async function seriesPosts(seriesId: string) {
  const all = await getCollection('posts');
  return all
    .filter((p) => p.data.series === seriesId)
    .sort((a, b) => (a.data.day ?? Infinity) - (b.data.day ?? Infinity) || a.data.date.getTime() - b.data.date.getTime());
}

/** How a series entry is labeled: "Day 7", or "Deep dive" for an extra. */
export const entryLabel = (p: Post) => (isExtra(p) ? 'Deep dive' : `Day ${p.data.day}`);

export function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });
}

/** A post's date as readers should see it, honoring the series' datePrecision. */
export function postDate(p: Post, s?: Series, long = false) {
  if (s?.data.datePrecision === 'month') return fmtDate(p.data.date, { month: 'long', year: 'numeric' });
  return fmtDate(p.data.date, long ? { month: 'long', day: 'numeric', year: 'numeric' } : undefined);
}

export const pad =(n: number) => String(n).padStart(2, '0');

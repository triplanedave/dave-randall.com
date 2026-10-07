import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A top-level subject area: /rbac/, /graph/, and any you add later.
const topics = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),            // "Intune RBAC"
    navLabel: z.string(),         // "RBAC"
    description: z.string(),
    accent: z.string(),           // topic color, e.g. "#1F5FAE"
    accentDark: z.string(),       // same color tuned for dark mode
    order: z.number().default(10),
  }),
});

// A LinkedIn series that belongs to a topic.
const series = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    topic: z.string(),            // matches a topics file name
    hashtag: z.string().optional(),
    description: z.string(),
    totalDays: z.number(),
    weeks: z
      .array(z.object({ week: z.number(), theme: z.string(), tagline: z.string().optional() }))
      .default([]),
    note: z.string().optional(),  // shown on the hub, e.g. "Archive being imported"
  }),
});

// Every page under a topic. The folder is the topic and the file name is the URL:
// src/content/posts/rbac/day-05.md  ->  dave-randall.com/rbac/day-05/
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),                     // goes live on this date (site rebuilds daily)
    status: z.enum(['published', 'planned']).default('published'),
    series: z.string().optional(),             // matches a series file name
    day: z.number().optional(),
    week: z.number().optional(),
    summary: z.string().optional(),
    linkedin: z.string().url().optional(),     // the LinkedIn post this page backs up
    diagram: z.string().optional(),            // path under /public, e.g. /images/rbac/day-02.png
    diagramAlt: z.string().optional(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { topics, series, posts };

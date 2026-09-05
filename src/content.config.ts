import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './site.config';

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // 2026-08-13-jpa-n1.md → jpa-n1 (URL에 날짜를 넣지 않는다)
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    category: z.enum(categoryIds),
    draft: z.boolean().default(false),
    // public/ 기준 절대 경로. 예: /images/n1.png
    cover: z.string().startsWith('/').optional(),
    sourcePath: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    period: z.string().min(1),
    role: z.string().min(1),
    stack: z.array(z.string()).min(1),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    metrics: z
      .array(z.object({ label: z.string(), before: z.string(), after: z.string() }))
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    sourcePath: z.string().optional(),
  }),
});

export const collections = { posts, projects };

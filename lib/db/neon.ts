/**
 * Neon Database Client
 *
 * Direct Neon serverless queries for Cloudflare Workers compatibility.
 * Uses HTTP-based queries which work reliably on edge runtimes.
 */

import { neon } from "@neondatabase/serverless";

// Type definitions matching Prisma schema
export interface CaseStudy {
  id: string;
  churchName: string;
  slug: string;
  logo: string | null;
  description: string;
  challenge: string | null;
  solution: string | null;
  images: string[];
  beforeImage: string | null;
  afterImage: string | null;
  testimonialQuote: string | null;
  testimonialName: string | null;
  testimonialTitle: string | null;
  metrics: Record<string, unknown> | null;
  liveSiteUrl: string | null;
  featured: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  blocks: unknown[];
  featuredImage: string | null;
  categoryId: string | null;
  authorName: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  quote: string;
  image: string | null;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get SQL client
function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(connectionString);
}

// Database query functions
export const db = {
  caseStudy: {
    async findMany(options?: {
      where?: { status?: string; featured?: boolean };
      orderBy?: Array<Record<string, "asc" | "desc">>;
      take?: number;
    }): Promise<CaseStudy[]> {
      const sql = getSql();

      // Build simple queries using tagged templates
      if (options?.where?.status === "PUBLISHED" && options?.where?.featured === true) {
        const rows = await sql`
          SELECT * FROM "CaseStudy"
          WHERE status = 'PUBLISHED' AND featured = true
          ORDER BY "sortOrder" ASC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapCaseStudyRow);
      }

      if (options?.where?.status === "PUBLISHED") {
        const rows = await sql`
          SELECT * FROM "CaseStudy"
          WHERE status = 'PUBLISHED'
          ORDER BY featured DESC, "sortOrder" ASC, "createdAt" DESC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapCaseStudyRow);
      }

      // Default: all case studies
      const rows = await sql`
        SELECT * FROM "CaseStudy"
        ORDER BY "sortOrder" ASC
        LIMIT ${options?.take || 100}
      `;
      return rows.map(mapCaseStudyRow);
    },

    async findUnique(options: {
      where: { slug: string; status?: string };
    }): Promise<CaseStudy | null> {
      const sql = getSql();
      const { slug, status } = options.where;

      let rows;
      if (status) {
        rows = await sql`
          SELECT * FROM "CaseStudy" WHERE slug = ${slug} AND status = ${status} LIMIT 1
        `;
      } else {
        rows = await sql`
          SELECT * FROM "CaseStudy" WHERE slug = ${slug} LIMIT 1
        `;
      }
      return rows.length > 0 ? mapCaseStudyRow(rows[0]) : null;
    },
  },

  blogPost: {
    async findMany(options?: {
      where?: { status?: string; categoryId?: string };
      orderBy?: Array<Record<string, "asc" | "desc">>;
      take?: number;
    }): Promise<BlogPost[]> {
      const sql = getSql();

      if (options?.where?.status === "PUBLISHED" && options?.where?.categoryId) {
        const rows = await sql`
          SELECT * FROM "BlogPost"
          WHERE status = 'PUBLISHED' AND "categoryId" = ${options.where.categoryId}
          ORDER BY "publishedAt" DESC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapBlogPostRow);
      }

      if (options?.where?.status === "PUBLISHED") {
        const rows = await sql`
          SELECT * FROM "BlogPost"
          WHERE status = 'PUBLISHED'
          ORDER BY "publishedAt" DESC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapBlogPostRow);
      }

      const rows = await sql`
        SELECT * FROM "BlogPost"
        ORDER BY "createdAt" DESC
        LIMIT ${options?.take || 100}
      `;
      return rows.map(mapBlogPostRow);
    },

    async findUnique(options: {
      where: { slug: string; status?: string };
    }): Promise<BlogPost | null> {
      const sql = getSql();
      const { slug, status } = options.where;

      let rows;
      if (status) {
        rows = await sql`
          SELECT * FROM "BlogPost" WHERE slug = ${slug} AND status = ${status} LIMIT 1
        `;
      } else {
        rows = await sql`
          SELECT * FROM "BlogPost" WHERE slug = ${slug} LIMIT 1
        `;
      }
      return rows.length > 0 ? mapBlogPostRow(rows[0]) : null;
    },
  },

  blogCategory: {
    async findMany(options?: {
      orderBy?: Array<Record<string, "asc" | "desc">>;
    }): Promise<BlogCategory[]> {
      const sql = getSql();
      const rows = await sql`
        SELECT * FROM "BlogCategory"
        ORDER BY "sortOrder" ASC
      `;
      return rows.map(mapBlogCategoryRow);
    },

    async findUnique(options: {
      where: { slug: string };
    }): Promise<BlogCategory | null> {
      const sql = getSql();
      const rows = await sql`
        SELECT * FROM "BlogCategory" WHERE slug = ${options.where.slug} LIMIT 1
      `;
      return rows.length > 0 ? mapBlogCategoryRow(rows[0]) : null;
    },
  },

  testimonial: {
    async findMany(options?: {
      where?: { isActive?: boolean; featured?: boolean };
      orderBy?: Array<Record<string, "asc" | "desc">>;
      take?: number;
    }): Promise<Testimonial[]> {
      const sql = getSql();

      if (options?.where?.isActive === true && options?.where?.featured === true) {
        const rows = await sql`
          SELECT * FROM "Testimonial"
          WHERE "isActive" = true AND featured = true
          ORDER BY "sortOrder" ASC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapTestimonialRow);
      }

      if (options?.where?.isActive === true) {
        const rows = await sql`
          SELECT * FROM "Testimonial"
          WHERE "isActive" = true
          ORDER BY "sortOrder" ASC
          LIMIT ${options?.take || 100}
        `;
        return rows.map(mapTestimonialRow);
      }

      const rows = await sql`
        SELECT * FROM "Testimonial"
        ORDER BY "sortOrder" ASC
        LIMIT ${options?.take || 100}
      `;
      return rows.map(mapTestimonialRow);
    },
  },
};

// Row mappers
function mapCaseStudyRow(row: Record<string, unknown>): CaseStudy {
  return {
    id: row.id as string,
    churchName: row.churchName as string,
    slug: row.slug as string,
    logo: row.logo as string | null,
    description: row.description as string,
    challenge: row.challenge as string | null,
    solution: row.solution as string | null,
    images: (row.images as string[]) || [],
    beforeImage: row.beforeImage as string | null,
    afterImage: row.afterImage as string | null,
    testimonialQuote: row.testimonialQuote as string | null,
    testimonialName: row.testimonialName as string | null,
    testimonialTitle: row.testimonialTitle as string | null,
    metrics: row.metrics as Record<string, unknown> | null,
    liveSiteUrl: row.liveSiteUrl as string | null,
    featured: row.featured as boolean,
    sortOrder: row.sortOrder as number,
    status: row.status as "DRAFT" | "PUBLISHED",
    publishedAt: row.publishedAt ? new Date(row.publishedAt as string) : null,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  };
}

function mapBlogPostRow(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string | null,
    blocks: (row.blocks as unknown[]) || [],
    featuredImage: row.featuredImage as string | null,
    categoryId: row.categoryId as string | null,
    authorName: row.authorName as string | null,
    status: row.status as "DRAFT" | "PUBLISHED",
    publishedAt: row.publishedAt ? new Date(row.publishedAt as string) : null,
    metaTitle: row.metaTitle as string | null,
    metaDescription: row.metaDescription as string | null,
    ogImage: row.ogImage as string | null,
    noIndex: row.noIndex as boolean,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  };
}

function mapBlogCategoryRow(row: Record<string, unknown>): BlogCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | null,
    sortOrder: row.sortOrder as number,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  };
}

function mapTestimonialRow(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as string,
    name: row.name as string,
    title: row.title as string | null,
    company: row.company as string | null,
    quote: row.quote as string,
    image: row.image as string | null,
    featured: row.featured as boolean,
    sortOrder: row.sortOrder as number,
    isActive: row.isActive as boolean,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  };
}

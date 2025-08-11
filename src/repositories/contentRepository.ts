import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
// Zod schemas for DB rows
export const TitleRowSchema = z.object({
  id: z.string().uuid(),
  anilist_id: z.number(),
  title: z.string(),
  title_english: z.string().nullable().optional(),
  title_japanese: z.string().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  score: z.number().nullable().optional(),
  anilist_score: z.number().nullable().optional(),
  rank: z.number().nullable().optional(),
  popularity: z.number().nullable().optional(),
  favorites: z.number().nullable().optional(),
  year: z.number().nullable().optional(),
  color_theme: z.string().nullable().optional(),
  content_type: z.enum(['anime','manga']),
  created_at: z.string(),
  updated_at: z.string(),
});
export const AnimeDetailsRowSchema = z.object({
  episodes: z.number().nullable().optional(),
  aired_from: z.string().nullable().optional(),
  aired_to: z.string().nullable().optional(),
  season: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  trailer_url: z.string().url().nullable().optional(),
  trailer_site: z.string().nullable().optional(),
  trailer_id: z.string().nullable().optional(),
  next_episode_date: z.string().nullable().optional(),
  next_episode_number: z.number().nullable().optional(),
  last_sync_check: z.string().nullable().optional(),
});
export const MangaDetailsRowSchema = z.object({
  chapters: z.number().nullable().optional(),
  volumes: z.number().nullable().optional(),
  published_from: z.string().nullable().optional(),
  published_to: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  next_chapter_date: z.string().nullable().optional(),
  next_chapter_number: z.number().nullable().optional(),
  last_sync_check: z.string().nullable().optional(),
});
export type TitleRow = z.infer<typeof TitleRowSchema> & {
  anime_details?: any[];
  manga_details?: any[];
  title_genres?: Array<{ genres?: { name?: string } }>;
  title_studios?: Array<{ studios?: { name?: string } }>;
  title_authors?: Array<{ authors?: { name?: string } }>;
};
export type DomainTitle = {
  id: string;
  anilist_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis: string;
  image_url: string;
  score?: number | null;
  anilist_score?: number | null;
  rank?: number | null;
  popularity?: number | null;
  favorites?: number | null;
  year?: number | null;
  color_theme?: string | null;
  content_type: 'anime' | 'manga';
  genres: string[];
  studios?: string[];
  authors?: string[];
  details?: Record<string, any> | null;
};
export function mapTitleRowToDomain(row: TitleRow): DomainTitle {
  const base = TitleRowSchema.safeParse(row);
  if (!base.success) {
    throw new Error(`Invalid title row: ${base.error.message}`);
  }
  const genres = (row.title_genres || []).map(g => g.genres?.name).filter(Boolean) as string[];
  const studios = (row.title_studios || []).map(s => s.studios?.name).filter(Boolean) as string[];
  const authors = (row.title_authors || []).map(a => a.authors?.name).filter(Boolean) as string[];
  const details = row.content_type === 'anime'
    ? (row.anime_details && row.anime_details[0] ? AnimeDetailsRowSchema.parse(row.anime_details[0]) : null)
    : (row.manga_details && row.manga_details[0] ? MangaDetailsRowSchema.parse(row.manga_details[0]) : null);
  return {
    id: row.id,
    anilist_id: row.anilist_id,
    title: row.title,
    title_english: row.title_english || undefined,
    title_japanese: row.title_japanese || undefined,
    synopsis: row.synopsis || '',
    image_url: row.image_url || '',
    score: row.score ?? null,
    anilist_score: row.anilist_score ?? null,
    rank: row.rank ?? null,
    popularity: row.popularity ?? null,
    favorites: row.favorites ?? null,
    year: row.year ?? null,
    color_theme: row.color_theme ?? null,
    content_type: row.content_type,
    genres,
    studios: studios.length ? studios : undefined,
    authors: authors.length ? authors : undefined,
    details,
  };
}
export type ListParams = {
  contentType?: 'anime' | 'manga';
  page?: number;
  pageSize?: number;
  sort?: 'popularity' | 'anilist_score' | 'updated_at' | 'year';
  order?: 'asc' | 'desc';
  search?: string;
};
function selectWithJoins(detailed: boolean = false) {
  // For list views, only select essential fields
  const baseFields = `
    id, anilist_id, title, title_english, title_native,
    content_type, score, popularity, favorites,
    cover_image, cover_image_color, banner_image,
    status, created_at, updated_at
  `;
  
  // For detailed views, include all fields
  const detailFields = detailed ? `
    description, mean_score, hashtag, synonyms,
    country_of_origin, source
  ` : '';
  
  // Always include essential joins but limit fields
  const joins = `
    anime_details!left(episodes, status, season, season_year, format),
    manga_details!left(chapters, volumes, status),
    title_genres!left(genres!inner(name)),
    title_studios!left(studios!inner(name)),
    title_authors!left(authors!inner(name))
  `;
  
  return detailed ? `*, ${joins}` : `${baseFields}${detailFields ? ',' + detailFields : ''}, ${joins}`;
}
export async function getTitleById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<DomainTitle | null> {
  const { data, error } = await supabase
    .from('titles')
    .select(selectWithJoins(true)) // Use detailed select for single item
    .eq('id', id)
    .returns<TitleRow[]>()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapTitleRowToDomain(data as unknown as TitleRow);
}
export function computeRange(page: number, pageSize: number) {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(pageSize || 1));
  const from = (safePage - 1) * safeSize;
  const to = from + safeSize - 1;
  return { from, to };
}
export async function listTitles(
  supabase: SupabaseClient<Database>,
  params: ListParams = {}
): Promise<{ items: DomainTitle[]; total?: number } > {
  const {
    contentType,
    page = 1,
    pageSize = 24,
    sort = 'popularity',
    order = 'desc',
    search
  } = params;
  let query = supabase
    .from('titles')
    .select(selectWithJoins(false), { count: 'exact' as const }) // Use optimized select for lists
    .order(sort, { ascending: order === 'asc' });
  if (contentType) query = query.eq('content_type', contentType);
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  const { from, to } = computeRange(page, pageSize);
  query = query.range(from, to);
  const { data, error, count } = await query.returns<TitleRow[]>();
  if (error) throw error;
  const items = (data as unknown as TitleRow[]).map(mapTitleRowToDomain);
  return { items, total: count ?? undefined };
}
export async function getHomepageSections(
  supabase: SupabaseClient<Database>
): Promise<{ trendingAnime: DomainTitle[]; trendingManga: DomainTitle[]; recentAnime: DomainTitle[]; recentManga: DomainTitle[] }>{
  // Prefer RPCs if available; fallback to direct queries
  try {
    const [ta, tm, ra, rm] = await Promise.all([
      supabase.rpc('get_trending_anime'),
      supabase.rpc('get_trending_manga'),
      supabase.rpc('get_recent_anime'),
      supabase.rpc('get_recent_manga')
    ]);
    const mapList = (res: any) =>
      Array.isArray(res.data) ? (res.data as TitleRow[]).map(mapTitleRowToDomain) : [];
    return {
      trendingAnime: mapList(ta),
      trendingManga: mapList(tm),
      recentAnime: mapList(ra),
      recentManga: mapList(rm)
    };
  } catch {
    // Fallback to direct queries if RPCs missing
    const common = { page: 1, pageSize: 12 } as const;
    const [ta, tm, ra, rm] = await Promise.all([
      listTitles(supabase, { ...common, contentType: 'anime', sort: 'popularity', order: 'desc' }),
      listTitles(supabase, { ...common, contentType: 'manga', sort: 'popularity', order: 'desc' }),
      listTitles(supabase, { ...common, contentType: 'anime', sort: 'updated_at', order: 'desc' }),
      listTitles(supabase, { ...common, contentType: 'manga', sort: 'updated_at', order: 'desc' })
    ]);
    return {
      trendingAnime: ta.items,
      trendingManga: tm.items,
      recentAnime: ra.items,
      recentManga: rm.items
    };
  }
}
export async function getOrFetchTitleByAnilistId(
  supabase: SupabaseClient<Database>,
  anilistId: number,
  contentType: 'anime' | 'manga'
): Promise<DomainTitle | null> {
  // Try cache (DB) first
  const { data: existing, error } = await supabase
    .from('titles')
    .select(selectWithJoins())
    .eq('anilist_id', anilistId)
    .maybeSingle();
  if (error) throw error;
  if (existing) return mapTitleRowToDomain(existing as unknown as TitleRow);
  // Cache miss: trigger importer for a narrow fetch by popularity page bucket
  // Since importer works by page, trigger a single-page import to refresh cache
  try {
    const { data, error: edgeError } = await supabase.functions.invoke('import-data-enhanced', {
      body: { type: contentType, pages: 1, itemsPerPage: 25 }
    });
    if (edgeError) throw edgeError;
  } catch (e) {
    // Warning logged silently
    return null;
  }
  // Re-query after import
  const { data: after, error: afterErr } = await supabase
    .from('titles')
    .select(selectWithJoins())
    .eq('anilist_id', anilistId)
    .maybeSingle();
  if (afterErr) throw afterErr;
  return after ? mapTitleRowToDomain(after as unknown as TitleRow) : null;
}
export async function ensureHomepageCache(
  supabase: SupabaseClient<Database>
): Promise<void> {
  // Check if we have enough titles cached for homepage; if not, import a small batch
  const { count, error } = await supabase
    .from('titles')
    .select('id', { count: 'exact', head: true })
  if (error) throw error;
  if ((count ?? 0) < 40) {
    try {
      await supabase.functions.invoke('import-data-enhanced', {
        body: { type: 'both', pages: 2, itemsPerPage: 25 }
      });
    } catch (e) {
      // Warning logged silently
    }
  }
}
export async function prewarmHomepageIfNeeded(supabase: SupabaseClient<Database>) {
  try {
    await ensureHomepageCache(supabase);
  } catch (e) {
    // Warning logged silently
  }
}

import { z } from 'zod';
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_FEATURE_DEV_TOOLS: z.union([z.literal('true'), z.literal('false')]).default('false'),
  VITE_ENABLE_IMPORT: z.union([z.literal('true'), z.literal('false')]).default('true')
});
export type Env = z.infer<typeof envSchema>;
export function getEnv(): Env {
  const parsed = envSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    // Log but don’t crash in dev; in prod, throw.
    if (import.meta.env.PROD) {
      throw new Error(`Invalid environment: ${parsed.error.message}`);
    } else {
      // Warning logged silently
    }
  }
  return parsed.success ? parsed.data : (import.meta.env as any);
}
export const featureFlags = {
  devTools: (import.meta.env.VITE_FEATURE_DEV_TOOLS === 'true'),
  enableImport: (import.meta.env.VITE_ENABLE_IMPORT !== 'false')
};

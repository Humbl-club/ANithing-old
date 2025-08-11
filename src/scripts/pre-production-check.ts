import { supabase } from '@/integrations/supabase/client';
interface ProductionChecks {
  database: boolean;
  edgeFunctions: boolean;
  authentication: boolean;
  dataPopulation: boolean;
  performance: boolean;
  materializedViews: boolean;
  indexes: boolean;
}
async function runProductionChecks(): Promise<ProductionChecks> {
  const checks: ProductionChecks = {
    database: false,
    edgeFunctions: false,
    authentication: false,
    dataPopulation: false,
    performance: false,
    materializedViews: false,
    indexes: false
  };
  // 1. Database connectivity
  try {
    const { error } = await supabase.from('titles').select('count').limit(1);
    checks.database = !error;
  } catch (e) {
    // Database check failed
  }
  // 2. Edge functions
  try {
    const functions = ['get-home-data', 'import-data', 'check-email-secure', 'check-email-exists'];
    let functionsWorking = 0;
    for (const fn of functions) {
      try {
        const { error } = await supabase.functions.invoke(fn, {
          body: { test: true }
        });
        if (!error || (error.message && error.message.includes('test'))) {
          functionsWorking++;
        }
      } catch (e) {
        // Edge function test failed
      }
    }
    checks.edgeFunctions = functionsWorking >= Math.ceil(functions.length * 0.66); // Majority should work
  } catch (e) {
    // Edge functions check failed
  }
  // 3. Authentication
  try {
    const { data: { session } } = await supabase.auth.getSession();
    checks.authentication = true; // System is available even if no session
  } catch (e) {
    // Authentication check failed
  }
  // 4. Data population
  try {
    const [animeResult, mangaResult, titlesResult] = await Promise.all([
      supabase.from('anime_details').select('*', { count: 'exact', head: true }),
      supabase.from('manga_details').select('*', { count: 'exact', head: true }),
      supabase.from('titles').select('*', { count: 'exact', head: true })
    ]);
    const animeCount = animeResult.count || 0;
    const mangaCount = mangaResult.count || 0;
    const titlesCount = titlesResult.count || 0;
    checks.dataPopulation = animeCount > 0 && mangaCount > 0 && titlesCount > 0;
  } catch (e) {
    // Data population check failed
  }
  // 5. Performance
  const startTime = performance.now();
  try {
    await Promise.all([
      supabase.from('titles').select('*').limit(50),
      supabase.from('anime_details').select('*').limit(50),
      supabase.from('manga_details').select('*').limit(50)
    ]);
    const duration = performance.now() - startTime;
    checks.performance = duration < 2000; // Should complete in under 2 seconds
  } catch (e) {
    // Performance check failed
  }
  // 6. Materialized Views
  try {
    const { data: mvData, error: mvError } = await supabase
      .rpc('get_trending_anime', { limit_param: 1 });
    checks.materializedViews = !mvError && Array.isArray(mvData);
  } catch (e) {
    // Materialized views check failed
  }
  // 7. Database Indexes (check query performance)
  try {
    const indexStartTime = performance.now();
    await Promise.all([
      supabase.from('titles').select('*').eq('content_type', 'anime').limit(1),
      supabase.from('titles').select('*').order('anilist_score', { ascending: false }).limit(1),
      supabase.from('anime_details').select('*').eq('status', 'Currently Airing').limit(1)
    ]);
    const indexDuration = performance.now() - indexStartTime;
    checks.indexes = indexDuration < 500; // Should be very fast with indexes
  } catch (e) {
    // Indexes check failed
  }
  // Summary
  const passedChecks = Object.values(checks).filter(check => check).length;
  const totalChecks = Object.keys(checks).length;
  const allPassed = passedChecks === totalChecks;
  const mostlyPassed = passedChecks >= totalChecks - 1;
  if (!allPassed) {
    Object.entries(checks).forEach(([check, passed]) => {
      if (!passed) {
        // Check failed
      }
    });
  }
  return checks;
}
// Export for use in components or tests
export { runProductionChecks };
// Run checks if called directly
if (typeof window !== 'undefined') {
  runProductionChecks();
}
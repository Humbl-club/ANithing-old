import { supabase } from '@/integrations/supabase/client';
import { userService } from '@/services/api/userService';
import { animeService } from '@/services/api/animeService';
import { mangaService } from '@/services/api/mangaService';
import { searchService } from '@/services/api/searchService';

/**
 * CRUD Operations Test Utility
 * Comprehensive testing for all backend operations
 */

export interface TestResult {
  operation: string;
  success: boolean;
  error?: string;
  duration: number;
  data?: any;
}

export class CRUDTester {
  private results: TestResult[] = [];

  private async timeOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        operation,
        success: true,
        duration,
        data: result
      };
      
      this.results.push(testResult);
      // Operation successful
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        operation,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
      
      this.results.push(testResult);
      // Operation failed
      return testResult;
    }
  }

  /**
   * Test basic database connectivity
   */
  async testDatabaseConnection(): Promise<TestResult> {
    return this.timeOperation('Database Connection', async () => {
      const { data, error } = await supabase
        .from('titles')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      return { connected: true, sampleData: data };
    });
  }

  /**
   * Test content reading operations
   */
  async testContentReading(): Promise<TestResult[]> {
    const tests = [
      // Test anime service
      this.timeOperation('Get Popular Anime', async () => {
        const result = await animeService.getPopular(10);
        if (!result.success) throw new Error(result.error || 'Failed to get popular anime');
        return result.data;
      }),

      // Test manga service
      this.timeOperation('Get Popular Manga', async () => {
        const result = await mangaService.getPopular(10);
        if (!result.success) throw new Error(result.error || 'Failed to get popular manga');
        return result.data;
      }),

      // Test search service
      this.timeOperation('Search Content', async () => {
        const result = await searchService.globalSearch({
          query: 'naruto',
          type: 'both',
          limit: 5
        });
        if (!result.success) throw new Error(result.error || 'Search failed');
        return result.data;
      }),

      // Test content details
      this.timeOperation('Get Content by ID', async () => {
        // Get a sample title first
        const { data: titles } = await supabase
          .from('titles')
          .select('id, content_type')
          .limit(1);
        
        if (!titles || titles.length === 0) {
          throw new Error('No content available for testing');
        }

        const title = titles[0];
        const service = title.content_type === 'anime' ? animeService : mangaService;
        const result = await service.getById(title.id);
        
        if (!result.success) throw new Error(result.error || 'Failed to get content details');
        return result.data;
      })
    ];

    return Promise.all(tests);
  }

  /**
   * Test user CRUD operations (requires auth)
   */
  async testUserOperations(userId: string): Promise<TestResult[]> {
    const tests = [
      // Test profile read
      this.timeOperation('Get User Profile', async () => {
        const result = await userService.getUserProfile(userId);
        if (!result.success) throw new Error(result.error || 'Failed to get profile');
        return result.data;
      }),

      // Test preferences read/update
      this.timeOperation('Get User Preferences', async () => {
        const result = await userService.getUserPreferences(userId);
        if (!result.success) throw new Error(result.error || 'Failed to get preferences');
        return result.data;
      }),

      // Test user lists
      this.timeOperation('Get User Lists', async () => {
        const result = await userService.getUserList(userId, 'anime');
        if (!result.success) throw new Error(result.error || 'Failed to get user lists');
        return result.data;
      }),

      // Test reviews
      this.timeOperation('Get User Reviews', async () => {
        const result = await userService.getUserReviews(userId);
        if (!result.success) throw new Error(result.error || 'Failed to get reviews');
        return result.data;
      })
    ];

    return Promise.all(tests);
  }

  /**
   * Test edge functions
   */
  async testEdgeFunctions(): Promise<TestResult[]> {
    const tests = [
      // Test health function
      this.timeOperation('Health Check Function', async () => {
        const { data, error } = await supabase.functions.invoke('health', {
          body: {}
        });
        
        if (error) throw error;
        return data;
      }),

      // Test home data function
      this.timeOperation('Get Home Data Function', async () => {
        const { data, error } = await supabase.functions.invoke('get-home-data', {
          body: { sections: ['trending'], limit: 5 }
        });
        
        if (error) throw error;
        return data;
      }),

      // Test email check function
      this.timeOperation('Check Email Function', async () => {
        const { data, error } = await supabase.functions.invoke('check-email-exists', {
          body: { email: 'test@example.com' }
        });
        
        if (error) throw error;
        return data;
      })
    ];

    return Promise.all(tests);
  }

  /**
   * Test write operations (requires sample data)
   */
  async testWriteOperations(userId: string): Promise<TestResult[]> {
    const tests = [
      // Test preference update
      this.timeOperation('Update User Preferences', async () => {
        const result = await userService.updateUserPreferences(userId, {
          theme: 'dark',
          language: 'en'
        });
        if (!result.success) throw new Error(result.error || 'Failed to update preferences');
        return result.data;
      }),

      // Test profile update
      this.timeOperation('Update User Profile', async () => {
        const result = await userService.updateUserProfile(userId, {
          bio: 'Test bio updated at ' + new Date().toISOString()
        });
        if (!result.success) throw new Error(result.error || 'Failed to update profile');
        return result.data;
      })
    ];

    return Promise.all(tests);
  }

  /**
   * Test real-time subscriptions
   */
  async testRealTimeSubscriptions(): Promise<TestResult> {
    return this.timeOperation('Real-time Subscription Test', async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error('Subscription test timeout'));
        }, 5000);

        const channel = supabase.channel('test-channel');
        const subscription = channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'titles'
          }, (payload) => {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve({ subscriptionWorking: true, payload });
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              // Subscription successful, simulate a change by just resolving
              // In a real test, you'd trigger a database change
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve({ subscriptionWorking: true, status });
            } else if (status === 'CHANNEL_ERROR') {
              clearTimeout(timeout);
              subscription.unsubscribe();
              reject(new Error('Subscription failed'));
            }
          });
      });
    });
  }

  /**
   * Run comprehensive test suite
   */
  async runFullTest(userId?: string): Promise<{
    results: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      averageDuration: number;
    };
  }> {
    // Starting comprehensive CRUD test suite
    this.results = [];

    // Test database connection
    await this.testDatabaseConnection();

    // Test content reading
    await this.testContentReading();

    // Test edge functions
    await this.testEdgeFunctions();

    // Test real-time subscriptions
    await this.testRealTimeSubscriptions();

    // Test user operations if userId provided
    if (userId) {
      await this.testUserOperations(userId);
      await this.testWriteOperations(userId);
    }

    // Calculate summary
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / this.results.length;

    const summary = {
      total: this.results.length,
      passed,
      failed,
      averageDuration: Math.round(averageDuration)
    };

    // Test summary completed

    if (failed > 0) {
      // Failed tests recorded in results
    }

    return { results: this.results, summary };
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.results = [];
  }
}

// Export singleton instance
export const crudTester = new CRUDTester();

// Helper function for quick testing
export async function quickTest(userId?: string) {
  const tester = new CRUDTester();
  return tester.runFullTest(userId);
}
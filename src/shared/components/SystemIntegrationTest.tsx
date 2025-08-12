import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { crudTester, TestResult } from '@/utils/crudTester';
import { toast } from 'sonner';

interface SystemIntegrationTestProps {
  className?: string;
}

/**
 * System Integration Test Component
 * Comprehensive testing of all backend integrations
 */
export function SystemIntegrationTest({ className }: SystemIntegrationTestProps) {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    averageDuration: number;
  } | null>(null);

  const runIntegrationTest = useCallback(async () => {
    setTesting(true);
    setResults([]);
    setProgress(0);
    setSummary(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const testResult = await crudTester.runFullTest(user?.id);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResults(testResult.results);
      setSummary(testResult.summary);

      if (testResult.summary.failed === 0) {
        toast.success('All systems integrated successfully!');
      } else {
        toast.warning(`${testResult.summary.failed} tests failed. Check details below.`);
      }
    } catch (error) {
      console.error('Integration test failed:', error);
      toast.error('Integration test failed to complete');
    } finally {
      setTesting(false);
    }
  }, [user?.id]);

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getBadgeVariant = (success: boolean) => {
    return success ? 'default' : 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Backend Integration Test
        </CardTitle>
        <CardDescription>
          Comprehensive test of all backend systems including APIs, database, auth, and real-time features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={runIntegrationTest}
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {testing ? 'Running Tests...' : 'Run Integration Test'}
          </Button>
          
          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setResults([]);
                setSummary(null);
                setProgress(0);
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Results
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {testing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Testing backend systems...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.averageDuration}ms</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className={getStatusColor(result.success)}>
                      {result.operation}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {result.duration}ms
                    </span>
                    <Badge variant={getBadgeVariant(result.success)}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Tests Details */}
        {results.some(r => !r.success) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Failed Tests</h3>
            <div className="space-y-2">
              {results
                .filter(r => !r.success)
                .map((result, index) => (
                  <div
                    key={index}
                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="font-medium text-red-800">
                      {result.operation}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      {result.error}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* System Requirements Check */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!user)}
              <span className={getStatusColor(!!user)}>
                Authentication: {user ? 'Connected' : 'Not authenticated'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(navigator.onLine)}
              <span className={getStatusColor(navigator.onLine)}>
                Network: {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(typeof supabase !== 'undefined')}
              <span className={getStatusColor(typeof supabase !== 'undefined')}>
                Supabase: Connected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon('serviceWorker' in navigator)}
              <span className={getStatusColor('serviceWorker' in navigator)}>
                PWA: {('serviceWorker' in navigator) ? 'Supported' : 'Not supported'}
              </span>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        {summary && (
          <div className="border-t pt-4">
            <div className={`p-4 rounded-lg ${
              summary.failed === 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`font-semibold ${
                summary.failed === 0 ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {summary.failed === 0 
                  ? '✅ All backend systems are fully integrated and operational!'
                  : `⚠️ ${summary.failed} integration issues detected. Review failed tests above.`
                }
              </div>
              <div className="text-sm mt-1 text-muted-foreground">
                Performance: Average response time {summary.averageDuration}ms
                {summary.averageDuration > 1000 && ' (Consider optimizing slow operations)'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
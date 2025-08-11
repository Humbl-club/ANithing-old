// Deno type declarations for edge functions
declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
    }
    
    const env: Env;
    
    function serve(handler: (request: Request) => Response | Promise<Response>): void;
  }
}

export {};

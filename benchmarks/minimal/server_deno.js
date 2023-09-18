const endpoints = ['/'];

// Start a HTTP server using Deno.serve
const server =  Deno.serve({ 
    port: 0,
    onListen: (params) => {
        const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${params.port}${endpoint}`);
        console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
    }  }, (req) => new Response("Hello", {
      status: 200,
      headers: {
          "Cache-Control": "no-transform"
      },
    }));

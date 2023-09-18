const endpoints = ['/'];

// Start a HTTP server using Bun.serve
const server =  Bun.serve({ 
    port: 0,
    fetch: (req) => new Response("Hello", {
      status: 200,
      headers: {
          "Cache-Control": "no-transform"
      },
    })
});

const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${server.port}${endpoint}`);
console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
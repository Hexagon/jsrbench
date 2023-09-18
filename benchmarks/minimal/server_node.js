import * as http from "node:http";

const endpoints = ['/'];

const server = http.createServer((req, res) => {
    res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
    return res.end("Hello");
});

server.listen(0, () => {
    const port = server.address().port;
    const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${port}${endpoint}`);
    console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
});

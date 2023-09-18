import * as http from "node:http";
import * as fs from "node:fs";
import * as url from "node:url";
import { base64 } from "@hexagon/base64";
import { checkPrime } from "../../common/prime.js";
import { longRawString } from "../../common/string.js";

const endpoints = ['/static', '/base64', '/regex', '/json', '/compute-prime'];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    switch (parsedUrl.pathname) {
        case '/static':
            // Simple static content serving example, assuming `public` folder contains your static files
            const filePath = `./benchmarks/native/public/index.html`;
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404,undefined,{"Cache-Control": "no-transform"});
                    res.end("Not found");
                } else {
                    res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
                    res.end(data);
                }
            });
            break;
        case "/base64":
            const b64string = base64.fromString(longRawString);
            res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
            res.end(b64string);
            break;
            
        case '/json':
            const jsonResponse = {
                message: "Hello, World!",
                number: 5,
                literal: `(${4}+${4})*${21.2}/${2}=${84.8}`
            };
            res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
            res.end(JSON.stringify(jsonResponse));
            break;
        case "/regex":
            const mail = "example-email-address@hexagon.example-testing.wat";
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const validString = emailRegex.test(mail) ? "valid" : "not valid";
            res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
            res.end(validString);
            break;
        
        case '/compute-prime':
            const toCheck = 30000000000000000n;
            if (checkPrime(toCheck)) {
                res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
                res.end(`Prime number ${toCheck} is a prime!`);
            } else {
                res.writeHead(200,undefined,{"Cache-Control": "no-transform"});
                res.end(`Prime number ${toCheck} is not a prime!`);
            }
            break;

        default:
            res.writeHead(404,undefined,{"Cache-Control": "no-transform"});
            res.end('Not Found');
            break;
    }
});

server.listen(0, () => {
    const port = server.address().port;
    const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${port}${endpoint}`);
    console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
});

import { checkPrime } from "../../common/prime.js";
import { longRawString } from "../../common/string.js";
import { base64 } from "@hexagon/base64";

const endpoints = ['/static', '/base64', '/regex', '/json', '/compute-prime'];

// Start a HTTP server using Bun.serve
const server =  Bun.serve({ 
    port: 0,
    fetch: async (req) => {
    const url = new URL(req.url);
  
    switch (url.pathname) {
      case "/static":
        // Static content handling
        const filePath = './benchmarks/native/public/index.html'; // Change as per your structure
        try {
          const data = await Bun.file(filePath);
          return new Response(data, {
            status: 200,
            headers: {
                "content-type": "text/html",
                "Cache-Control": "no-transform"
            },
          });
        } catch (error) {
            return new Response(error, {
                status: 404,
                headers: {
                  "Cache-Control": "no-transform"
                }
              });
        }
        break;
      case "/base64":
        const b64string = base64.fromString(longRawString);
        return new Response(b64string, {
            status: 200,
            headers: {
                "Cache-Control": "no-transform"
            }
        });
        break;
      case "/json":
        const jsonResponse = {
          message: "Hello, World!",
          number: 5,
          literal: `(${4}+${4})*${21.2}/${2}=${84.8}`
        };
        return Response.json(jsonResponse, {
            status: 200,
            headers: {
                "Cache-Control": "no-transform"
            }
        });
        break;
        case "/regex":
          const mail = "example-email-address@hexagon.example-testing.wat";
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const validString = emailRegex.test(mail) ? "valid" : "not valid";
          return new Response(validString, {
              status: 200,
              headers: {
                  "Cache-Control": "no-transform"
              }
          });
          break;
    
      case "/compute-prime":
        const toCheck = 30000000000000000n;
        if (checkPrime(toCheck)) {
            return new Response(`Prime number ${toCheck} is a prime!`, {
                status: 200,
                headers: {
                  "Cache-Control": "no-transform"
                }
              });
        } else {
            return new Response(`Prime number ${toCheck} is not a prime!`, {
                status: 200,
                headers: {
                  "Cache-Control": "no-transform"
                }
              });
        }
        break;
  
      default:
        return new Response("Not found", {
          status: 404,
          headers: {
            "Cache-Control": "no-transform"
          }
        });
        break;
    }
  }
});

const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${server.port}${endpoint}`);
console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
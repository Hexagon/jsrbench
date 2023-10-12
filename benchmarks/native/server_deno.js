import { checkPrime } from "../../common/prime.js";

const endpoints = ['/static', '/regex', '/json', '/compute-prime'];

// Start a HTTP server using Deno.serve
const server =  Deno.serve({ 
    port: 0,
    onListen: (params) => {
        const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${params.port}${endpoint}`);
        console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
    }  }, async (req) => {

    const url = new URL(req.url);
  
    switch (url.pathname) {
      case "/static":
        // Static content handling
        const filePath = './benchmarks/native/public/index.html'; // Change as per your structure
        try {
          const data = await Deno.readFile(filePath);
          return new Response(data, {
            status: 200,
            headers: {
                "content-type": "text/html",
                "Cache-Control": "no-transform"
            },
          });
        } catch (error) {
            return new Response(error, {
                status: 404
              });
        }
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
      
      case "/json":
        return Response.json({
          message: "Hello, World!",
          number: 5,
          literal: `(${4}+${4})*${21.2}/${2}=${84.8}`
        }, {
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
  });

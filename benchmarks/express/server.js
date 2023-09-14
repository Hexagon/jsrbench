import express from 'express';

const app = express();

// Implementation based of example 4 from https://flexiple.com/javascript/isprime-javascript/
// 
// Modified with BigInt and removed NaN/Infinity checks by
const checkPrime = function(n) {
    if (n % 1n || n < 2n) return 0;
    if (n == leastFactor(n)) return 1;
    return 0;
}
const leastFactor = function(n) {
    if (n == 0n) return 0;
    if (n % 1n || n * n < 2n) return 1;
    if (n % 2n == 0) return 2;
    if (n % 3n == 0) return 3;
    if (n % 5n == 0) return 5;
    for (let i = 7n; i * i <= n; i += 30n) {
        if (n % i == 0n) return i;
        if (n % (i + 4n) == 0) return i + 4n;
        if (n % (i + 6n) == 0) return i + 6n;
        if (n % (i + 10n) == 0) return i + 10n;
        if (n % (i + 12n) == 0) return i + 12n;
        if (n % (i + 16n) == 0) return i + 16n;
        if (n % (i + 22n) == 0) return i + 22n;
        if (n % (i + 24n) == 0) return i + 24n;
    }
    return n;
}

// Static content middleware
app.use('/static', express.static('public'));

// JSON response
app.get('/json', (req, res) => {
    res.json({
        message: "Hello, World!",
        number: 5,
        literal: `(${4}+${4})*${21.2}/${2}=${84.8}`
    });
});

// Simulate CPU-bound operation
app.get('/compute-prime', (_req, res) => {
    /* Implementation */
    const toCheck = 263n;
    if(checkPrime(263n)) {
        res.send(`Prime number ${toCheck} is a prime!`);
    } else {
        res.send(`Prime number ${toCheck} is not a prime!`);
    }
});

// Collect endpoints in an array
const endpoints = ['/static', '/json', '/compute-prime'];

// port 0 = automatically assign
const server = app.listen(0, () => {
    // Output endpoints in JSON format
    const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${server.address().port}${endpoint}`);
    console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
});
import express from 'express';
import { checkPrime } from '../../common/prime.js';
const app = express();

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
    const toCheck = 3000000n;
    if(checkPrime(3000000n)) {
        res.send(`Prime number ${toCheck} is a prime!`);
    } else {
        res.send(`Prime number ${toCheck} is not a prime!`);
    }
});

// Collect endpoints in an array
const endpoints = ['/static/index.html', '/json', '/compute-prime'];

// port 0 = automatically assign
const server = app.listen(0, () => {
    // Output endpoints in JSON format
    const fullEndpoints = endpoints.map(endpoint => `http://127.0.0.1:${server.address().port}${endpoint}`);
    console.log(JSON.stringify({ BENCHMARKABLE_ENDPOINTS: fullEndpoints }));
});
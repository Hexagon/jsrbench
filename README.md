# JavaScript Runtime Benchmark (jsrbench)

This repository hosts Hexagon's **JavaScript Runtime Benchmark**. The primary objective is to deliver an impartial comparison of various JavaScript and TypeScript runtimes under real-world web conditions. Ideally, all test scripts for different runtimes should be identical, achieving a uniform benchmarking environment, such as my Express.js example (which currently is the only one).

## Supported Runtimes:

- **Node.js**
- **Deno**
- **Bun.js**

## Latest automated results:

The tests are executed by GitHub Actions periodically, using the latest version of each runtime:

```
JavaScript Runtime Benchmark Report
Benchmark: express
Date: 2023-10-12
Node Version: node v20.8.0
Deno Version: deno 1.37.1 (release, x86_64-unknown-linux-gnu)
Bun Version: bun v1.0.6
Siege Version: SIEGE 4.1.7-b5
```

### Summary


| Runtime | Average Transaction Rate | Difference from Reference |
| --- | --- | --- |
| Node.js | 880.91 | 73.08% |
| Deno | 1205.36 | 100% |
| Bun | 1671.81 | 138.70% |


### Detailed result

| Runtime | Concurrency | Endpoint | TransactionRate |
| --- | --- | --- | --- |
| node | 10 | http://127.0.0.1:39719/static/index.html | 554.71 |
| node | 100 | http://127.0.0.1:39719/static/index.html | 652.27 |
| node | 10 | http://127.0.0.1:39719/json | 989.14 |
| node | 100 | http://127.0.0.1:39719/json | 945.34 |
| node | 10 | http://127.0.0.1:39719/compute-prime | 1056.57 |
| node | 100 | http://127.0.0.1:39719/compute-prime | 1087.41 |
| deno | 10 | http://127.0.0.1:35903/static/index.html | 618.36 |
| deno | 100 | http://127.0.0.1:35903/static/index.html | 639.8 |
| deno | 10 | http://127.0.0.1:35903/json | 1531.82 |
| deno | 100 | http://127.0.0.1:35903/json | 1542.71 |
| deno | 10 | http://127.0.0.1:35903/compute-prime | 1145.82 |
| deno | 100 | http://127.0.0.1:35903/compute-prime | 1753.65 |
| bun | 10 | http://127.0.0.1:54897/static/index.html | 1235.83 |
| bun | 100 | http://127.0.0.1:54897/static/index.html | 1323.62 |
| bun | 10 | http://127.0.0.1:54897/json | 1693.91 |
| bun | 100 | http://127.0.0.1:54897/json | 2629.15 |
| bun | 10 | http://127.0.0.1:54897/compute-prime | 1672.04 |
| bun | 100 | http://127.0.0.1:54897/compute-prime | 1476.32 |

## Benchmarks:

Currently, the suite includes the following benchmarks:

1. **Express.js Benchmark**: 
    - Express.js is a leading web server framework. For this benchmark, Express.js is utilized as it is compatible across all three runtimes, ensuring an authentic 'apples-to-apples' comparison.
2. **Native Benchmark**: 
    - Uses the best method of each runtime to serve the requests.
3. **Minimal Benchmark**: 
    - Uses a very minimal best method of each runtime to serve the requests.

### Adding More Benchmarks:

1. Navigate to the `benchmarks/` folder and create a new directory named after the benchmark you want to introduce (e.g., `koa`, `fastify`).
2. Inside this directory, set up the server implementation for each runtime. The recommended naming pattern is `server.js` for a general-purpose server script or `server_<runtime>.js` (e.g., `server_node.js`, `server_deno.js`, `server_bun.js`) for runtime-specific scripts.
3. Update this README to mention the new benchmark.

## Running the Benchmarks:

Before you try to run a benchmark, make sure it has all Node/Bun dependencies installed, for the `express` benchmark:

```bash
cd benchmarks/express
npm install
```

Then, to execute a specific benchmark:

`node benchmark.js <benchmark_name>``

Replace `<benchmark_name>` with the desired benchmark's name, for example `express`.

### Output:

While running a benchmark, status will be printed on the console:

- Versions of the tested runtimes.
- Different concurrency levels used.

While comprehensive benchmark results, indicating requests per second, average latency, and other relevant metrics for each benchmark iteration will be written to `result/<benchmark_name>_<YYYY-MM-DD>/<runtime>/<endpoint>_<concurrency>.txt`

## How the Benchmarking Works:

The benchmarking process employs the following methodology:

1. **Initialization**: The script requires the user to specify a benchmark by name. The script will then search for corresponding server implementations within the `benchmarks/` directory.
  
2. **Runtime Detection**: For each supported runtime (Node.js, Deno, Bun.js), the script looks for a general `server.js` file or a runtime-specific variant such as `server_node.js`. This provides flexibility in using a common script or runtime-optimized implementations.

3. **Server Boot Up**: For each runtime, the server is started, and it broadcasts the endpoints that are available for benchmarking.

4. **Benchmark Execution**: For each detected endpoint and for varying concurrency levels, the `siege` tool is used to bombard the server and record performance metrics. The results, including requests per second, average latency, and more, are then logged.

5. **Cleanup**: After benchmarking an endpoint for all concurrency levels, the server process is terminated, ensuring no interference with subsequent tests.

### Prerequisites:

1. **Supported Runtimes**: Ensure that you have Node.js, Deno, and Bun.js installed and available in your system's PATH.

2. **Siege**: The benchmarking relies on the `siege` tool. A recent version supporting the `--json-output`-flag is required. You find the latest version [here](https://github.com/JoeDog/siege).

## Contribution:

Contributions to extend or improve this suite are highly encouraged. When incorporating a new benchmark, please follow the aforementioned steps. It's crucial that your benchmark operates consistently across all specified runtimes.
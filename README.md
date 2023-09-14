# JavaScript Runtime Benchmark (jsrbench)

This repository hosts Hexagon's **JavaScript Runtime Benchmark**. The primary objective is to deliver an impartial comparison of various JavaScript and TypeScript runtimes under real-world web conditions. Ideally, all test scripts for different runtimes should be identical, achieving a uniform benchmarking environment, such as my Express.js example (which currently is the only one).

## Supported Runtimes:

- **Node.js**
- **Deno**
- **Bun.js**

## Benchmarks:

Currently, the suite includes the following benchmarks:

1. **Express.js Benchmark**: 
    - Express.js is a leading web server framework. For this benchmark, Express.js is utilized as it is compatible across all three runtimes, ensuring an authentic 'apples-to-apples' comparison.

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

    ./benchmark.sh <benchmark_name>

Replace `<benchmark_name>` with the desired benchmark's name, for example `express`.

### Output:

On completion of the benchmark, a detailed report will be saved as `result/<benchmark_name>_<YYYY-MM-DD>.txt`. The report will cover:

- Versions of the tested runtimes.
- Different concurrency levels used.

Comprehensive benchmark results, indicating requests per second, average latency, and other relevant metrics for each benchmark iteration will be outputed in `result/<benchmark_name>_<YYYY-MM-DD>.txt`

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

3. **Permissions**: Ensure the `benchmark.sh` script has execute permissions. You can set this using the command: `chmod +x benchmark.sh`.

## Contribution:

Contributions to extend or improve this suite are highly encouraged. When incorporating a new benchmark, please follow the aforementioned steps. It's crucial that your benchmark operates consistently across all specified runtimes.
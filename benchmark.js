import { execSync, exec, spawn } from 'node:child_process';
import { existsSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SIEGE_TIME = "2S";
const OUTPUT_FOLDER = "result";
const BENCHMARK_NAME = process.argv[2];
const TODAY_DATE = new Date().toISOString().split('T')[0];

const getNodeVersion = () => `node ${execSync('node -v').toString().trim()}`;
const getDenoVersion = () => execSync('deno --version').toString().split('\n')[0];
const getBunVersion = () => `bun v${execSync('bun --version').toString().trim()}`;
const getSiegeVersion = () => execSync('siege --version 2>&1').toString().split('\n')[0];

const fetchScriptPath = (benchmark, runtime) => {
    const defaultPath = `benchmarks/${benchmark}/server.js`;
    const runtimePath = `benchmarks/${benchmark}/server_${runtime}.js`;

    if (existsSync(defaultPath)) {
        return defaultPath;
    } else if (existsSync(runtimePath)) {
        return runtimePath;
    } else {
        throw new Error(`No valid script found for benchmark: ${benchmark} and runtime: ${runtime}`);
    }
};

const execSiege = (command, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const siegeProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });

        setTimeout(() => {
            siegeProcess.kill();
            reject(new Error('Siege process killed due to timeout'));
        }, timeout);
    });
};

const fetchEndpoints = (runtime) => {
    const SCRIPT = fetchScriptPath(BENCHMARK_NAME, runtime);

    let server;
    let output = '';
    
    const spawnOptions = {
        detached: true,  // This is important
        stdio: 'pipe'
    };
    
    switch (runtime) {
        case "node":
            server = spawn('node', [SCRIPT], spawnOptions);
            break;
        case "deno":
            server = spawn('deno', ['run', '-A', SCRIPT], spawnOptions);
            break;
        case "bun":
            server = spawn('bun', [SCRIPT], spawnOptions);
            break;
        default:
            throw new Error(`Unknown runtime: ${runtime}`);
    }

    return new Promise((resolve, reject) => {
        server.stdout.on('data', (data) => {
            output += data.toString();
            // Check if we have received the full BENCHMARKABLE_ENDPOINTS message
            if (output.includes("BENCHMARKABLE_ENDPOINTS")) {
                try {
                    const parsedOutput = JSON.parse(output);
                    if (!parsedOutput.BENCHMARKABLE_ENDPOINTS) {
                        reject(new Error("BENCHMARKABLE_ENDPOINTS not found in server output"));
                        return;
                    }
                    const endpoints = parsedOutput.BENCHMARKABLE_ENDPOINTS;
                    resolve({ endpoints, server });
                } catch (error) {
                    reject(error);
                }
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`Server error output: ${data}`);
        });

        server.on('error', (error) => {
            reject(error);
        });
    });
};

const runTest = async (runtime, concurrency, endpoint) => {
    const OUTPUT_FILE_NAME = `${endpoint.replace(/[^a-zA-Z0-9]/g, "_")}_${concurrency}.txt`;
    const OUTPUT_SUBFOLDER = `${BENCHMARK_NAME.replace(/[^a-zA-Z0-9]/g, "_")}_${TODAY_DATE}`;
    const RESULT_FILE = join(OUTPUT_FOLDER, OUTPUT_SUBFOLDER, runtime, OUTPUT_FILE_NAME);

    mkdirSync(dirname(RESULT_FILE), { recursive: true });
    const siegeCommand = `siege --json-output -c ${concurrency} -t ${SIEGE_TIME} ${endpoint} >> ${RESULT_FILE}`;
    console.log(`Calling siege: ${siegeCommand}`)
    await new Promise(resolve => setTimeout(resolve, 2000));  // Wait for 2 seconds
    await execSiege(siegeCommand, 15000);  // 15 seconds timeout
    console.log(`Results written to ${RESULT_FILE}`);
};

const main = async () => {
    if (process.argv.length !== 3) {
        console.log("Usage: node benchmark.mjs <benchmark_name>");
        process.exit(1);
    }

    mkdirSync(OUTPUT_FOLDER, { recursive: true });
    const header = `
JavaScript Runtime Benchmark Report
Benchmark: ${BENCHMARK_NAME}
Date: ${TODAY_DATE}
Node Version: ${getNodeVersion()}
Deno Version: ${getDenoVersion()}
Bun Version: ${getBunVersion()}
Siege Version: ${getSiegeVersion()}
--------------------------
`;
    console.log(header);

    const runtimes = ["node", "deno", "bun"];
    for (const runtime of runtimes) {
        console.log(`Starting server using ${runtime}`);
        const { endpoints, server } = await fetchEndpoints(runtime);
        console.log(`Endpoints received, starting benchmark ...`);

        for (const endpoint of endpoints) {
            for (const concurrency of [10, 100]) {
                await runTest(runtime, concurrency.toString(), endpoint);
            }
        }
        server.kill();  // This will send the default 'SIGTERM'
        process.kill(-server.pid);  // This will send 'SIGTERM' to the entire process group
    }
    console.log(`Benchmarking completed.`);
};

main();

#!/bin/bash

# Check if the benchmark name is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./benchmark.sh <benchmark_name>"
    exit 1
fi

# Settings
SIEGE_TIME="10S"
OUTPUT_FOLDER="result"

# Internal
BENCHMARK_NAME=$1
TODAY_DATE=$(date '+%Y-%m-%d')
REPORT_FILE="${OUTPUT_FOLDER}/${BENCHMARK_NAME}_${TODAY_DATE}.log"

# Fetch the version for each runtime
NODE_VERSION=$(node -v)
DENO_VERSION=$(deno --version | head -n 1)
BUN_VERSION="bun v$(bun --version)"

fetch_script_path() {
  local benchmark="$1"
  local runtime="$2"
  
  local default_path="benchmarks/$benchmark/server.js"
  local runtime_path="benchmarks/$benchmark/server_${RUNTIME}.js"
  
  if [ -f "$default_path" ]; then
    echo "$default_path"
  elif [ -f "$runtime_path" ]; then
    echo "$runtime_path"
  else
    echo "No valid script found for benchmark: $benchmark and runtime: $RUNTIME"
    exit 1
  fi
}

fetch_endpoints() {
  local SCRIPT=$(fetch_script_path $BENCHMARK_NAME $RUNTIME)
  TMP_OUTPUT_FILE="tmp_output_$RUNTIME.txt"
  
  # Start the server based on the runtime and fetch its output in the background
  case "$RUNTIME" in 
    "node") node $SCRIPT > $TMP_OUTPUT_FILE 2>&1 & ;;
    "deno") deno run -A $SCRIPT > $TMP_OUTPUT_FILE 2>&1 & ;;
    "bun") bun $SCRIPT > $TMP_OUTPUT_FILE 2>&1 & ;;
    *) echo "Unknown runtime: $RUNTIME"; exit 1 ;;
  esac
  
  SERVER_PID="$!"
  echo "Server started with PID $SERVER_PID. Waiting for output..." >> $REPORT_FILE

  # Monitor the output to see if the server has started
  while [ ! -f "$TMP_OUTPUT_FILE" ] || ! grep -q 'BENCHMARKABLE_ENDPOINTS' "$TMP_OUTPUT_FILE"; do
      sleep 1
  done

  # Fetch the endpoints from the file
  ENDPOINTS_RESULT=$(awk -F'BENCHMARKABLE_ENDPOINTS:' '/BENCHMARKABLE_ENDPOINTS:/ {print $2}' $TMP_OUTPUT_FILE | tr ',' '\n')
  cat $TMP_OUTPUT_FILE >> $REPORT_FILE

  # Cleanup
  rm $TMP_OUTPUT_FILE
}

run_test() {
  RUNTIME=$1
  concurrency=$2
  endpoint=$3
  
  echo "Testing with $RUNTIME at $concurrency concurrent connections for endpoint $endpoint..." >> $REPORT_FILE
  sleep 5
  
  # Run siege test
  OUTPUT_FILE_NAME="${endpoint//[^[:alnum:]]/_}_${concurrency//[^[:alnum:]]/_}.txt"
  OUTPUT_SUBFOLDER="${BENCHMARK_NAME//[^[:alnum:]]/_}_${TODAY_DATE}"
  RESULT_FILE="${OUTPUT_FOLDER}/${OUTPUT_SUBFOLDER}/${RUNTIME}/${OUTPUT_FILE_NAME}"
  mkdir -p "${OUTPUT_FOLDER}/${OUTPUT_SUBFOLDER}/${RUNTIME}"
  siege -c $concurrency -t $SIEGE_TIME $endpoint >> $RESULT_FILE
  echo "Results written to ${RESULT_FILE}" >> $REPORT_FILE
}

kill_server() {
  # Kill the server process
  ps -p $SERVER_PID > /dev/null && kill -9 $SERVER_PID > /dev/null
}

mkdir -p "${OUTPUT_FOLDER}"
echo "Benchmark Test Report for $BENCHMARK_NAME" > $REPORT_FILE
echo "Date: $TODAY_DATE" >> $REPORT_FILE
echo "--------------------------" >> $REPORT_FILE

# Loop through the runtimes
for RUNTIME in "node" "deno" "bun"; do
  echo "Starting server using $RUNTIME" >> $REPORT_FILE
  fetch_endpoints
  echo "Endpoints received, starting benchmark ..." >> $REPORT_FILE
  for endpoint in $ENDPOINTS_RESULT; do
    for concurrency in 10 100; do
      run_test $RUNTIME $concurrency $endpoint
    done
  done
  kill_server
done

echo "Benchmarking completed. Check the report in $REPORT_FILE"

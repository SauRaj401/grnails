import { spawn } from "node:child_process";

const phpPort = process.env.PHP_BACKEND_PORT || "8000";
const phpHost = process.env.PHP_BACKEND_HOST || "127.0.0.1";
const phpBackendUrl = process.env.PHP_BACKEND_URL || `http://${phpHost}:${phpPort}`;

function startProcess(command, args, label, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  child.on("error", (error) => {
    console.error(`[${label}]`, error.message);
    process.exitCode = 1;
  });

  return child;
}

console.log(`[dev] Starting PHP backend on ${phpBackendUrl}`);
const phpServer = startProcess(
  "php",
  ["-S", `${phpHost}:${phpPort}`, "-t", "."],
  "php",
);

console.log("[dev] Starting Vite on http://localhost:5173");
const viteServer = startProcess("vite", ["dev"], "vite", {
  PHP_BACKEND_URL: phpBackendUrl,
  VITE_PHP_BACKEND_URL: phpBackendUrl,
});

const shutdown = () => {
  phpServer.kill();
  viteServer.kill();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
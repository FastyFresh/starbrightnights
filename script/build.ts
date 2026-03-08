import { execSync } from "child_process";
import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("Building client with Vite...");
execSync("npx vite build", { cwd: root, stdio: "inherit" });

console.log("Bundling server with esbuild...");

// Plugin to stub out the dev-only vite import
const stubVitePlugin: esbuild.Plugin = {
  name: "stub-vite-dev",
  setup(build) {
    // When server/index.ts does: import("./vite"), resolve it to a stub
    build.onResolve({ filter: /^\.\/vite$/ }, (args) => {
      if (args.resolveDir.includes("server")) {
        return { path: "vite-dev-stub", namespace: "stub" };
      }
    });
    build.onLoad({ filter: /.*/, namespace: "stub" }, () => {
      return {
        contents: `export async function setupVite() { throw new Error("Dev only"); }`,
        loader: "js",
      };
    });
  },
};

await esbuild.build({
  entryPoints: [path.join(root, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist/index.cjs"),
  packages: "external",
  alias: {
    "@shared": "./shared",
  },
  plugins: [stubVitePlugin],
});

console.log("Build complete!");

#!/usr/bin/env node
// Patches packages that ship empty .mjs files, causing Turbopack/webpack
// to fail static analysis. Re-exports each .mjs from its .js/.cjs sibling.
const fs = require("fs");
const path = require("path");

const patches = [
  // @clerk/react
  { mjs: "@clerk/react/dist/index.mjs",        js: "@clerk/react/dist/index.js" },
  { mjs: "@clerk/react/dist/internal.mjs",     js: "@clerk/react/dist/internal.js" },
  { mjs: "@clerk/react/dist/errors.mjs",       js: "@clerk/react/dist/errors.js" },
  { mjs: "@clerk/react/dist/legacy.mjs",       js: "@clerk/react/dist/legacy.js" },
  { mjs: "@clerk/react/dist/types.mjs",        js: "@clerk/react/dist/types.js" },
  { mjs: "@clerk/react/dist/experimental.mjs", js: "@clerk/react/dist/experimental.js" },
  // @clerk/backend
  { mjs: "@clerk/backend/dist/index.mjs",    js: "@clerk/backend/dist/index.js" },
  { mjs: "@clerk/backend/dist/internal.mjs", js: "@clerk/backend/dist/internal.js" },
  { mjs: "@clerk/backend/dist/errors.mjs",   js: "@clerk/backend/dist/errors.js" },
  { mjs: "@clerk/backend/dist/proxy.mjs",    js: "@clerk/backend/dist/proxy.js" },
  { mjs: "@clerk/backend/dist/webhooks.mjs", js: "@clerk/backend/dist/webhooks.js" },
  { mjs: "@clerk/backend/dist/jwt/index.mjs", js: "@clerk/backend/dist/jwt/index.js" },
  // @supabase/postgrest-js (only has .cjs, no .js)
  { mjs: "@supabase/postgrest-js/dist/index.mjs", cjs: "@supabase/postgrest-js/dist/index.cjs" },
  // @supabase type declaration files (.d.mts → .d.cts)
  { mjs: "@supabase/supabase-js/dist/index.d.mts",    js: "@supabase/supabase-js/dist/index.d.cts" },
  { mjs: "@supabase/supabase-js/dist/cors.d.mts",     js: "@supabase/supabase-js/dist/cors.d.cts" },
  { mjs: "@supabase/postgrest-js/dist/index.d.mts",   js: "@supabase/postgrest-js/dist/index.d.cts" },
];

let patched = 0;
for (const { mjs, js, cjs } of patches) {
  const mjsPath = path.resolve("node_modules", mjs);
  if (!fs.existsSync(mjsPath)) continue;
  const stat = fs.statSync(mjsPath);
  if (stat.size > 50) continue; // already patched or non-empty
  const src = js || cjs;
  const srcPath = path.resolve("node_modules", src);
  if (!fs.existsSync(srcPath)) continue;
  const rel = "./" + path.basename(src);
  fs.writeFileSync(mjsPath, `export * from '${rel}';\n`);
  patched++;
}
if (patched > 0) console.log(`patch-esm: patched ${patched} empty .mjs files`);

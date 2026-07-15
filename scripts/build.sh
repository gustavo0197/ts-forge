#!/bin/bash
set -euo pipefail

# Clean dist directory
rm -rf dist

# Compile TypeScript (handles experimental decorators + .d.ts emit)
tsc -p ./tsconfig.json

# Bundle into a single ESM file.
# Terser concatenation alone is NOT a bundler: it keeps each file's imports,
# which produces duplicate bindings (e.g. multiple `import r from "..."`) and
# breaks consumers like Forge's webpack.
# Keep @forge/resolver external — it is a peer dependency resolved by the app.
esbuild dist/index.js \
  --bundle \
  --platform=node \
  --format=esm \
  --external:@forge/resolver \
  --minify \
  --outfile=dist/index.min.js

# Remove intermediate JS files; keep the bundle and declaration files
find dist -type f -name '*.js' ! -name 'index.min.js' -delete

echo "✓ Build completed successfully"

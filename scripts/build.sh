#!/bin/bash

# Clean dist directory
rm -rf dist

# Compile TypeScript
tsc -p ./tsconfig.json

# Minify all JS files into a single file
terser dist/**/*.js --compress --mangle --module -o dist/index.min.js

# Remove all individual JS files, keeping only the minified version
find dist -type f -name '*.js' ! -name 'index.min.js' -delete

echo "✓ Build completed successfully"

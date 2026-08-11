#!/bin/bash
set -Eeuo pipefail

echo "Installing dependencies..."
pnpm install

echo "Building Next.js application..."
pnpm next build

echo "Build complete! Output directory: .next"

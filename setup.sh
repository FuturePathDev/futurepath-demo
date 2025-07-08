#!/bin/bash
set -e
set -x
node -v
npm -v
if [ -f package.json ]; then
  npm install
fi
npm run build

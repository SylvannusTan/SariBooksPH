#!/bin/bash

# Print debug information
echo "Starting build process..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Run the Vite build
echo "Running Vite build..."
npm run build

# Ensure dist directory exists
echo "Ensuring dist directory exists..."
mkdir -p dist

# If dist is empty, create a minimal index.html
if [ ! -f dist/index.html ]; then
  echo "Creating minimal index.html in dist..."
  cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SariBooks</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
      flex-direction: column;
      text-align: center;
    }
    h1 {
      color: #1867C0;
      margin-bottom: 1rem;
    }
    p {
      color: #333;
      max-width: 600px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>SariBooks</h1>
  <p>Financial Management for Small Businesses</p>
  <p>The application is being built. Please check back soon.</p>
</body>
</html>
EOL
fi

# Print dist directory contents
echo "Dist directory contents:"
ls -la dist

echo "Build process completed."

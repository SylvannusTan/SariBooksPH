// Simple build script to ensure dist directory is created
const fs = require("fs")
const path = require("path")

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, "dist")
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

// Create a simple index.html file if it doesn't exist
const indexPath = path.join(distDir, "index.html")
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(
    indexPath,
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SariBooks</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
  `,
  )
}

console.log("Build script completed successfully")

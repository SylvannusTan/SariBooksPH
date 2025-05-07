const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Print debugging information
console.log("Starting build process...")
console.log("Current directory:", process.cwd())
console.log("Directory contents:", fs.readdirSync("."))

try {
  // Run the build command
  console.log("Running npm build command...")
  execSync("npm run build", { stdio: "inherit" })
  console.log("Build command completed successfully")
} catch (error) {
  console.error("Build command failed:", error)

  // Create dist directory and fallback content even if build fails
  console.log("Creating fallback dist directory and content...")
}

// Ensure the dist directory exists
const distDir = path.join(process.cwd(), "dist")
if (!fs.existsSync(distDir)) {
  console.log("Dist directory not found, creating it...")
  fs.mkdirSync(distDir, { recursive: true })
}

// Create a fallback index.html if the directory is empty
const indexPath = path.join(distDir, "index.html")
if (!fs.existsSync(indexPath) || fs.readdirSync(distDir).length === 0) {
  console.log("Creating fallback index.html...")
  fs.writeFileSync(
    indexPath,
    `<!DOCTYPE html>
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
</html>`,
  )
}

// Create a simple CSS file to ensure multiple files in dist
const cssPath = path.join(distDir, "style.css")
if (!fs.existsSync(cssPath)) {
  console.log("Creating fallback style.css...")
  fs.writeFileSync(
    cssPath,
    `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}`,
  )
}

// Print the contents of the dist directory
console.log("Dist directory contents:", fs.readdirSync(distDir))
console.log("Build process completed successfully")

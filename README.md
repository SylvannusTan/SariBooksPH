# SariBooks - Standalone Vue.js Application

A simple financial management application for small businesses.

## Deployment Instructions for Vercel

### Option 1: Deploy from the Vercel Dashboard

1. Create a new GitHub repository and push this code to it.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click "Add New" → "Project".
4. Import your GitHub repository.
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: node build.js
   - Output Directory: dist
   - Root Directory: ./
6. Click "Deploy".

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`.
2. Navigate to the project directory.
3. Run: `vercel`.
4. Follow the prompts to deploy.

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

- `index.html` - Entry HTML file
- `vite.config.js` - Vite configuration
- `src/main.js` - Application entry point
- `src/App.vue` - Main Vue component
- `vercel.json` - Vercel deployment configuration
\`\`\`

```plaintext file=".gitignore"
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

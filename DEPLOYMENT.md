# Deploying To-Do App to Vercel

This guide outlines the steps to deploy the To-Do App to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional but recommended)
3. MongoDB Atlas account for database hosting
4. (Optional) Typesense Cloud account for search functionality

## Setup Steps

### 1. Configure MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster
3. Set up network access (Allow access from anywhere for simplicity)
4. Create a database user with read/write permissions
5. Get your MongoDB connection string

### 2. Optional: Set up Typesense Cloud

If you want to use the search functionality:

1. Sign up for [Typesense Cloud](https://cloud.typesense.org/)
2. Create a new cluster
3. Note your Typesense API key, host, port, and protocol

### 3. Deploy to Vercel

#### Using Vercel CLI

1. Install Vercel CLI if you haven't already:

   ```
   npm install -g vercel
   ```

2. Login to Vercel:

   ```
   vercel login
   ```

3. Configure environment variables:

   ```
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

   And if using Typesense:

   ```
   vercel env add TYPESENSE_API_KEY
   vercel env add TYPESENSE_HOST
   vercel env add TYPESENSE_PORT
   vercel env add TYPESENSE_PROTOCOL
   ```

4. Deploy:
   ```
   npm run vercel-deploy
   ```

#### Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your Git repository
5. Configure the project:
   - Framework Preset: SvelteKit
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: build
6. Add environment variables:
   - MONGODB_URI: Your MongoDB connection string
   - JWT_SECRET: A secure random string
   - TYPESENSE_API_KEY: Your Typesense API key (if using)
   - TYPESENSE_HOST: Your Typesense host (if using)
   - TYPESENSE_PORT: Your Typesense port (if using)
   - TYPESENSE_PROTOCOL: Your Typesense protocol (if using)
7. Click "Deploy"

## Notes on Vercel Deployment

### Serverless Functions

Vercel deploys your SvelteKit app as serverless functions. Some considerations:

1. **Cold Starts**: Your app might experience brief delays on initial requests after periods of inactivity.
2. **Function Size**: Keep your dependencies minimal to reduce function size and improve cold start times.
3. **Execution Time**: Functions have a maximum execution time of 10 seconds on Hobby plans.

### Socket.io in Serverless

The app uses a special configuration for Socket.io in Vercel's serverless environment:

1. Connection state recovery is enabled to handle function restarts
2. WebSockets are prioritized over HTTP long-polling
3. For production use with multiple instances, consider adding a Redis adapter for Socket.io

### Persistent Data

Since Vercel functions are ephemeral:

1. **MongoDB**: All persistent data is stored in MongoDB Atlas
2. **Typesense**: Search indexes are maintained in Typesense Cloud
3. **File Storage**: If you need file uploads, consider using a service like AWS S3

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check that your MongoDB connection string is correct
2. Ensure your MongoDB network access allows connections from Vercel
3. Verify that your Typesense configuration is correct

### Socket.io Problems

If real-time features aren't working:

1. Check browser console for WebSocket connection errors
2. Ensure the Socket.io server is properly initialized in `vercel-hooks.js`
3. Verify that environment variables are correctly set in Vercel

### Deployment Failures

If your deployment fails:

1. Check the Vercel build logs for specific errors
2. Ensure all required dependencies are listed in package.json
3. Verify your adapter configuration in svelte.config.js is correct

## Further Resources

- [Vercel Documentation](https://vercel.com/docs)
- [SvelteKit Adapter Vercel](https://kit.svelte.dev/docs/adapter-vercel)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Typesense Documentation](https://typesense.org/docs/)

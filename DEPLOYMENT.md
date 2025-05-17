# Deploying To-Do App to Render

This guide outlines the steps to deploy the To-Do App to Render.

## Prerequisites

1. A [Render account](https://render.com/signup)
2. MongoDB Atlas account for database hosting
3. (Optional) Typesense Cloud account for search functionality

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

### 3. Deploy to Render

#### Using Render Blueprint (Recommended)

1. Fork this repository to your GitHub account
2. In your Render dashboard, click on "New" and select "Blueprint"
3. Connect your GitHub account if you haven't already
4. Select the repository that contains your forked To-Do App
5. Render will automatically detect the `render.yaml` file and set up the services
6. Configure your environment variables:
   - MONGO_URI: Your MongoDB connection string
   - JWT_SECRET: A secure random string
   - TYPESENSE_API_KEY: Your Typesense API key
   - TYPESENSE_HOST: Your Typesense host (if using Typesense Cloud)
7. Click "Apply" to start the deployment

#### Manual Setup

If you prefer to set up each service manually:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. In your Render dashboard, create a new Web Service
3. Connect your repository
4. Configure the build:
   - Build Command: `./render-build.sh`
   - Start Command: `npm start`
5. Add environment variables (MONGO_URI, JWT_SECRET, etc.)
6. Create a second Web Service for the Socket.IO server:
   - Start Command: `npm run socket:start`
7. (Optional) Create a Private Service for Typesense using the provided Dockerfile.typesense

## Custom Build Script

The repository includes a custom build script (`render-build.sh`) that handles the build process for Render. This script:

1. Installs all dependencies
2. Installs global dependencies needed for the build process
3. Syncs the SvelteKit application
4. Builds the application

This approach ensures all necessary tools are available during the build process.

## Notes on Render Deployment

### Web Services

Render's Web Services are ideal for the SvelteKit app and Socket.IO server:

1. **Automatic HTTPS**: Render provides free SSL certificates
2. **Health Checks**: Render will restart services that become unresponsive
3. **Custom Domains**: You can add your own domain names to your services

### Socket.io Configuration

For the Socket.IO server on Render:

1. Make sure the Socket.IO server's URL is set correctly in environment variables
2. For production use with multiple instances, consider adding a Redis adapter for Socket.io

### Persistent Data

1. **MongoDB**: All persistent data is stored in MongoDB Atlas
2. **Typesense**: Search indexes can be maintained in Typesense Cloud or in a Render Private Service
3. **File Storage**: If you need file uploads, consider using a service like AWS S3

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check that your MongoDB connection string is correct
2. Ensure your MongoDB network access allows connections from Render's IP addresses
3. Verify that your Typesense configuration is correct

### Socket.io Problems

If real-time features aren't working:

1. Check browser console for WebSocket connection errors
2. Ensure the Socket.io server's URL environment variable (SOCKET_SERVER_URL) points to the correct Render service
3. Verify that JWT_SECRET is the same across all services for proper authentication

### Deployment Failures

If your deployment fails:

1. Check the Render build logs for specific errors
2. Ensure all required dependencies are listed in package.json
3. Verify your adapter configuration in svelte.config.js is set to adapter-node
4. Make sure the render-build.sh script has execute permissions

## Further Resources

- [Render Documentation](https://render.com/docs)
- [SvelteKit Adapter Node](https://kit.svelte.dev/docs/adapter-node)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Typesense Documentation](https://typesense.org/docs/)

# To-Do App with SvelteKit and Express

A modern to-do application with personal and group task management, semantic search, and AI-powered task suggestions.

## Features

- Personal and group to-do management
- Real-time updates via Socket.IO
- Semantic search powered by Typesense (with fallback)
- User authentication and authorization
- Group creation and member management
- AI-powered task suggestions

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env` file:

```
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://localhost:27017/todo-app
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
OPENAI_API_KEY=your_openai_api_key_for_ai_features
```

4. Start the development server with Socket.IO:

```bash
# Run both the SvelteKit app and Socket.IO server together
npm run dev:with-socket
```

Or use the convenience script to start all services including Typesense:

```bash
./start-services.sh
```

## Search Functionality

The app uses Typesense for powerful semantic search capabilities. However, the app will still work even if Typesense is not installed or available on your system.

### Using with Typesense (recommended for full features)

To use the full search capabilities, run Typesense alongside the app:

```bash
# Using Docker directly
docker run -p 8108:8108 -v ./typesense-data:/data typesense/typesense:0.25.1 --data-dir /data --api-key=xyz --enable-cors

# Or using Docker Compose (recommended)
docker-compose up -d typesense
```

### Without Typesense

If Typesense is not available, the app will automatically use a built-in fallback search implementation that performs basic text matching.

## Building for Production

```bash
# Build the application
npm run build

# Start the SvelteKit server
npm start

# Start the Socket.IO server (in a separate terminal)
npm run socket:start
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on how to deploy this application to Render.

## Technologies Used

- SvelteKit (frontend)
- Express.js (backend)
- MongoDB (database)
- Typesense (search)
- TailwindCSS (styling)
- Socket.io (real-time updates)
- OpenAI / Google AI (task suggestions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Socket Connection Errors

If you see "Socket connection error: server error" messages in the console, make sure:

1. The Socket.IO server is running on port 3001
2. You're logged in with a valid user account
3. Your database connection is working properly

## Features

- Real-time collaborative todo lists
- User authentication
- Group functionality for shared todos
- Real-time notifications when todos change

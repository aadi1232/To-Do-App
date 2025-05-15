# To-Do App with SvelteKit and Express

A modern to-do application with personal and group task management, semantic search, and AI-powered task suggestions.

## Features

- Personal and group to-do management
- Real-time updates
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
MONGODB_URI=mongodb://localhost:27017/todo-app
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
OPENAI_API_KEY=your_openai_api_key_for_ai_features
```

4. Start the development server:

```bash
npm run dev
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

# Or use the convenience script to start all services
./start-services.sh
```

### Without Typesense

If Typesense is not available, the app will automatically use a built-in fallback search implementation that performs basic text matching. You can still search your todos, but the results may not be as rich as with the semantic search.

## Building for Production

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Technologies Used

- SvelteKit (frontend)
- Express.js (backend)
- MongoDB (database)
- Typesense (search)
- TailwindCSS (styling)
- Socket.io (real-time updates)

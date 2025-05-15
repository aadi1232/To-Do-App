# To-Do App

A collaborative todo application with real-time updates using Socket.IO.

## Running the Application

This application consists of two parts:

1. The SvelteKit frontend and API
2. A standalone Socket.IO server for real-time updates

### Development

To run both servers together during development:

```bash
# Install dependencies
npm install

# Run both the SvelteKit app and Socket.IO server together
npm run dev:with-socket
```

This will start:

- SvelteKit on http://localhost:5173
- Socket.IO server on http://localhost:3001

### Running Servers Separately

You can also run the servers separately:

```bash
# Run just the SvelteKit app
npm run dev

# Run just the Socket.IO server
npm run socket:dev
```

### Production

For production:

```bash
# Build the application
npm run build

# Start the SvelteKit server
npm run preview

# Start the Socket.IO server
npm run socket:start
```

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

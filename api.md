# To-Do App API Documentation

This document provides a comprehensive overview of all API endpoints available in the To-Do App backend.

## Table of Contents

1. [Authentication](#authentication)
   - [Register](#register)
   - [Login](#login)
   - [Logout](#logout)
   - [Get Current User](#get-current-user)
2. [Todo Tasks](#todo-tasks)
   - [Create Todo](#create-todo)
   - [Get All Todos](#get-all-todos)
   - [Get Todo by ID](#get-todo-by-id)
   - [Update Todo](#update-todo)
   - [Delete Todo](#delete-todo)
   - [Mark Todo as Complete](#mark-todo-as-complete)
3. [Groups](#groups)
   - [Create Group](#create-group)
   - [Get User Groups](#get-user-groups)
   - [Add User to Group](#add-user-to-group)

## Authentication

### Register

Creates a new user account and returns authentication token.

- **URL**: `/api/users/register`
- **Method**: `POST`
- **Auth Required**: No

#### Request Body

```json
{
	"username": "johndoe",
	"email": "john@example.com",
	"password": "password123"
}
```

#### Success Response

- **Code**: 201 Created
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"username": "johndoe",
	"email": "john@example.com",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response

- **Code**: 400 Bad Request
- **Content**:

```json
{
	"message": "User already exists"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:

```json
{
	"message": "Server error"
}
```

#### Notes

- The JWT token is also set as an HTTP-only cookie with name `jwt`
- Token expires in 30 days

### Login

Authenticates a user and returns authentication token.

- **URL**: `/api/users/login`
- **Method**: `POST`
- **Auth Required**: No

#### Request Body

```json
{
	"username": "johndoe",
	"password": "password123"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"username": "johndoe",
	"email": "john@example.com",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
	"message": "Invalid username or password"
}
```

#### Notes

- The JWT token is also set as an HTTP-only cookie with name `jwt`
- Token expires in 30 days

### Logout

Logs out the current user by clearing the authentication cookie.

- **URL**: `/api/users/logout`
- **Method**: `POST`
- **Auth Required**: No (but typically used when authenticated)

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Logged out successfully"
}
```

#### Notes

- Clears the `jwt` cookie by setting it to an empty string with immediate expiration

### Get Current User

Returns the profile information for the currently authenticated user.

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

#### Headers

```
Authorization: Bearer [jwt_token]
```

OR

Cookie: `jwt=[token]`

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"username": "johndoe",
	"email": "john@example.com"
}
```

#### Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
	"message": "Not authorized, no token"
}
```

OR

```json
{
	"message": "Not authorized, token failed"
}
```

OR

```json
{
	"message": "Token expired"
}
```

## Todo Tasks

### Create Todo

Creates a new todo task for the authenticated user.

- **URL**: `/api/todos`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"title": "Complete project documentation",
	"description": "Write comprehensive API docs for the Todo app",
	"dueDate": "2023-06-30T23:59:59.999Z",
	"priority": "high",
	"groupId": "60d21b4667d0d8992e610c85", // Optional, if part of a group
	"tags": ["documentation", "urgent"] // Optional
}
```

#### Success Response

- **Code**: 201 Created
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"title": "Complete project documentation",
	"description": "Write comprehensive API docs for the Todo app",
	"dueDate": "2023-06-30T23:59:59.999Z",
	"completed": false,
	"priority": "high",
	"user": "60d21b4667d0d8992e610c85", // User ID of creator
	"group": "60d21b4667d0d8992e610c85", // Group ID if applicable
	"tags": ["documentation", "urgent"],
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-01T12:00:00.000Z"
}
```

### Get All Todos

Returns all todo tasks for the authenticated user.

- **URL**: `/api/todos`
- **Method**: `GET`
- **Auth Required**: Yes

#### Query Parameters

- `completed`: Filter by completion status (true/false)
- `priority`: Filter by priority (high/medium/low)
- `tags`: Filter by tags (comma-separated)
- `groupId`: Filter by group ID
- `sort`: Sort field (createdAt, dueDate, priority)
- `order`: Sort order (asc, desc)
- `limit`: Number of results to return (default: 20)
- `page`: Page number for pagination (default: 1)

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"todos": [
		{
			"_id": "60d21b4667d0d8992e610c85",
			"title": "Complete project documentation",
			"description": "Write comprehensive API docs for the Todo app",
			"dueDate": "2023-06-30T23:59:59.999Z",
			"completed": false,
			"priority": "high",
			"user": "60d21b4667d0d8992e610c85",
			"group": "60d21b4667d0d8992e610c85",
			"tags": ["documentation", "urgent"],
			"createdAt": "2023-06-01T12:00:00.000Z",
			"updatedAt": "2023-06-01T12:00:00.000Z"
		}
		// ... more todos
	],
	"pagination": {
		"total": 42,
		"page": 1,
		"pages": 3,
		"limit": 20
	}
}
```

### Get Todo by ID

Returns a specific todo task by ID.

- **URL**: `/api/todos/:id`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"title": "Complete project documentation",
	"description": "Write comprehensive API docs for the Todo app",
	"dueDate": "2023-06-30T23:59:59.999Z",
	"completed": false,
	"priority": "high",
	"user": "60d21b4667d0d8992e610c85",
	"group": "60d21b4667d0d8992e610c85",
	"tags": ["documentation", "urgent"],
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-01T12:00:00.000Z"
}
```

#### Error Response

- **Code**: 404 Not Found
- **Content**:

```json
{
	"message": "Todo not found"
}
```

### Update Todo

Updates a specific todo task by ID.

- **URL**: `/api/todos/:id`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Request Body

```json
{
	"title": "Updated task title",
	"description": "Updated task description",
	"dueDate": "2023-07-15T23:59:59.999Z",
	"priority": "medium",
	"tags": ["documentation", "in-progress"]
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"title": "Updated task title",
	"description": "Updated task description",
	"dueDate": "2023-07-15T23:59:59.999Z",
	"completed": false,
	"priority": "medium",
	"user": "60d21b4667d0d8992e610c85",
	"group": "60d21b4667d0d8992e610c85",
	"tags": ["documentation", "in-progress"],
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-05T15:30:00.000Z"
}
```

### Delete Todo

Deletes a specific todo task by ID.

- **URL**: `/api/todos/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Todo removed"
}
```

### Mark Todo as Complete

Marks a specific todo task as complete.

- **URL**: `/api/todos/:id/complete`
- **Method**: `PATCH`
- **Auth Required**: Yes

#### Request Body

```json
{
	"completed": true
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"title": "Complete project documentation",
	"completed": true,
	"updatedAt": "2023-06-05T15:30:00.000Z"
	// Other todo properties...
}
```

## Groups

### Create Group

Creates a new group for collaborative todos.

- **URL**: `/api/groups`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"name": "Project Team Alpha",
	"description": "Group for managing Project Alpha tasks"
}
```

#### Success Response

- **Code**: 201 Created
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"name": "Project Team Alpha",
	"description": "Group for managing Project Alpha tasks",
	"owner": "60d21b4667d0d8992e610c85", // User ID of the creator
	"members": ["60d21b4667d0d8992e610c85"], // Initial members (includes creator)
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-01T12:00:00.000Z"
}
```

### Get User Groups

Returns all groups the authenticated user is a member of.

- **URL**: `/api/groups`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"groups": [
		{
			"_id": "60d21b4667d0d8992e610c85",
			"name": "Project Team Alpha",
			"description": "Group for managing Project Alpha tasks",
			"owner": "60d21b4667d0d8992e610c85",
			"members": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
			"createdAt": "2023-06-01T12:00:00.000Z",
			"updatedAt": "2023-06-01T12:00:00.000Z"
		}
		// ... more groups
	]
}
```

### Add User to Group

Adds a user to an existing group.

- **URL**: `/api/groups/:id/members`
- **Method**: `POST`
- **Auth Required**: Yes (must be group owner)

#### Request Body

```json
{
	"userId": "60d21b4667d0d8992e610c86"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "User added to group",
	"group": {
		"_id": "60d21b4667d0d8992e610c85",
		"name": "Project Team Alpha",
		"members": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
		// Other group properties...
	}
}
```

## Database Unavailable Response

For all API endpoints that require database access, when the database is unavailable:

- **Code**: 503 Service Unavailable
- **Content**:

```json
{
	"message": "Database unavailable",
	"error": "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017"
}
```

## Authentication Flow

1. **Registration**: Client sends username, email, and password to `/api/users/register`
2. **Login**: Client sends username and password to `/api/users/login`
3. **Authenticated Requests**: Client includes JWT token in subsequent requests, either:
   - In the `Authorization` header as `Bearer [token]`
   - Or relies on the HTTP-only cookie that was set during login/registration
4. **Logout**: Client calls `/api/users/logout` to invalidate the session

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
	"message": "Description of the error",
	"stack": "Error stack trace (only in development environment)"
}
```

## Notes on API Structure

- The API uses Express.js as the backend framework
- Authentication is handled via JWT tokens stored in HTTP-only cookies
- MongoDB is used as the database
- The API implements graceful degradation when the database is unavailable
- All timestamps are in ISO 8601 format

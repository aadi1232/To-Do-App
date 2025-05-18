# To-Do App API Documentation

This document provides a comprehensive overview of all API endpoints available in the To-Do App backend.

## Table of Contents

1. [Authentication](#authentication)
   - [Register](#register)
   - [Login](#login)
   - [Logout](#logout)
   - [Get Current User](#get-current-user)
   - [Update Profile Image](#update-profile-image)
2. [Todo Tasks](#todo-tasks)
   - [Create Todo](#create-todo)
   - [Get All Todos](#get-all-todos)
   - [Get Todo by ID](#get-todo-by-id)
   - [Update Todo](#update-todo)
   - [Delete Todo](#delete-todo)
   - [Mark Todo as Complete](#mark-todo-as-complete)
3. [Group Todos](#group-todos)
   - [Create Group Todo](#create-group-todo)
   - [Get Group Todos](#get-group-todos)
   - [Update Group Todo](#update-group-todo)
   - [Delete Group Todo](#delete-group-todo)
4. [Groups](#groups)
   - [Create Group](#create-group)
   - [Get User Groups](#get-user-groups)
   - [Get Group by ID](#get-group-by-id)
   - [Update Group](#update-group)
   - [Delete Group](#delete-group)
   - [Get Shared Group](#get-shared-group)
5. [Group Membership](#group-membership)
   - [Invite to Group](#invite-to-group)
   - [Get Pending Invitations](#get-pending-invitations)
   - [Respond to Invitation](#respond-to-invitation)
   - [Update Member Role](#update-member-role)
   - [Remove Member](#remove-member)
6. [Search](#search)
   - [Search Todos](#search-todos)
   - [Sync Todos Index](#sync-todos-index)
   - [Search Group Todos](#search-group-todos)
   - [Sync Group Todos Index](#sync-group-todos-index)
7. [Notifications](#notifications)
   - [Get User Notifications](#get-user-notifications)
   - [Mark Notification as Read](#mark-notification-as-read)
   - [Mark All Notifications as Read](#mark-all-notifications-as-read)
   - [Notify Group Members](#notify-group-members)
8. [AI Features](#ai-features)
   - [Get Todo Suggestions](#get-todo-suggestions)

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

### Update Profile Image

Updates the user's profile image.

- **URL**: `/api/users/profile/image`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Request Body

```json
{
	"profileImage": "https://example.com/images/profile.jpg"
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
	"profileImage": "https://example.com/images/profile.jpg"
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
	"tags": ["documentation", "urgent"]
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

- **URL**: `/api/todos/:todoId`
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

- **URL**: `/api/todos/:todoId`
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
	"tags": ["documentation", "in-progress"],
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-05T15:30:00.000Z"
}
```

### Delete Todo

Deletes a specific todo task by ID.

- **URL**: `/api/todos/:todoId`
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

- **URL**: `/api/todos/:todoId/complete`
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

## Group Todos

### Create Group Todo

Creates a new todo task within a group.

- **URL**: `/api/todos/by-group/:groupId`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"title": "Team meeting notes",
	"description": "Prepare notes for the weekly team meeting",
	"dueDate": "2023-06-30T14:00:00.000Z",
	"priority": "medium",
	"tags": ["meeting", "team"]
}
```

#### Success Response

- **Code**: 201 Created
- **Content**:

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"title": "Team meeting notes",
	"description": "Prepare notes for the weekly team meeting",
	"dueDate": "2023-06-30T14:00:00.000Z",
	"completed": false,
	"priority": "medium",
	"user": "60d21b4667d0d8992e610c85", // User ID of creator
	"group": "60d21b4667d0d8992e610c90", // Group ID
	"tags": ["meeting", "team"],
	"createdAt": "2023-06-01T12:00:00.000Z",
	"updatedAt": "2023-06-01T12:00:00.000Z"
}
```

### Get Group Todos

Returns all todo tasks for a specific group.

- **URL**: `/api/todos/by-group/:groupId`
- **Method**: `GET`
- **Auth Required**: Yes

#### Query Parameters

- Same as in Get All Todos

#### Success Response

- **Code**: 200 OK
- **Content**: Same structure as Get All Todos

### Update Group Todo

Updates a specific group todo task by ID.

- **URL**: `/api/todos/by-id/:todoId`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Request Body

```json
{
	"title": "Updated team meeting notes",
	"description": "Updated description",
	"dueDate": "2023-07-15T14:00:00.000Z",
	"priority": "high",
	"tags": ["meeting", "important"]
}
```

#### Success Response

- **Code**: 200 OK
- **Content**: Updated todo object

### Delete Group Todo

Deletes a specific group todo task by ID.

- **URL**: `/api/todos/by-id/:todoId`
- **Method**: `DELETE`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Group todo removed"
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

### Get Group by ID

Returns a specific group by ID.

- **URL**: `/api/groups/:id`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**: Group object

### Update Group

Updates a specific group by ID.

- **URL**: `/api/groups/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (must be group owner)

#### Request Body

```json
{
	"name": "Updated Team Name",
	"description": "Updated group description"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**: Updated group object

### Delete Group

Deletes a specific group by ID.

- **URL**: `/api/groups/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (must be group owner)

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Group deleted successfully"
}
```

### Get Shared Group

Returns a group by ID for public sharing (no authentication required).

- **URL**: `/api/groups/shared/:id`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response

- **Code**: 200 OK
- **Content**: Group object with limited information for sharing

## Group Membership

### Invite to Group

Invites a user to join a group.

- **URL**: `/api/groups/:id/invite`
- **Method**: `POST`
- **Auth Required**: Yes (must be group owner or admin)

#### Request Body

```json
{
	"email": "user@example.com",
	"role": "member" // Optional, defaults to "member"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Invitation sent successfully"
}
```

### Get Pending Invitations

Returns all pending group invitations for the current user.

- **URL**: `/api/groups/invitations`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**: List of pending invitations

### Respond to Invitation

Accepts or rejects a group invitation.

- **URL**: `/api/groups/invitation/:id/respond`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"accept": true // or false to reject
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Invitation accepted successfully"
}
```

### Update Member Role

Updates a group member's role.

- **URL**: `/api/groups/:id/member/:memberId/role`
- **Method**: `PUT`
- **Auth Required**: Yes (must be group owner)

#### Request Body

```json
{
	"role": "admin" // or "member"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**: Updated group object

### Remove Member

Removes a member from a group.

- **URL**: `/api/groups/:id/member/:memberId`
- **Method**: `DELETE`
- **Auth Required**: Yes (must be group owner or the member themself)

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Member removed successfully"
}
```

## Search

### Search Todos

Searches for todos using text search.

- **URL**: `/api/search/todos`
- **Method**: `GET`
- **Auth Required**: Yes

#### Query Parameters

- `q`: Search query
- `limit`: Number of results (optional)
- `offset`: Pagination offset (optional)

#### Success Response

- **Code**: 200 OK
- **Content**: List of matching todos

### Sync Todos Index

Synchronizes the search index with current todos.

- **URL**: `/api/search/todos/sync`
- **Method**: `POST`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Todos index synchronized successfully"
}
```

### Search Group Todos

Searches for todos within a group.

- **URL**: `/api/search/todos/group`
- **Method**: `GET`
- **Auth Required**: Yes

#### Query Parameters

- `q`: Search query
- `groupId`: Group ID
- `limit`: Number of results (optional)
- `offset`: Pagination offset (optional)

#### Success Response

- **Code**: 200 OK
- **Content**: List of matching group todos

### Sync Group Todos Index

Synchronizes the search index with current group todos.

- **URL**: `/api/search/todos/group/sync`
- **Method**: `POST`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Group todos index synchronized successfully"
}
```

## Notifications

### Get User Notifications

Returns all notifications for the current user.

- **URL**: `/api/notifications`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**: List of user notifications

### Mark Notification as Read

Marks a specific notification as read.

- **URL**: `/api/notifications/:notificationId/read`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**: Updated notification object

### Mark All Notifications as Read

Marks all notifications for the current user as read.

- **URL**: `/api/notifications/read-all`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "All notifications marked as read"
}
```

### Notify Group Members

Sends a notification to all members of a group.

- **URL**: `/api/notifications/group`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"groupId": "60d21b4667d0d8992e610c85",
	"title": "New task assigned",
	"message": "You have been assigned a new task",
	"link": "/groups/60d21b4667d0d8992e610c85"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"message": "Notification sent to group members"
}
```

## AI Features

### Get Todo Suggestions

Gets AI-generated suggestions for todo tasks.

- **URL**: `/api/ai/suggest`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Body

```json
{
	"prompt": "Project planning",
	"count": 5 // Optional, number of suggestions to generate
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
	"suggestions": [
		"Create project timeline",
		"Define project requirements",
		"Set up project management tools",
		"Schedule kickoff meeting",
		"Identify key stakeholders"
	]
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
- Real-time features are implemented using Socket.IO

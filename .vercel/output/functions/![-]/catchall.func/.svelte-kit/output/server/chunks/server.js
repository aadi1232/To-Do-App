import express from "express";
import cookieParser from "cookie-parser";
import { Readable } from "stream";
import { c as connectDB, d as dbState } from "./db.js";
import jwt from "jsonwebtoken";
import { J as JWT_SECRET, G as GEMINI_API_KEY } from "./env.js";
import { U as User } from "./user.model.js";
import mongoose from "mongoose";
import Typesense from "typesense";
import dotenv from "dotenv";
import axios from "axios";
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d"
  });
};
const registerUserService = async (userData) => {
  const { username, email, password } = userData;
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    if (userExists.email === email) {
      throw new Error("Email already exists");
    }
    if (userExists.username === username) {
      throw new Error("Username already exists");
    }
  }
  const user = await User.create({
    username,
    email,
    password
  });
  if (!user) {
    throw new Error("Invalid user data");
  }
  const token = generateToken(user._id);
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    token
  };
};
const loginUserService = async (credentials) => {
  const { username, password } = credentials;
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }
  const token = generateToken(user._id);
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    token
  };
};
const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage
  };
};
const updateProfileImageService = async (userId, profileImage) => {
  if (!profileImage || typeof profileImage !== "string") {
    throw new Error("Invalid profile image URL");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.profileImage = profileImage;
  await user.save();
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage
  };
};
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userData = (
      /** @type {UserData} */
      await registerUserService({ username, email, password })
    );
    res.cookie("jwt", userData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    res.status(201).json(userData);
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes("exists") ? 400 : 500;
    res.status(statusCode).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = (
      /** @type {UserData} */
      await loginUserService({ username, password })
    );
    res.cookie("jwt", userData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    res.json(userData);
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "Invalid username or password" });
  }
};
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const userData = await getUserProfileService(req.user._id);
    res.json(userData);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "User not found" });
  }
};
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: /* @__PURE__ */ new Date(0),
    path: "/"
  });
  res.status(200).json({ message: "Logged out successfully" });
};
const updateProfileImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { profileImage } = req.body;
    if (!profileImage) {
      return res.status(400).json({ message: "Profile image URL is required" });
    }
    const updatedUser = await updateProfileImageService(req.user._id, profileImage);
    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error updating profile image" });
  }
};
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = typeof decoded === "object" && decoded !== null ? decoded.id : null;
    if (!userId) {
      throw new Error("Invalid token format");
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    let message = "Not authorized, token failed";
    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
    } else if (error.message === "User not found") {
      message = "User account no longer exists";
    }
    res.status(401).json({ message });
  }
};
const authenticateUser = protect;
const router$5 = express.Router();
router$5.post("/register", registerUser);
router$5.post("/login", loginUser);
router$5.get("/me", protect, getMe);
router$5.post("/logout", logoutUser);
router$5.put("/profile/image", protect, updateProfileImage);
const todoSchema$1 = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    textColor: { type: String, default: "#000000" },
    isHighlighted: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Todo = mongoose.model("Todo", todoSchema$1);
const todo_model = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Todo
}, Symbol.toStringTag, { value: "Module" }));
const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "co-lead", "elder", "member"],
      default: "member"
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending"
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    members: [memberSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);
groupSchema.pre("save", function(next) {
  if (this.isNew && !this.imageUrl) {
    const nameParts = this.name.split(/\s+/);
    let initials = "";
    if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0).toUpperCase();
    } else {
      initials = nameParts.reduce((acc, part) => acc + part.charAt(0).toUpperCase(), "");
    }
    this.imageUrl = initials.slice(0, 2);
  }
  next();
});
const Group = mongoose.model("Group", groupSchema);
const group_model = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Group
}, Symbol.toStringTag, { value: "Module" }));
dotenv.config();
let typesenseAvailable = false;
const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost",
      port: parseInt(process.env.TYPESENSE_PORT || "8108"),
      protocol: process.env.TYPESENSE_PROTOCOL || "http"
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "xyz",
  connectionTimeoutSeconds: 2
});
const todoSchema = {
  name: "todos",
  fields: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "completed", type: "bool" },
    { name: "userId", type: "string" },
    { name: "created_at", type: "int64" }
  ],
  default_sorting_field: "created_at"
};
const groupTodoSchema = {
  name: "group_todos",
  fields: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "completed", type: "bool" },
    { name: "groupId", type: "string" },
    { name: "createdBy", type: "string" },
    // We'll store the user ID
    { name: "created_at", type: "int64" }
  ],
  default_sorting_field: "created_at"
};
async function initTypesense() {
  try {
    const collections = await typesenseClient.collections().retrieve();
    const todoCollection = collections.find((collection) => collection.name === "todos");
    if (!todoCollection) {
      await typesenseClient.collections().create(todoSchema);
      console.log("Typesense todo collection created successfully");
    }
    const groupTodoCollection = collections.find((collection) => collection.name === "group_todos");
    if (!groupTodoCollection) {
      await typesenseClient.collections().create(groupTodoSchema);
      console.log("Typesense group todo collection created successfully");
    }
    typesenseAvailable = true;
    return true;
  } catch (error) {
    console.error("Typesense initialization error:", error);
    typesenseAvailable = false;
    return false;
  }
}
async function indexTodo(todo) {
  if (!typesenseAvailable) return false;
  try {
    const document = {
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      userId: todo.user.toString(),
      created_at: Math.floor(new Date(todo.createdAt).getTime() / 1e3)
    };
    await typesenseClient.collections("todos").documents().upsert(document);
    return true;
  } catch (error) {
    console.error("Error indexing todo:", error);
    return false;
  }
}
async function searchTodos$1(userId, query) {
  try {
    console.log(`Typesense search service: Searching for "${query}" for user ID: ${userId}`);
    if (!query || query.trim() === "") {
      console.error("Typesense search service: Empty query received");
      return { hits: [] };
    }
    if (!typesenseAvailable) {
      console.log("Typesense not available, using fallback search");
      return fallbackSearchTodos(userId, query.trim());
    }
    const searchParameters = {
      q: query.trim(),
      query_by: "title",
      filter_by: `userId:${userId}`,
      sort_by: "created_at:desc",
      per_page: 100,
      highlight_full_fields: "title"
      // Enable full-field highlighting for better results
    };
    console.log("Typesense search parameters:", JSON.stringify(searchParameters));
    const searchResults = await typesenseClient.collections("todos").documents().search(searchParameters);
    console.log(`Typesense found ${searchResults.hits?.length || 0} matching todos`);
    return searchResults;
  } catch (error) {
    console.error("Error searching todos in Typesense:", error);
    console.log("Using fallback search due to error");
    return fallbackSearchTodos(userId, query.trim());
  }
}
async function searchGroupTodos$1(groupId, query) {
  try {
    console.log(`Typesense search service: Searching for "${query}" for group ID: ${groupId}`);
    if (!query || query.trim() === "") {
      console.error("Typesense search service: Empty query received");
      return { hits: [] };
    }
    if (!typesenseAvailable) {
      console.log("Typesense not available, using fallback search for group todos");
      return fallbackSearchGroupTodos(groupId, query.trim());
    }
    const searchParameters = {
      q: query.trim(),
      query_by: "title",
      filter_by: `groupId:${groupId}`,
      sort_by: "created_at:desc",
      per_page: 100,
      highlight_full_fields: "title"
      // Enable full-field highlighting for better results
    };
    console.log("Typesense group search parameters:", JSON.stringify(searchParameters));
    const searchResults = await typesenseClient.collections("group_todos").documents().search(searchParameters);
    console.log(`Typesense found ${searchResults.hits?.length || 0} matching group todos`);
    return searchResults;
  } catch (error) {
    console.error("Error searching group todos in Typesense:", error);
    console.log("Using fallback search for group todos due to error");
    return fallbackSearchGroupTodos(groupId, query.trim());
  }
}
async function deleteTodoFromIndex(todoId) {
  if (!typesenseAvailable) return false;
  try {
    await typesenseClient.collections("todos").documents(todoId).delete();
    return true;
  } catch (error) {
    console.error("Error deleting todo from index:", error);
    return false;
  }
}
async function syncTodosToTypesense(todos) {
  if (!typesenseAvailable) {
    console.log("Typesense not available, skipping sync");
    return false;
  }
  try {
    const documents = todos.map((todo) => ({
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      userId: todo.user.toString(),
      created_at: Math.floor(new Date(todo.createdAt).getTime() / 1e3)
    }));
    if (documents.length > 0) {
      await typesenseClient.collections("todos").documents().import(documents, { action: "upsert" });
    }
    return true;
  } catch (error) {
    console.error("Error syncing todos to Typesense:", error);
    return false;
  }
}
async function syncGroupTodosToTypesense(todos) {
  if (!typesenseAvailable) {
    console.log("Typesense not available, skipping group todos sync");
    return false;
  }
  try {
    const documents = todos.map((todo) => ({
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      groupId: todo.group.toString(),
      createdBy: todo.createdBy.toString(),
      created_at: Math.floor(new Date(todo.createdAt).getTime() / 1e3)
    }));
    if (documents.length > 0) {
      await typesenseClient.collections("group_todos").documents().import(documents, { action: "upsert" });
    }
    return true;
  } catch (error) {
    console.error("Error syncing group todos to Typesense:", error);
    return false;
  }
}
async function fallbackSearchTodos(userId, query) {
  try {
    const todoService = await Promise.resolve().then(() => todo_service);
    const todos = await todoService.getTodosByUser(userId);
    const lowerQuery = query.toLowerCase();
    const matchingTodos = todos.filter(
      (todo) => todo.title.toLowerCase().includes(lowerQuery)
    );
    console.log(`Fallback search found ${matchingTodos.length} matching todos`);
    const hits = matchingTodos.map((todo) => {
      const titleLower = todo.title.toLowerCase();
      const start = titleLower.indexOf(lowerQuery);
      let highlightedTitle = todo.title;
      if (start !== -1) {
        const end = start + lowerQuery.length;
        highlightedTitle = todo.title.substring(0, start) + "<mark>" + todo.title.substring(start, end) + "</mark>" + todo.title.substring(end);
      }
      return {
        document: {
          id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed,
          userId: todo.user.toString()
        },
        highlights: [
          {
            field: "title",
            snippet: highlightedTitle
          }
        ]
      };
    });
    return {
      hits,
      found: hits.length,
      fallback: true
      // indicate this is from fallback search
    };
  } catch (error) {
    console.error("Error in fallback todo search:", error);
    return { hits: [], found: 0, fallback: true };
  }
}
async function fallbackSearchGroupTodos(groupId, query) {
  try {
    const groupTodoService = await Promise.resolve().then(() => groupTodo_service);
    const todos = await groupTodoService.getTodosByGroup(groupId);
    const lowerQuery = query.toLowerCase();
    const matchingTodos = todos.filter(
      (todo) => todo.title.toLowerCase().includes(lowerQuery)
    );
    console.log(`Fallback search found ${matchingTodos.length} matching group todos`);
    const hits = matchingTodos.map((todo) => {
      const titleLower = todo.title.toLowerCase();
      const start = titleLower.indexOf(lowerQuery);
      let highlightedTitle = todo.title;
      if (start !== -1) {
        const end = start + lowerQuery.length;
        highlightedTitle = todo.title.substring(0, start) + "<mark>" + todo.title.substring(start, end) + "</mark>" + todo.title.substring(end);
      }
      return {
        document: {
          id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed,
          groupId: todo.group.toString(),
          createdBy: todo.createdBy
        },
        highlights: [
          {
            field: "title",
            snippet: highlightedTitle
          }
        ]
      };
    });
    return {
      hits,
      found: hits.length,
      fallback: true
      // indicate this is from fallback search
    };
  } catch (error) {
    console.error("Error in fallback group todo search:", error);
    return { hits: [], found: 0, fallback: true };
  }
}
async function createTodo$2(userId, data) {
  const todoData = {
    ...data,
    user: userId,
    createdBy: userId
  };
  const todo = await Todo.create(todoData);
  try {
    await indexTodo(todo);
  } catch (error) {
    console.error("Failed to index todo in Typesense:", error);
  }
  return todo;
}
async function getTodosByUser(userId) {
  return await Todo.find({ user: userId, group: null }).sort({ createdAt: -1 });
}
async function getTodoById$1(userId, todoId) {
  const todo = await Todo.findOne({
    _id: todoId,
    user: userId,
    group: null
  });
  return todo;
}
async function updateTodo$2(userId, todoId, data) {
  const todo = await Todo.findOne({ _id: todoId, user: userId });
  if (!todo) {
    throw new Error("Todo not found");
  }
  Object.assign(todo, data);
  const updatedTodo = await todo.save();
  try {
    await indexTodo(updatedTodo);
  } catch (error) {
    console.error("Failed to update todo in Typesense:", error);
  }
  return updatedTodo;
}
async function deleteTodo$2(userId, todoId) {
  const todo = await Todo.findOne({ _id: todoId, user: userId });
  if (!todo) {
    throw new Error("Todo not found");
  }
  await Todo.deleteOne({ _id: todoId });
  try {
    await deleteTodoFromIndex(todoId);
  } catch (error) {
    console.error("Failed to delete todo from Typesense:", error);
  }
  return { message: "Todo deleted successfully" };
}
async function createGroupTodo$1(userId, groupId, data) {
  const group = await Group.findOne({
    _id: groupId,
    "members.user": userId,
    "members.invitationStatus": "accepted"
  });
  if (!group) {
    throw new Error("Group not found or you are not a member");
  }
  const userMember = group.members.find((member) => member.user.toString() === userId.toString());
  if (!userMember) {
    throw new Error("You are not a member of this group");
  }
  if (userMember.role === "member") {
    throw new Error("You do not have permission to create todos in this group");
  }
  const todoData = {
    ...data,
    user: userId,
    group: groupId,
    createdBy: userId
  };
  return await Todo.create(todoData);
}
async function getGroupTodos$1(userId, groupId) {
  const group = await Group.findOne({
    _id: groupId,
    "members.user": userId,
    "members.invitationStatus": "accepted"
  });
  if (!group) {
    throw new Error("Group not found or you are not a member");
  }
  return await Todo.find({ group: groupId }).sort({ createdAt: -1 }).populate("createdBy", "username email profileImage");
}
async function updateGroupTodo$1(userId, todoId, data) {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw new Error("Todo not found");
  }
  if (!todo.group) {
    throw new Error("This is not a group todo");
  }
  const group = await Group.findOne({
    _id: todo.group,
    "members.user": userId,
    "members.invitationStatus": "accepted"
  });
  if (!group) {
    throw new Error("Group not found or you are not a member");
  }
  const userMember = group.members.find((member) => member.user.toString() === userId.toString());
  if (userMember.role === "member") {
    throw new Error("You do not have permission to update todos in this group");
  }
  Object.assign(todo, data);
  return await todo.save();
}
async function deleteGroupTodo$1(userId, todoId) {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw new Error("Todo not found");
  }
  if (!todo.group) {
    throw new Error("This is not a group todo");
  }
  const group = await Group.findOne({
    _id: todo.group,
    "members.user": userId,
    "members.invitationStatus": "accepted"
  });
  if (!group) {
    throw new Error("Group not found or you are not a member");
  }
  const userMember = group.members.find((member) => member.user.toString() === userId.toString());
  if (userMember && userMember.role === "member") {
    throw new Error("You do not have permission to delete todos in this group");
  }
  await Todo.deleteOne({ _id: todoId });
  return { message: "Todo deleted successfully" };
}
const todo_service = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createGroupTodo: createGroupTodo$1,
  createTodo: createTodo$2,
  deleteGroupTodo: deleteGroupTodo$1,
  deleteTodo: deleteTodo$2,
  getGroupTodos: getGroupTodos$1,
  getTodoById: getTodoById$1,
  getTodosByUser,
  updateGroupTodo: updateGroupTodo$1,
  updateTodo: updateTodo$2
}, Symbol.toStringTag, { value: "Module" }));
function getIO() {
  if (typeof global === "undefined" || !global.io) {
    console.warn("Socket.IO not initialized yet");
    return null;
  }
  return global.io;
}
function notifyUser(userId, event, data) {
  try {
    const io = getIO();
    if (!io) return false;
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`Emitted ${event} to user:${userId}`, data);
    return true;
  } catch (error) {
    console.error(`Error emitting ${event} to user:${userId}:`, error);
    return false;
  }
}
function notifyGroup(groupId, event, data, excludeUserId) {
  try {
    const io = getIO();
    if (!io) return false;
    const room = io.to(`group:${groupId}`);
    if (excludeUserId) {
      room.except(`user:${excludeUserId}`);
    }
    room.emit(event, {
      ...data,
      groupId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`Emitted ${event} to group:${groupId}`, data);
    return true;
  } catch (error) {
    console.error(`Error emitting ${event} to group:${groupId}:`, error);
    return false;
  }
}
function notifyGroupInvitation(userId, groupData, invitedBy) {
  const groupName = groupData && typeof groupData === "object" && groupData.name ? groupData.name : "a group";
  return notifyUser(userId, "group:invited", {
    group: groupData,
    invitedBy,
    message: `${invitedBy} invited you to join ${groupName}`
  });
}
function notifyGroupJoined(groupId, userData, userId) {
  const username = userData && typeof userData === "object" && userData.username ? userData.username : "A user";
  return notifyGroup(
    groupId,
    "group:joined",
    {
      user: userData,
      message: `${username} joined the group`
    },
    userId
  );
}
function notifyTodoChange(groupId, eventType, todoData, userId, username, groupName = "") {
  let message;
  const groupDisplay = groupName || "the group";
  const todoTitle = todoData && typeof todoData === "object" && todoData.title ? todoData.title : "a todo";
  switch (eventType) {
    case "added":
      message = `${username} added a new todo in ${groupDisplay}: ${todoTitle}`;
      break;
    case "updated":
      message = `${username} updated a todo in ${groupDisplay}: ${todoTitle}`;
      break;
    case "deleted":
      message = `${username} deleted a todo in ${groupDisplay}: ${todoTitle}`;
      break;
    case "completed":
      message = `${username} completed a todo in ${groupDisplay}: ${todoTitle}`;
      break;
    default:
      message = `${username} modified a todo in ${groupDisplay}`;
  }
  const io = getIO();
  if (!io) return false;
  try {
    const room = io.to(`group:${groupId}`);
    if (userId) {
      room.except(`user:${userId}`);
    }
    room.emit(`todo:${eventType}`, {
      todo: todoData,
      title: todoTitle,
      message,
      userName: username,
      groupId,
      // Explicitly include groupId
      groupName: groupDisplay,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      performedBy: {
        userId,
        username
      }
    });
    console.log(`Emitted priority ${eventType} to group:${groupId}`, { title: todoTitle });
    return true;
  } catch (error) {
    console.error(`Error emitting ${eventType} to group:${groupId}:`, error);
    return notifyGroup(
      groupId,
      `todo:${eventType}`,
      {
        todo: todoData,
        title: todoTitle,
        message,
        userName: username,
        groupName: groupDisplay,
        performedBy: {
          userId,
          username
        }
      },
      userId
    );
  }
}
async function createTodo$1(req, res) {
  try {
    const todo = await createTodo$2(req.user._id, req.body);
    if (todo.group) {
      notifyTodoChange(
        todo.group.toString(),
        "added",
        {
          _id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed
        },
        req.user._id.toString(),
        req.user.username
      );
    }
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function getTodos(req, res) {
  try {
    const todos = await getTodosByUser(req.user._id);
    res.json(todos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function getTodoById(req, res) {
  try {
    const { todoId } = req.params;
    const todo = await getTodoById$1(req.user._id, todoId);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function updateTodo$1(req, res) {
  try {
    const { todoId } = req.params;
    const todo = await updateTodo$2(req.user._id, todoId, req.body);
    if (todo.group) {
      notifyTodoChange(
        todo.group.toString(),
        "updated",
        {
          _id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed
        },
        req.user._id.toString(),
        req.user.username
      );
    }
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function deleteTodo$1(req, res) {
  try {
    const { todoId } = req.params;
    const result = await deleteTodo$2(req.user._id, todoId);
    if (result.group) {
      notifyTodoChange(
        result.group.toString(),
        "deleted",
        {
          _id: result._id.toString(),
          title: result.title,
          completed: result.completed
        },
        req.user._id.toString(),
        req.user.username
      );
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function createGroupTodo(req, res) {
  try {
    const { groupId } = req.params;
    const todo = await createGroupTodo$1(req.user._id, groupId, req.body);
    if (todo && todo.group) {
      const groupName = req.body.groupName || "";
      notifyTodoChange(
        todo.group.toString(),
        "added",
        {
          _id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed
        },
        req.user._id.toString(),
        req.user.username,
        groupName
      );
      try {
        const message = `${req.user.username} added a new todo in ${groupName || "the group"}: ${todo.title}`;
        const notificationResult = await fetch(
          `${req.protocol}://${req.get("host")}/api/notifications/group`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.cookie,
              // Forward authentication
              Authorization: req.headers.authorization || ""
            },
            body: JSON.stringify({
              groupId: todo.group.toString(),
              type: "todo:added",
              message,
              todoId: todo._id.toString(),
              todoTitle: todo.title
            })
          }
        );
        if (!notificationResult.ok) {
          console.error("Failed to create notifications:", await notificationResult.text());
        }
      } catch (notifyErr) {
        console.error("Error creating notifications:", notifyErr);
      }
    }
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function getGroupTodos(req, res) {
  try {
    const { groupId } = req.params;
    const todos = await getGroupTodos$1(req.user._id, groupId);
    res.json(todos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function updateGroupTodo(req, res) {
  try {
    const { todoId } = req.params;
    const todo = await updateGroupTodo$1(req.user._id, todoId, req.body);
    if (todo && todo.group) {
      let eventType = "updated";
      if ("completed" in req.body) {
        eventType = req.body.completed ? "completed" : "updated";
      }
      const groupName = req.body.groupName || "";
      notifyTodoChange(
        todo.group.toString(),
        eventType,
        {
          _id: todo._id.toString(),
          title: todo.title,
          completed: todo.completed
        },
        req.user._id.toString(),
        req.user.username,
        groupName
      );
    }
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function deleteGroupTodo(req, res) {
  try {
    const { todoId } = req.params;
    const todoData = await deleteGroupTodo$1(req.user._id, todoId);
    if (todoData && todoData.group) {
      notifyTodoChange(
        todoData.group.toString(),
        "deleted",
        {
          _id: todoData._id.toString(),
          title: todoData.title,
          completed: todoData.completed
        },
        req.user._id.toString(),
        req.user.username
      );
      try {
        let groupName = "";
        try {
          const Group2 = (await Promise.resolve().then(() => group_model)).default;
          const group = await Group2.findById(todoData.group);
          if (group) {
            groupName = group.name;
          }
        } catch (groupErr) {
          console.error("Error fetching group name:", groupErr);
        }
        const message = `${req.user.username} deleted a todo from ${groupName || "the group"}: ${todoData.title}`;
        const notificationResult = await fetch(
          `${req.protocol}://${req.get("host")}/api/notifications/group`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.cookie,
              // Forward authentication
              Authorization: req.headers.authorization || ""
            },
            body: JSON.stringify({
              groupId: todoData.group.toString(),
              type: "todo:deleted",
              message,
              todoId: todoData._id.toString(),
              todoTitle: todoData.title
            })
          }
        );
        if (!notificationResult.ok) {
          console.error("Failed to create notifications:", await notificationResult.text());
        }
      } catch (notifyErr) {
        console.error("Error creating notifications:", notifyErr);
      }
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
const router$4 = express.Router();
router$4.use(protect);
router$4.post("/", createTodo$1);
router$4.get("/", getTodos);
router$4.get("/:todoId", getTodoById);
router$4.put("/:todoId", updateTodo$1);
router$4.delete("/:todoId", deleteTodo$1);
router$4.post("/by-group/:groupId", createGroupTodo);
router$4.get("/by-group/:groupId", getGroupTodos);
router$4.put("/by-id/:todoId", updateGroupTodo);
router$4.delete("/by-id/:todoId", deleteGroupTodo);
const createGroup = async (req, res) => {
  try {
    const { name, imageUrl, invitees } = req.body;
    const userId = req.user._id;
    console.log(userId);
    const group = new Group({
      name,
      imageUrl,
      createdBy: userId,
      members: [
        {
          user: userId,
          role: "admin",
          invitationStatus: "accepted",
          addedBy: userId
        }
      ]
    });
    if (invitees && invitees.length > 0) {
      const emailList = invitees.map((invitee) => invitee.email);
      const users = await User.find({ email: { $in: emailList } });
      const emailToUserMap = {};
      users.forEach((user) => {
        emailToUserMap[user.email] = user._id;
      });
      for (const invitee of invitees) {
        const userId2 = emailToUserMap[invitee.email];
        if (userId2) {
          group.members.push({
            user: userId2,
            role: "member",
            // Default role for invitees
            invitationStatus: "pending",
            addedBy: req.user._id
          });
        }
      }
    }
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message
    });
  }
};
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({
      "members.user": userId,
      "members.invitationStatus": "accepted"
    }).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message
    });
  }
};
const getPendingInvitations = async (req, res) => {
  try {
    const userId = req.user._id;
    const pendingGroups = await Group.find({
      "members.user": userId,
      "members.invitationStatus": "pending",
      createdBy: { $ne: userId }
      // Exclude groups created by the user
    }).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage").populate("members.addedBy", "username email profileImage");
    res.status(200).json({
      success: true,
      pendingInvitations: pendingGroups
    });
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending invitations",
      error: error.message
    });
  }
};
const respondToInvitation = async (req, res) => {
  try {
    const { groupId, response } = req.body;
    const userId = req.user._id;
    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response. Must be "accepted" or "declined"'
      });
    }
    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
      "members.invitationStatus": "pending"
    });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or already responded to"
      });
    }
    const memberIndex = group.members.findIndex(
      (member) => member.user.toString() === userId.toString()
    );
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found in group members"
      });
    }
    group.members[memberIndex].invitationStatus = response;
    if (response === "declined") {
      group.members.splice(memberIndex, 1);
    }
    await group.save();
    if (response === "accepted") {
      const user = await User.findById(userId).select("username email profileImage");
      notifyGroupJoined(
        groupId,
        {
          _id: user._id.toString(),
          username: user.username,
          profileImage: user.profileImage
        },
        userId.toString()
      );
    }
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(200).json({
      success: true,
      message: `Invitation ${response}`,
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to invitation",
      error: error.message
    });
  }
};
const updateMemberRole = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    const { newRole } = req.body;
    const userId = req.user._id;
    console.log(`Updating role for group: ${groupId}, member: ${memberId}, new role: ${newRole}`);
    if (!["co-lead", "elder", "member"].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "co-lead", "elder", or "member"'
      });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const currentUserMember = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );
    if (!currentUserMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }
    if (currentUserMember.role !== "admin" && currentUserMember.role !== "co-lead") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to change roles"
      });
    }
    const memberToUpdate = group.members.find((member) => member.user.toString() === memberId);
    if (!memberToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Member not found in group"
      });
    }
    if (memberToUpdate.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot change role of the admin"
      });
    }
    if (currentUserMember.role === "co-lead" && memberToUpdate.role === "co-lead") {
      return res.status(403).json({
        success: false,
        message: "Co-leads cannot modify other co-leads"
      });
    }
    memberToUpdate.role = newRole;
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update member role",
      error: error.message
    });
  }
};
const removeMember = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    const userId = req.user._id;
    console.log(`Removing member from group: ${groupId}, member: ${memberId}`);
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const currentUserMember = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );
    if (!currentUserMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }
    const memberToRemove = group.members.find((member) => member.user.toString() === memberId);
    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: "Member not found in group"
      });
    }
    if (memberToRemove.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot remove the admin from the group"
      });
    }
    if (currentUserMember.role === "member") {
      return res.status(403).json({
        success: false,
        message: "Regular members cannot remove other members"
      });
    }
    if (currentUserMember.role === "elder" && (memberToRemove.role === "elder" || memberToRemove.role === "co-lead")) {
      return res.status(403).json({
        success: false,
        message: "Elders can only remove regular members"
      });
    }
    if (currentUserMember.role === "co-lead" && memberToRemove.role === "co-lead") {
      return res.status(403).json({
        success: false,
        message: "Co-leads cannot remove other co-leads"
      });
    }
    group.members = group.members.filter((member) => member.user.toString() !== memberId);
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message
    });
  }
};
const inviteToGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { email } = req.body;
    const userId = req.user._id;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const requestingMember = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );
    if (!requestingMember || !["admin", "co-lead"].includes(requestingMember.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to invite users to this group"
      });
    }
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found"
      });
    }
    const isMember = group.members.some(
      (member) => member.user.toString() === userToInvite._id.toString()
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group"
      });
    }
    group.members.push({
      user: userToInvite._id,
      role: "member",
      invitationStatus: "pending",
      addedBy: userId
    });
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    notifyGroupInvitation(
      userToInvite._id.toString(),
      {
        _id: group._id.toString(),
        name: group.name,
        imageUrl: group.imageUrl
      },
      req.user.username
    );
    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error inviting user to group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to invite user",
      error: error.message
    });
  }
};
const getGroupById = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;
    const group = await Group.findById(groupId).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const isMember = group.members.some(
      (member) => member.user._id.toString() === userId.toString() && member.invitationStatus === "accepted"
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this group"
      });
    }
    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group",
      error: error.message
    });
  }
};
const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;
    const { name, imageUrl } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const currentUserMember = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );
    if (!currentUserMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }
    if (currentUserMember.role !== "admin" && currentUserMember.role !== "co-lead") {
      return res.status(403).json({
        success: false,
        message: "Only admin and co-leads can update group details"
      });
    }
    if (name) group.name = name;
    if (imageUrl) group.imageUrl = imageUrl;
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate("members.user", "username email profileImage").populate("createdBy", "username email profileImage");
    res.status(200).json({
      success: true,
      message: "Group details updated successfully",
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message
    });
  }
};
const deleteGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;
    console.log("Delete group request received:");
    console.log("- Group ID:", groupId);
    console.log("- User ID:", userId);
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    const currentUserMember = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );
    if (!currentUserMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }
    if (currentUserMember.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can delete the group"
      });
    }
    await Todo.deleteMany({ group: groupId });
    await Group.findByIdAndDelete(groupId);
    res.status(200).json({
      success: true,
      message: "Group and associated todos deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message
    });
  }
};
const getSharedGroupById = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const group = await Group.findById(groupId).populate("members.user", "username profileImage").populate("createdBy", "username");
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Shared group not found"
      });
    }
    const Todo2 = (await Promise.resolve().then(() => todo_model)).default;
    const todos = await Todo2.find({ group: groupId }).sort({ createdAt: -1 }).populate("createdBy", "username");
    res.status(200).json({
      success: true,
      group,
      todos
    });
  } catch (error) {
    console.error("Error fetching shared group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shared group",
      error: error.message
    });
  }
};
const router$3 = express.Router();
router$3.get("/shared/:id", getSharedGroupById);
router$3.use(protect);
router$3.get("/", getUserGroups);
router$3.post("/", createGroup);
router$3.get("/invitations", getPendingInvitations);
router$3.post("/invitation/:id/respond", respondToInvitation);
router$3.put("/:id/member/:memberId/role", updateMemberRole);
router$3.delete("/:id/member/:memberId", removeMember);
router$3.post("/:id/invite", inviteToGroup);
router$3.get("/:id", getGroupById);
router$3.put("/:id", updateGroup);
router$3.delete("/:id", deleteGroup);
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
async function getSuggestions$1(userInput) {
  try {
    if (!userInput || userInput.trim().length === 0) {
      return [];
    }
    const prompt = `
    You are a helpful todo list assistant. Based on the following partial todo item, 
    suggest 3 clear, concise, and specific ways to complete it. Each suggestion should be 
    actionable and well-defined. Only return the suggestions without any additional text.
    
    Partial todo: "${userInput}"
    `;
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      }
    );
    const text = response.data.candidates[0].content.parts[0].text;
    const suggestions = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("-")).slice(0, 3);
    return suggestions;
  } catch (error) {
    console.error("Error getting AI suggestions:", error.response?.data || error.message);
    return [];
  }
}
async function getSuggestions(req, res) {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ message: "Input text is required" });
    }
    const suggestions = await getSuggestions$1(input);
    res.json({ suggestions });
  } catch (error) {
    console.error("Error in getSuggestions controller:", error);
    res.status(500).json({
      message: "Error generating suggestions",
      error: error.message
    });
  }
}
const router$2 = express.Router();
router$2.use(protect);
router$2.post("/suggest", getSuggestions);
async function getTodosByGroup(groupId) {
  try {
    const todos = await Todo.find({ group: groupId }).sort({ createdAt: -1 }).populate("createdBy", "username email profileImage");
    return todos;
  } catch (error) {
    console.error("Error fetching group todos:", error);
    throw new Error("Failed to fetch group todos");
  }
}
async function userHasAccessToGroup(userId, groupId) {
  try {
    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
      "members.invitationStatus": "accepted"
    });
    return !!group;
  } catch (error) {
    console.error("Error checking group access:", error);
    return false;
  }
}
async function createTodo(userId, groupId, data) {
  try {
    const todoData = {
      ...data,
      user: userId,
      group: groupId,
      createdBy: userId
    };
    const todo = await Todo.create(todoData);
    return todo;
  } catch (error) {
    console.error("Error creating group todo:", error);
    throw new Error("Failed to create group todo");
  }
}
async function updateTodo(todoId, data) {
  try {
    const todo = await Todo.findById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }
    Object.assign(todo, data);
    return await todo.save();
  } catch (error) {
    console.error("Error updating group todo:", error);
    throw new Error("Failed to update group todo");
  }
}
async function deleteTodo(todoId) {
  try {
    const todo = await Todo.findById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }
    await Todo.deleteOne({ _id: todoId });
    return { message: "Todo deleted successfully" };
  } catch (error) {
    console.error("Error deleting group todo:", error);
    throw new Error("Failed to delete group todo");
  }
}
const groupTodo_service = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createTodo,
  deleteTodo,
  getTodosByGroup,
  updateTodo,
  userHasAccessToGroup
}, Symbol.toStringTag, { value: "Module" }));
async function searchTodos(req, res) {
  try {
    console.log("Search request received:");
    console.log("URL:", req.url);
    console.log("Query params:", req.query);
    console.log("Request params:", req.params);
    console.log("Request path:", req.path);
    let query = req.query.query;
    if (!query && req.url && req.url.includes("?")) {
      const urlParts = req.url.split("?");
      if (urlParts.length > 1) {
        const queryParams = new URLSearchParams(urlParts[1]);
        query = queryParams.get("query");
        console.log("Extracted query from URL manually:", query);
      }
    }
    console.log("Express search controller received query:", query);
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }
    console.log(`Searching Typesense with user ID: ${req.user._id} and query: ${query}`);
    const searchResults = await searchTodos$1(req.user._id, query.trim());
    console.log(`Search found ${searchResults.hits?.length || 0} results`);
    return res.status(200).json(searchResults);
  } catch (error) {
    console.error("Error searching todos:", error);
    return res.status(500).json({ message: "Error searching todos", error: error.message });
  }
}
async function syncTodosIndex(req, res) {
  try {
    console.log(`Syncing todos for user: ${req.user._id}`);
    const todos = await getTodosByUser(req.user._id);
    console.log(`Found ${todos.length} todos to sync`);
    const success = await syncTodosToTypesense(todos);
    if (success) {
      console.log("Todos successfully synced to Typesense");
      return res.status(200).json({
        message: "Todos successfully indexed",
        count: todos.length,
        fallback: false
      });
    } else {
      console.error("Failed to sync todos to Typesense");
      return res.status(200).json({
        message: "Using fallback search (Typesense not available)",
        count: todos.length,
        fallback: true
      });
    }
  } catch (error) {
    console.error("Error syncing todos index:", error);
    return res.status(500).json({
      message: "Failed to sync todos index",
      error: error.message || "Unknown error",
      fallback: true
    });
  }
}
async function searchGroupTodos(req, res) {
  try {
    console.log("Group search request received:");
    console.log("URL:", req.url);
    console.log("Query params:", req.query);
    let query = req.query.query;
    let groupId = req.query.groupId;
    if ((!query || !groupId) && req.url && req.url.includes("?")) {
      const urlParts = req.url.split("?");
      if (urlParts.length > 1) {
        const queryParams = new URLSearchParams(urlParts[1]);
        if (!query) {
          query = queryParams.get("query");
          console.log("Extracted query from URL manually:", query);
        }
        if (!groupId) {
          groupId = queryParams.get("groupId");
          console.log("Extracted groupId from URL manually:", groupId);
        }
      }
    }
    console.log(`Group Todo Controller - Final params: query=${query}, groupId=${groupId}`);
    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    const hasAccess = await userHasAccessToGroup(req.user._id, groupId);
    if (!hasAccess) {
      return res.status(403).json({ message: "You do not have access to this group" });
    }
    const searchResults = await searchGroupTodos$1(groupId, query.trim());
    console.log(`Group search found ${searchResults.hits?.length || 0} results`);
    return res.json(searchResults);
  } catch (error) {
    console.error("Error searching group todos:", error);
    return res.status(500).json({
      message: "Failed to search group todos",
      error: error.message || "Unknown error"
    });
  }
}
async function syncGroupTodosIndex(req, res) {
  try {
    console.log("Group sync request received:");
    console.log("URL:", req.url);
    console.log("Query params:", req.query);
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?._id);
    let groupId = req.query.groupId;
    if (!groupId && req.url && req.url.includes("?")) {
      const urlParts = req.url.split("?");
      if (urlParts.length > 1) {
        const queryParams = new URLSearchParams(urlParts[1]);
        groupId = queryParams.get("groupId");
        console.log("Extracted groupId from URL manually:", groupId);
      }
    }
    console.log(`Group Todo Controller - Final params: groupId=${groupId}`);
    if (!groupId) {
      console.error("Missing groupId in sync request");
      return res.status(200).json({
        message: "Group ID is required",
        fallback: true
      });
    }
    try {
      const hasAccess = await userHasAccessToGroup(req.user._id, groupId);
      if (!hasAccess) {
        console.error(`User ${req.user._id} has no access to group ${groupId}`);
        return res.status(200).json({
          message: "You do not have access to this group",
          fallback: true
        });
      }
    } catch (accessErr) {
      console.error("Error checking group access:", accessErr);
      return res.status(200).json({
        message: "Using fallback search due to access check error",
        error: accessErr.message,
        fallback: true
      });
    }
    let todos = [];
    try {
      console.log(`Fetching todos for group: ${groupId}`);
      todos = await getTodosByGroup(groupId);
      console.log(`Found ${todos.length} group todos to sync`);
    } catch (todosErr) {
      console.error("Error fetching group todos:", todosErr);
      return res.status(200).json({
        message: "Using fallback search due to todos fetch error",
        error: todosErr.message,
        fallback: true
      });
    }
    try {
      const success = await syncGroupTodosToTypesense(todos);
      if (success) {
        console.log("Group todos successfully synced to Typesense");
        return res.status(200).json({
          message: "Group todos successfully indexed",
          count: todos.length,
          fallback: false
        });
      } else {
        console.log("Typesense not available, using fallback search");
        return res.status(200).json({
          message: "Using fallback search (Typesense not available)",
          count: todos.length,
          fallback: true
        });
      }
    } catch (syncErr) {
      console.error("Error during Typesense sync:", syncErr);
      return res.status(200).json({
        message: "Using fallback search due to sync error",
        error: syncErr.message,
        fallback: true
      });
    }
  } catch (error) {
    console.error("Unhandled error in group todos sync:", error);
    return res.status(200).json({
      message: "Using fallback search due to unhandled error",
      error: error.message || "Unknown error",
      fallback: true
    });
  }
}
const router$1 = express.Router();
router$1.use(protect);
router$1.get("/todos", searchTodos);
router$1.post("/todos/sync", syncTodosIndex);
router$1.get("/todos/group", searchGroupTodos);
router$1.post("/todos/group/sync", syncGroupTodosIndex);
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      required: true,
      enum: ["todo:added", "todo:deleted", "todo:completed", "group:invite", "group:join"]
    },
    read: {
      type: Boolean,
      default: false
    },
    message: String,
    relatedGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    relatedTodo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo"
    },
    data: Object
  },
  { timestamps: true }
);
notificationSchema.index({ recipient: 1, read: 1 });
const Notification = mongoose.model("Notification", notificationSchema);
async function notifyGroupMembers(req, res) {
  try {
    const { groupId, type, message, todoId, todoTitle } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    const createdNotifications = [];
    for (const member of group.members) {
      if (member.user.toString() === req.user._id.toString()) {
        continue;
      }
      if (member.invitationStatus !== "accepted") {
        continue;
      }
      const notification = await Notification.create({
        recipient: member.user,
        sender: req.user._id,
        type,
        message,
        relatedGroup: groupId,
        relatedTodo: todoId,
        data: {
          groupName: group.name,
          todoTitle,
          senderName: req.user.username
        }
      });
      createdNotifications.push(notification);
      notifyUser(member.user.toString(), type, {
        notification: notification._id,
        message,
        groupId,
        groupName: group.name,
        todoTitle,
        userName: req.user.username,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.status(201).json({
      success: true,
      count: createdNotifications.length,
      notifications: createdNotifications
    });
  } catch (err) {
    console.error("Error creating notifications:", err);
    res.status(500).json({ message: "Failed to create notifications" });
  }
}
async function getUserNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50).populate("sender", "username profileImage").populate("relatedGroup", "name").exec();
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
}
async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const result = await Notification.updateOne(
      { _id: notificationId, recipient: req.user._id },
      { read: true }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
}
async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
}
const router = express.Router();
router.use(authenticateUser);
router.post("/group", notifyGroupMembers);
router.get("/", getUserNotifications);
router.put("/:notificationId/read", markAsRead);
router.put("/read-all", markAllAsRead);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (!dbState.isConnected) {
    if (dbState.error) {
      return res.status(503).json({
        message: "Database unavailable",
        error: dbState.error
      });
    }
  }
  next();
});
app.use("/api/users", router$5);
app.use("/api/todos", router$4);
app.use("/api/groups", router$3);
app.use("/api/ai", router$2);
app.use("/api/search", router$1);
app.use("/api/notifications", router);
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});
let dbConnectPromise = null;
async function ensureDbConnected() {
  if (!dbConnectPromise) {
    dbConnectPromise = connectDB().catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      dbConnectPromise = null;
    });
  }
  return dbConnectPromise;
}
async function initializeTypesense() {
  try {
    await initTypesense();
    console.log("Typesense initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Typesense:", error);
  }
}
async function handleRequest(method, url, body, headers, cookies) {
  ensureDbConnected().catch(() => {
  });
  initializeTypesense().catch(() => {
  });
  console.log(`handleRequest: ${method} ${url}`);
  if (headers instanceof Headers) {
    console.log(
      "Headers provided:",
      Object.fromEntries(
        [...headers.entries()].filter(([k]) => k !== "cookie" && k !== "authorization")
      )
    );
    const authHeader = headers.get("authorization");
    if (authHeader) {
      console.log("Authorization header present:", authHeader.substring(0, 15) + "...");
    } else {
      console.log("Authorization header not present");
    }
  } else {
    console.log(
      "Headers provided:",
      Object.entries(headers || {}).filter(([k]) => k.toLowerCase() !== "cookie" && k.toLowerCase() !== "authorization").reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
    );
    if (headers && headers.authorization) {
      console.log("Authorization header present:", headers.authorization.substring(0, 15) + "...");
    } else if (headers && headers.Authorization) {
      console.log("Authorization header present:", headers.Authorization.substring(0, 15) + "...");
    } else {
      console.log("Authorization header not present");
    }
  }
  let jwtToken = null;
  const cookieObj = {};
  if (cookies && typeof cookies.get === "function") {
    try {
      jwtToken = cookies.get("jwt");
      if (jwtToken) {
        cookieObj.jwt = jwtToken;
        console.log("JWT token extracted from cookies");
      }
    } catch (error) {
      console.error("Error extracting jwt cookie:", error);
    }
  } else if (typeof cookies === "object") {
    Object.assign(cookieObj, cookies);
    if (cookies.jwt) {
      jwtToken = cookies.jwt;
    }
  }
  let finalHeaders = {};
  if (headers instanceof Headers) {
    finalHeaders = Object.fromEntries([...headers.entries()]);
  } else {
    finalHeaders = headers || {};
  }
  if (jwtToken && !finalHeaders.authorization && !finalHeaders.Authorization) {
    finalHeaders.authorization = `Bearer ${jwtToken}`;
    finalHeaders.Authorization = `Bearer ${jwtToken}`;
    console.log("Added Authorization header from cookies jwt");
  }
  console.log("Cookies prepared:", Object.keys(cookieObj));
  return new Promise((resolve, reject) => {
    const req = Object.assign(Readable.from([]), {
      method,
      url,
      headers: finalHeaders,
      cookies: cookieObj,
      // Initialize with empty body
      body: null,
      // Add _body property to indicate if body is parsed
      _body: false,
      get(headerName) {
        return this.headers[headerName.toLowerCase()];
      },
      path: url,
      originalUrl: url,
      query: {},
      params: {},
      socket: {
        remoteAddress: "127.0.0.1"
      }
    });
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      const isApiRequest = url.startsWith("/api/");
      let bodyContent = body;
      if (typeof body === "object" && !(body instanceof Buffer) && !(body instanceof Uint8Array)) {
        bodyContent = JSON.stringify(body);
      }
      const stream = Readable.from([bodyContent]);
      Object.assign(req, stream);
      req.headers["content-type"] = "application/json";
      req.headers["content-length"] = String(Buffer.byteLength(bodyContent));
      if (isApiRequest) {
        if (typeof bodyContent === "string") {
          try {
            req.body = JSON.parse(bodyContent);
            console.log(`Pre-parsed JSON body for ${url}`);
          } catch (err) {
            console.error(`Failed to pre-parse JSON body for ${url}:`, err);
          }
        } else {
          req.body = body;
        }
        req._body = true;
        const debugBody = { ...req.body };
        if (debugBody.password) debugBody.password = "***";
        console.log(`Request body for ${url}:`, debugBody);
      }
    }
    console.log("Created mock request with:", {
      url: req.url,
      method: req.method,
      hasCookies: Object.keys(req.cookies).length > 0,
      hasAuth: !!req.headers.authorization || !!req.headers.Authorization,
      hasJwtCookie: !!req.cookies.jwt,
      cookieKeys: Object.keys(req.cookies),
      authHeaderValue: req.headers.authorization || req.headers.Authorization ? `${(req.headers.authorization || req.headers.Authorization).substring(0, 15)}...` : "none"
    });
    const res = {
      statusCode: 200,
      _headers: {},
      _body: null,
      _cookies: [],
      status(code) {
        this.statusCode = code;
        return this;
      },
      set(header, value) {
        this._headers[header] = value;
        return this;
      },
      setHeader(header, value) {
        this._headers[header] = value;
        return this;
      },
      getHeader(header) {
        return this._headers[header];
      },
      cookie(name, value, options) {
        const cookieOptions = {
          ...options,
          path: options?.path || "/"
        };
        this._cookies.push({ name, value, options: cookieOptions });
        return this;
      },
      json(body2) {
        this._body = body2;
        this._headers["Content-Type"] = "application/json";
        resolve({
          status: this.statusCode,
          headers: this._headers,
          body: this._body,
          cookies: this._cookies
        });
      },
      send(body2) {
        this._body = body2;
        resolve({
          status: this.statusCode,
          headers: this._headers,
          body: this._body,
          cookies: this._cookies
        });
      },
      end() {
        resolve({
          status: this.statusCode,
          headers: this._headers,
          body: this._body,
          cookies: this._cookies
        });
      }
    };
    if (!dbState.isConnected) {
      if (url.startsWith("/api/users/register") || url.startsWith("/api/users/login")) {
        return resolve({
          status: 503,
          body: {
            message: "Service temporarily unavailable",
            error: "Database connection failed. Please try again later."
          }
        });
      }
    }
    try {
      app(req, res, (err) => {
        if (err) {
          console.error("Express middleware error:", err);
          reject(err);
        } else {
          resolve({
            status: 404,
            body: { message: "Not found" }
          });
        }
      });
    } catch (error) {
      console.error("Express app error:", error);
      reject(error);
    }
  });
}
export {
  app as a,
  handleRequest as h
};

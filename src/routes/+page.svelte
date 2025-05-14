<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/Header.svelte';

    interface User {
        username: string;
        profileImage?: string;
        // Add other user properties as needed
    }

    let user: User | null = null;
    let loading = true;
    let dbError: string | null = null;

    interface Todo {
        id: string;
        title: string;
        completed: boolean;
        createdAt: string;
    }

    let todos: Todo[] = [];
    let newTodo = '';
    let todoError: string | null = null;

    async function fetchTodos() {
        try {
            const res = await fetch('/api/todos');
            if (res.ok) {
                todos = await res.json();
            } else {
                todoError = 'Failed to load todos';
            }
        } catch (e) {
            todoError = 'Failed to load todos';
        }
    }

    async function addTodo() {
        if (!newTodo.trim()) return;
        const res = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTodo })
        });
        if (res.ok) {
            newTodo = '';
            await fetchTodos();
        } else {
            todoError = 'Failed to add todo';
        }
    }

    onMount(async () => {
        try {
            // Try to fetch the user profile
            const response = await fetch('/api/auth/me');

            if (response.ok) {
                user = await response.json();
            } else if (response.status === 503) {
                const data = await response.json();
                dbError = data.error || 'Database unavailable';
            }
            if (user) {
                await fetchTodos();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            loading = false;
        }
    });

    function handleLogout() {
        fetch('/api/auth/logout', {
            method: 'POST'
        }).then(() => {
            user = null;
            goto('/auth/login');
        });
    }
</script>


<div class="min-h-screen bg-white">


    <main class="container mx-auto p-4">
        {#if user}
            <div class="mt-8 text-center">
                <h2 class="text-lg font-medium">Welcome, {user.username}!</h2>
                <p class="mt-2 text-gray-600">This is your Todo application.</p>

                <!-- Todo App Content -->
                <div class="mt-8 max-w-4xl mx-auto">
                    <form on:submit|preventDefault={addTodo} class="flex gap-2 mb-8 justify-center">
                        <input
                            class="flex-1 border rounded px-4 py-2 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-md"
                            bind:value={newTodo}
                            placeholder="Add a new todo..."
                        />
                        <button class="bg-blue-500 text-white px-6 py-2 rounded-lg text-lg shadow hover:bg-blue-600 transition" type="submit">Add</button>
                    </form>

                    {#if todoError}
                        <p class="text-red-500 mb-2">{todoError}</p>
                    {/if}

                    <!-- Modern horizontal card layout -->
                    <div class="flex flex-wrap gap-6 justify-center">
                        {#each todos as todo}
                            <div class="flex flex-col items-center justify-center bg-white shadow-lg rounded-2xl border border-gray-200 p-6 min-w-[260px] min-h-[140px] max-w-xs transition-transform hover:scale-105">
                                <label class="flex items-center gap-3 w-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        class="accent-blue-500 w-6 h-6 rounded border-gray-300 transition"
                                        disabled
                                    />
                                    <span class="text-xl font-semibold break-words">{todo.title}</span>
                                </label>
                                <p class="text-xs text-gray-400 mt-3 w-full text-right">{new Date(todo.createdAt).toLocaleString()}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if !loading}
            <div class="mt-16 text-center">
                <h2 class="text-lg font-medium">Welcome to the Todo App</h2>
                <p class="mt-2 text-gray-600">Please log in or sign up to get started.</p>
            </div>
        {/if}
    </main>

    {#if dbError}
        <div class="fixed right-4 bottom-4 max-w-md rounded-md bg-yellow-100 p-4 shadow-md">
            <div class="flex">
                <div class="flex-shrink-0">
                    <!-- Warning icon -->
                    <svg
                        class="h-5 w-5 text-yellow-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 012 0v6a1 1 0 01-2 0V5zm1 9a1 1 0 100 2 1 1 0 000-2z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">Database Connection Issue</h3>
                    <div class="mt-1 text-xs text-yellow-700">
                        <p>{dbError}</p>
                        <p class="mt-1">Some features may be unavailable. Please try again later.</p>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
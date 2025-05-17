<script lang="ts">
    import type { Todo } from '../../types';
    import { slide, fade } from 'svelte/transition';

    export let title: string;
    export let todos: Todo[] = [];
    export let color: string;
    export let bgColor: string;
    export let icon: string = '';
    export let canEdit: boolean = true;
    export let onToggleTodo: (todo: Todo) => void;
    export let onDeleteTodo: (todo: Todo) => void;
    
    let isCollapsed = false;
    
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
    }

    // Get completion stats
    $: totalTasks = todos.length;
    $: completedTasks = todos.filter(todo => todo.completed).length;
    $: completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Cubic easing function
    function cubicOut(t: number): number {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    // Check if a todo has tagged members
    function hasTags(todo: Todo): boolean {
        return Boolean(todo.taggedMembers && todo.taggedMembers.length > 0);
    }
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden" 
    transition:fade={{ duration: 300 }}>
    <div class="flex items-center justify-between p-3 bg-white">
        <div class="flex items-center gap-2">
            {#if icon}
                <span class="text-xl">{icon}</span>
            {/if}
            <h3 class="text-base font-medium {color}">
                {title}
                <span class="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {todos.length}
                </span>
            </h3>
        </div>
        <div class="flex items-center gap-3">
            {#if totalTasks > 0}
                <div class="flex items-center gap-2">
                    <div class="h-1.5 w-20 rounded-full bg-gray-200">
                        <div class="h-1.5 rounded-full {bgColor}" style="width: {completionPercentage}%"></div>
                    </div>
                    <span class="text-xs text-gray-500">{completedTasks}/{totalTasks}</span>
                </div>
            {/if}
            <button 
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                on:click={toggleCollapse}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d={isCollapsed ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
                    />
                </svg>
            </button>
        </div>
    </div>
    
    {#if !isCollapsed}
        <div class="px-3 pb-3" transition:slide={{ duration: 200, easing: cubicOut }}>
            {#if todos.length === 0}
                <div class="py-4 text-center text-gray-500 bg-gray-50 rounded-md">
                    <p>No tasks in this category</p>
                </div>
            {:else}
                <ul class="space-y-2">
                    {#each todos as todo (todo._id)}
                        <li class="flex items-center justify-between rounded border {hasTags(todo) ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'} p-3 shadow-sm">
                            <div class="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    on:change={() => onToggleTodo(todo)}
                                    class="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    disabled={!canEdit}
                                />
                                <div>
                                    <span class={todo.completed ? 'text-gray-500 line-through' : ''}>
                                        {todo.title}
                                    </span>
                                    {#if hasTags(todo)}
                                        <div class="flex mt-1">
                                            <span class="text-xs text-purple-600 flex items-center">
                                                <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                                </svg>
                                                Tagged task (private)
                                            </span>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs text-gray-500">
                                    {typeof todo.createdBy === 'string' ? 'Unknown' : todo.createdBy.username}
                                </span>
                                {#if canEdit}
                                    <button
                                        on:click={() => onDeleteTodo(todo)}
                                        class="ml-2 text-red-500 hover:text-red-700"
                                        title="Delete"
                                    >
                                        <svg
                                            class="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div> 
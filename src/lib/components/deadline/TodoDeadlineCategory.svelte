<script lang="ts">
    import type { Todo } from '../../types';
    import TodoItem from '../TodoItem.svelte';
    import { fade, slide } from 'svelte/transition';

    export let title: string;
    export let todos: Todo[] = [];
    export let color: string;
    export let bgColor: string;
    export let icon: string = '';
    
    let isCollapsed = false;
    
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
    }

    // Get completion stats
    $: totalTasks = todos.length;
    $: completedTasks = todos.filter(todo => todo.completed).length;
    $: completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
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
        <div class="px-3 pb-3" transition:slide={{ duration: 200 }}>
            {#if todos.length === 0}
                <div class="py-4 text-center text-gray-500 bg-gray-50 rounded-md">
                    <p>No tasks in this category</p>
                </div>
            {:else}
                <div class="space-y-2">
                    {#each todos as todo (todo._id)}
                        <TodoItem {todo} />
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div> 
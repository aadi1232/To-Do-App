<script lang="ts">
    import { onMount } from 'svelte';
    import type { Todo } from '../../types';
    import GroupTodoDeadlineCategory from './GroupTodoDeadlineCategory.svelte';
    import { slide, fade } from 'svelte/transition';
    
    export let allTodos: Todo[] = [];
    export let groupId: string;
    export let canEdit: boolean = true;
    export let onToggleTodo: (todo: Todo) => void;
    export let onDeleteTodo: (todo: Todo) => void;
    
    // Filter todos by deadline
    $: todayTodos = allTodos.filter(todo => todo.deadline === 'today');
    $: tomorrowTodos = allTodos.filter(todo => todo.deadline === 'tomorrow');
    $: laterTodos = allTodos.filter(todo => todo.deadline === 'later');
    $: unscheduledTodos = allTodos.filter(todo => !todo.deadline);
    
    // Get today's date in format like "Monday, June 10"
    function getTodayDateString() {
        const today = new Date();
        return today.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    // Get tomorrow's date in format like "Tuesday, June 11"
    function getTomorrowDateString() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }
    
    const todayDate = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();

    // Category selection
    let selectedCategory = "nodeadline"; // Default to showing unscheduled tasks
    
    const categoryOptions = [
        { value: "all", label: "All Tasks" },
        { value: "today", label: "Today's Tasks" },
        { value: "tomorrow", label: "Tomorrow's Tasks" },
        { value: "later", label: "Later Tasks" },
        { value: "nodeadline", label: "Unscheduled Tasks" }
    ];
    
    function shouldShowCategory(category: string): boolean {
        return selectedCategory === "all" || selectedCategory === category;
    }
    
    // Create an object to track what's visible for smooth transitions
    let visibleSections = {
        today: shouldShowCategory("today") && todayTodos.length > 0,
        tomorrow: shouldShowCategory("tomorrow") && tomorrowTodos.length > 0,
        later: shouldShowCategory("later") && laterTodos.length > 0,
        nodeadline: shouldShowCategory("nodeadline") || selectedCategory === "all"
    };
    
    $: {
        // Update visible sections when selection changes, with a slight delay
        visibleSections = {
            today: shouldShowCategory("today") && todayTodos.length > 0,
            tomorrow: shouldShowCategory("tomorrow") && tomorrowTodos.length > 0,
            later: shouldShowCategory("later") && laterTodos.length > 0,
            nodeadline: shouldShowCategory("nodeadline") || selectedCategory === "all"
        };
    }
    
    // Cubic easing function
    function cubicOut(t: number): number {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
</script>

<div class="mt-6 grid grid-cols-1 gap-6">
    <div class="flex justify-between items-center mb-2">
        <div>
            <h2 class="text-xl font-bold text-gray-800">Organize Group Tasks</h2>
            <p class="text-gray-600">Manage your group tasks by deadline - collaborate on what needs to be done first</p>
        </div>
        <div class="relative">
            <select 
                bind:value={selectedCategory}
                class="block appearance-none bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
                {#each categoryOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="deadline-sections space-y-6">
        {#if visibleSections.today}
            <section 
                class="deadline-section" 
                transition:slide|local={{ duration: 300, easing: cubicOut }}
            >
                <h3 class="text-lg font-bold text-red-800 mb-3 pl-2 border-l-4 border-red-500 py-1">Today's Tasks</h3>
                <GroupTodoDeadlineCategory
                    title={`${todayDate}`}
                    todos={todayTodos}
                    color="text-red-800"
                    bgColor="bg-red-500"
                    icon="📅"
                    {canEdit}
                    {onToggleTodo}
                    {onDeleteTodo}
                />
            </section>
        {/if}
        
        {#if visibleSections.tomorrow}
            <section 
                class="deadline-section" 
                transition:slide|local={{ duration: 300, easing: cubicOut }}
            >
                <h3 class="text-lg font-bold text-orange-800 mb-3 pl-2 border-l-4 border-orange-500 py-1">Tomorrow's Tasks</h3>
                <GroupTodoDeadlineCategory
                    title={`${tomorrowDate}`}
                    todos={tomorrowTodos}
                    color="text-orange-800"
                    bgColor="bg-orange-500"
                    icon="🗓️"
                    {canEdit}
                    {onToggleTodo}
                    {onDeleteTodo}
                />
            </section>
        {/if}
        
        {#if visibleSections.later}
            <section 
                class="deadline-section" 
                transition:slide|local={{ duration: 300, easing: cubicOut }}
            >
                <h3 class="text-lg font-bold text-blue-800 mb-3 pl-2 border-l-4 border-blue-500 py-1">Later Tasks</h3>
                <GroupTodoDeadlineCategory
                    title="Coming Up"
                    todos={laterTodos}
                    color="text-blue-800"
                    bgColor="bg-blue-500"
                    icon="⏳"
                    {canEdit}
                    {onToggleTodo}
                    {onDeleteTodo}
                />
            </section>
        {/if}
        
        {#if visibleSections.nodeadline}
            <section 
                class="deadline-section" 
                transition:slide|local={{ duration: 300, easing: cubicOut }}
            >
                <h3 class="text-lg font-bold text-gray-800 mb-3 pl-2 border-l-4 border-gray-500 py-1">Unscheduled Tasks</h3>
                <GroupTodoDeadlineCategory
                    title="No Deadline"
                    todos={unscheduledTodos}
                    color="text-gray-800"
                    bgColor="bg-gray-500"
                    icon="📌"
                    {canEdit}
                    {onToggleTodo}
                    {onDeleteTodo}
                />
            </section>
        {/if}
    </div>
</div> 
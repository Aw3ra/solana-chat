<script lang="ts">
    import { onMount } from "svelte";
    import { showModal } from "$lib/state/stores/modals";
    import Chatbox from "$lib/components/chatbox.svelte";
</script>

<div class="mx-auto max-w-2xl">
    <h1 class="my-8 text-6xl center">Vline questions</h1>
    <!-- Add chatbox  -->
    <Chatbox />

    <!-- <div class="mt-5 flex justify-center">
        <button
            class="btn"
            on:click={() => showModal("HELP")}>Open Modal</button
        >
    </div> -->
</div>

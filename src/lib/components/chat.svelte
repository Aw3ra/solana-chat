<script>
    import {AIChatMessage} from "langchain/schema";
    import Robot from '$lib/assets/robot.png';
    import User from '$lib/assets/user.png';

    export let messages = [];

</script>
<div class="chatbox" >
    <div class="messageContainer"bind:this={chatboxRef}>
        {#each messages as message}
        <div class="message" 
        class:user={message instanceof AIChatMessage}>
            {#if message instanceof AIChatMessage}
            <span class="author">
                <img alt="Solana AI" src={Robot} />
            </span>
            <span class="content ai">{@html formatText(message.text)}</span>
            {:else}
            <span class="content">{message.text}</span>
            <span class="author">
                <img alt="Solana AI" src={User} />
            </span>
            {/if}
        </div>
        {/each}
    </div>
    <!-- Your input box markup here -->
    <div class="inputWrapper">
        <input class="chatboxEnter"
        placeholder="Enter your message"
        on:keydown={(e) => {
            if (e.key === 'Enter') {
            addMessage(e.target.value);
            e.target.value = '';
            }
        }}
        />
    </div>
    <!-- Tagling for who it was builty by -->
    <div>
        <p class="text-black text-sm">Built by 0xAwera for Solana</p>
    </div>
</div>
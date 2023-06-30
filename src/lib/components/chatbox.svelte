<script>
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";

    let chatboxRef;
    async function getMessage(messages)
    {
        try{return await fetch('/api/openAIRoute',
            {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"messages": messages})
            })
            // API returns a json object with the response
            .then(response => response.json())
            .then(data => {
                return data
            })
        }
        catch(err){
            console.log(err)
        } 
    }
    export let messages = [new AIChatMessage("Hello, I am Solana AI. I have access to a vast majority of the github repos for solana, please ask me anything.")];
    
    afterUpdate(() => {
        scrollChatboxToBottom();
    });
    function scrollChatboxToBottom() {
        chatboxRef.scrollTop = chatboxRef.scrollHeight;
    }


    //   Create chat model
    async function addMessage(message) {
        messages = [...messages, new HumanChatMessage(message)];
        // For each message in messages, add to the chatModel.call to continue conversartion
        const response = new AIChatMessage(await getMessage(messages));
        messages = [...messages, response];
        console.log(messages)
    }
</script>
<div class="bg-faint">
  <div class="chatbox" >
    <div class="messageContainer"bind:this={chatboxRef}>
      {#each messages as message}
        <div class="message" class:user={message instanceof HumanChatMessage}>
          {#if message instanceof HumanChatMessage}
            <span class="author">UI</span>
            <span class="content">{message.text}</span>
          {:else}
            <span class="content">{message.text}</span>
            <span class="author">AI</span>
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
  </div>
</div>
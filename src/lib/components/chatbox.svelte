<script lang="ts">
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";
    import Robot from '$lib/assets/robot.png';
    import User from '$lib/assets/user.png';

    let results=[];

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
              console.log(data)
                return data
            })
        }
        catch(err){
            console.log(err)
        } 
    }
    function formatText(text) {
        // Replace newlines with <br>
        let formattedText = text.replace(/\n/g, '<br>');
        
        // Replace URLs with [Here] link
        const urlPattern = /(http[s]?:\/\/[^\s]*)/g;
        formattedText = formattedText.replace(urlPattern, '<a href="$1" target="_blank">[Link]</a>');

        return formattedText;
    }
    export let messages = [new AIChatMessage("Hi! I am Solai. I have access to a wide variety of Solana Github Repositories, is there anything I can find for you?")];
    
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
        const returnedData = await getMessage(messages);
        const response = new AIChatMessage(returnedData);
        messages = [...messages, response];
        console.log(messages)
    }
</script>
<div class="search">
  <div class="chatbox" >
    <div class="messageContainer"bind:this={chatboxRef}>
      {#each messages as message}
        <div class="message" class:user={message instanceof AIChatMessage}>
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
  </div>
  <div class="resultsBox">
    {#each results as result}
      <div class = "results">
        <a href={result.url} target="_blank">{result.name}</a>
      </div>
    {/each}
    
  </div>
</div>
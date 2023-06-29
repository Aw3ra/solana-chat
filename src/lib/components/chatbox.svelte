<script lang="ts">
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";
    import { dataset_dev } from 'svelte/internal';
    let file;
    
    let chatboxRef;
    async function handleFileUpload(event)
    {
      {
        file = event.target.files[0];
        console.log(file);
      }

        try{return await fetch('/api/pinecone-uploading',
            {
                method: 'POST', headers: {'Content-Type': 'application/pdf'},
                body: file
            })
            // API returns a json object with the response
            .then(response => response.json())
            .then(data => {
              console.log(data.text)
                return data

            })
        }
        catch(err){
            console.log(err)
        } 
    }
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
    export let messages = [new AIChatMessage("Hello, I am Vline AI. I am here to help you with your questions.")];
    
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
<style>
    .message {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: #6b2898;
      /* Make it bold */
      font-weight: bold;
    }
  
    .message .content {
        padding: 10px;
        border-radius: 10px;
        background-color: #f1f1f1;
        border: 1px solid #ddd;
        /* Set the max width to be the width of the chatbox minus the width of the author */
        max-width: calc(100% - 120px);
        font-size: 14px; 
        text-align: left;
    }
  
    .message .author {
        margin: 10px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        font-weight: bold;
        border: 1px solid #753f98;
        border-radius: 15px;
        padding: 5px;
        background-color: white;
        justify-content: flex-end;

    }

    .message.user {
      justify-content: flex-start;
    }
    .messageContainer{
      overflow-y: auto;
    }
    .messageContainer::-webkit-scrollbar {
      width: 10px;  /* Adjust width as needed */
    }
    .chatboxEnter{
      color: black;
    }
  </style>
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
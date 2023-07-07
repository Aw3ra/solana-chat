<script lang="ts">
    import { Document } from 'langchain/document';
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";
    import Robot from '$lib/assets/robot.png';
    import User from '$lib/assets/user.png';
    import { fade } from 'svelte/transition';
    import { linear } from 'svelte/easing';
    import Githubadd from './githubadd.svelte';

    let displayedResults=[
      new Document({
        pageContent: "blahblahblah",
        metadata: {
          Projectname: "Solana",
          url: "https://docs.solana.com/",
          author: "The foundation"
        }
      })
    ];

    let chatboxRef;
    async function getResults(messages)
    {
        try{return await fetch('/api/pineconeRoute',
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

    async function getMessage (messages)
    {
      displayedResults = [];
      const results = await getResults(messages);
        try{
          return await fetch('/api/openAIRoute',
            {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"messages": messages, "query": results[0]})
            })
            // API returns a json object with the response
            .then(response => response.json())
            .then(data => {
              // DIsplayed results is an array of objects from results, excluding the first one
              displayedResults = results.slice(1);
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
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
        messages = [...messages, new HumanChatMessage(message), new AIChatMessage("Let me see what I can find...")];
        // For each message in messages, add to the chatModel.call to continue conversartion
        const returnedData = await getMessage(messages);
        const response = new AIChatMessage(returnedData);
        // Remove the last message from the chatModel
        messages.pop();
        // Have the message typed out in
        messages = [...messages, response];
    }
</script>
<div class="search">
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
  <div class="resultsBox">
    <div class= "Heading text-black text-3xl"><strong></strong>Similar results</div>
    {#each displayedResults as result, index (result)}
    <a
      class="results text-black no-underline"
      href={result.metadata.url}
      target="_blank"
      out:fade={{ duration: 1000, easing: linear }}
      in:fade={{ delay: index * 400, duration: 1000, easing: linear }}
      
    >
      <div class="ProjectName">
        <strong>{capitalizeFirstLetter(result.metadata.Projectname)}</strong> by <strong>{capitalizeFirstLetter(result.metadata.author)}</strong>
      </div>
    </a>
    {/each}
  
    <!-- Add submission box for github URLs to be submitted, needs to always be at the bottom -->
    <div class = "githubadd">
      <Githubadd />
    </div>
  </div>
</div>
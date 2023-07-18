<script lang="ts">
    import { Document } from 'langchain/document';
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";
    import Robot from '$lib/assets/robot.png';
    import User from '$lib/assets/user.png';
    import { fade } from 'svelte/transition';
    import { linear } from 'svelte/easing';
    import Githubadd from './githubadd.svelte';
    import {getResultsCount, getMessage} from '$lib/utils/serverCalls';
    import {formatText, capitalizeFirstLetter} from '$lib/utils/textFormatting';

    export let namespace;
    let heading = 'documents loaded from {DEFAULT} repo';
    let firstMesage="";
    // If the namespace is not defined, set it to solana and set the heading to be "Solana repositories"
    if (namespace === 'solana') {
        heading = 'Solana repositories'
        firstMesage = "Hi! I am Solai. I have access to a wide variety of Solana Github Repositories, is there anything I can find for you?"
    }
    else{
      firstMesage = "Hi! I am Solai. I currently have access to information about "+namespace+", is there anything I can help you with?"
    }
    let displayedResults=[{metadata:{
      Projectname: "Solana",
      url: "https://google.com",
      author: "Solana",
      count: 0
    }}];
    let chatResultsCount = []
    let repoCount = 0;
    let chatboxRef;
    export let messages = [new AIChatMessage(firstMesage)];
    
    afterUpdate(() => {
        scrollChatboxToBottom();
    });
    // On mount load the results count
    onMount(async() => {
        repoCount = await getResultsCount(namespace);
    });
    function scrollChatboxToBottom() {
        chatboxRef.scrollTop = chatboxRef.scrollHeight;
    }

    async function getCount(namespace){
        const count = await getResultsCount(namespace);
        return count !== 0;
    }

    //   Create chat model
    async function addMessage(message) {
        displayedResults = [];
        messages = [...messages, new HumanChatMessage(message), new AIChatMessage("Let me see what I can find...")];
        // For each message in messages, add to the chatModel.call to continue conversartion
        const returnedData = await getMessage(messages, namespace);
        displayedResults = returnedData[1];
        const response = new AIChatMessage(returnedData[0]);
        // Remove the last message from the chatModel
        messages.pop();
        // Have the message typed out in
        messages = [...messages, response];
        await addCount();
    }

    // Function to add the getCount as metadata to the displayed results, even if the metadata.count does not exist
    async function addCount(){
      for (let i = 0; i < displayedResults.length; i++) {
        chatResultsCount[i] = await getCount(displayedResults[i].metadata.author+"/"+displayedResults[i].metadata.Projectname);
      }
    }
</script>
<h1 class="text-4xl font-bold text-left text-black">Solana AI Chat</h1>
  <h1 class="text-xl text-left text-black px-2">
    Search from <strong>{repoCount}</strong> {@html heading.replace('{DEFAULT}', `<strong><u>${capitalizeFirstLetter(namespace)}</u></strong>`)}</h1>
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
    <!-- A div to hold 2 link buttons side by side in a grid -->
    <div class ="grid grid-cols-4 gap-4">
      <a
        class="results text-black no-underline col-span-3"
        href={result.metadata.url}
        out:fade={{ duration: 1000, easing: linear }}
        in:fade={{ delay: index * 400, duration: 1000, easing: linear }}
        target="_blank"
      >
      <!--        -->
        <div class="ProjectName">
          <strong>{capitalizeFirstLetter(result.metadata.Projectname)}</strong> by <strong>{capitalizeFirstLetter(result.metadata.author)}</strong>
        </div>
      </a>
      {#if chatResultsCount[index]}
        <a
        class="results text-black no-underline col-span-1/2"

        href={"individualChat?project="+result.metadata.Projectname+"&author="+result.metadata.author}
        out:fade={{ duration: 1000, easing: linear }}
        in:fade={{ delay: index * 400, duration: 1000, easing: linear }}
        target="_blank"
        >
        <div class="ProjectName text-red">
          <strong>Chat</strong>
        </div>
      </a>
      {/if}
  </div> 
    {/each}
    
    <!-- Add submission box for github URLs to be submitted, needs to always be at the bottom -->
    <div class = "githubadd">
      <Githubadd />
    </div>
  </div>
</div>
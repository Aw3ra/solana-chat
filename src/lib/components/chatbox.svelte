<script lang="ts">
    import { afterUpdate, onMount } from 'svelte';
    import { HumanChatMessage, AIChatMessage } from "langchain/schema";
    import Robot from '$lib/assets/svgs/robot.svg';
    import User from '$lib/assets/svgs/user.svg';
    import Githubadd from './githubadd.svelte';
    import SolanaResults from './results/solanaResults.svelte';
    import RepoResults from './results/repoResults.svelte';
    import {getResultsCount, getMessage} from '$lib/utils/serverCalls';
    import {formatText, capitalizeFirstLetter, splitByCodeBlocks} from '$lib/utils/textFormatting';
    import { titles } from '$lib/utils/prompts';
  
    export let namespace;
    let heading = titles(namespace).heading;
    let firstMesage= titles(namespace).firstMesage;

    export let messages = [new AIChatMessage(firstMesage)];
    let displayedResults = [];
    let chatResultsCount = []
    let repoCount = 0;
    let chatboxRef;
    let fullText = '';
    let message = '';
    let i =0;
    

    // Function to get the most recent message to type out character by character
    let isTypingDone = false;

    const startTyping = (pieces) => {
    let fullPieces = pieces;
    message = '';
    i = 0;
    let pieceIdx = 0;
    isTypingDone = false;
    const intervalId = setInterval(() => {
        if (pieceIdx < fullPieces.length) {
            let piece = fullPieces[pieceIdx];
            if (piece.type === 'text') {
                // Type out the text
                if (i < piece.content.length) {
                    message += piece.content[i];
                    i++;
                } else {
                    // Finished with this piece, move to the next one
                    i = 0;
                    pieceIdx++;
                }
            } else if (piece.type === 'code') {
                // For code, add it as is
                message += '```' + piece.content + '```';
                // Move to the next piece
                i = 0;
                pieceIdx++;
            }
        } else {
            clearInterval(intervalId);
            isTypingDone = true;
        }
    }, 10);
}

    $: if (messages.length > 0) {
        startTyping(splitByCodeBlocks(messages[messages.length - 1].text));
    }



    afterUpdate(() => {scrollChatboxToBottom();});
    // On mount load the results count
    onMount(async() => {
      if (messages.length > 0) {
            console.log(messages[messages.length - 1].text);
            console.log(splitByCodeBlocks(messages[messages.length - 1].text)[0].content);
            startTyping(splitByCodeBlocks(messages[messages.length - 1].text)[0].content);
        }
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
        console.log(chatResultsCount);
    }

    // Function to add the getCount as metadata to the displayed results, even if the metadata.count does not exist
    async function addCount(){
      for (let i = 0; i < displayedResults.length; i++) {
        chatResultsCount[i] = await getCount(displayedResults[i].metadata.author+"/"+displayedResults[i].metadata.Projectname);
      }
    }
</script>

<div class = "mx-10">
  <h1 class="text-4xl font-bold text-left text-black">Solanoid Chat</h1>
  <h1 class="text-xl text-left text-black px-2">
    Search from <strong>{repoCount}</strong> {@html heading.replace('{DEFAULT}', `<strong><u>${capitalizeFirstLetter(namespace)}</u></strong>`)}</h1>
  <div class="search">
    <div class="chatbox" >
      <div class="messageContainer"bind:this={chatboxRef}>
        {#each messages as msg, index (index)}
    <div class="message" class:user={msg instanceof AIChatMessage}>
        {#if msg instanceof AIChatMessage && msg.text !==""}
            <span class="author">
                <img alt="Solana AI" src={Robot} />
            </span>
              <span class="content ai">{@html msg === messages[messages.length - 1] ? (isTypingDone ? message : message) : msg.text}</span>
        {:else}
            <span class="content">{msg.text}</span>
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
    <div class="leftPanel"> 
             <div class= "Heading text-black text-3xl"><strong></strong>Results</div>
      <div class="resultsBox">

        {#if namespace== "solana"}
          <SolanaResults results = {displayedResults} resultsCount = {chatResultsCount}/>
        {:else}
          <RepoResults results = {displayedResults} resultsCount = {chatResultsCount}/>
        {/if}
        
        <!-- Add submission box for github URLs to be submitted, needs to always be at the bottom -->

      </div>      <div class = "githubadd">
          <Githubadd namespace = {namespace} />
        </div>
    </div>

  </div>
</div>

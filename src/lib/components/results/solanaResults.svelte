<script>
    /**
     * @type {any}
     */
     export let results;
    /**
     * @type {any[]}
     */
     export let resultsCount = []
    import { fade } from 'svelte/transition';
    import { linear } from 'svelte/easing';
    import {capitalizeFirstLetter} from '$lib/utils/textFormatting';  
</script>

{#each results as result, index (result)}
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
        <strong>{capitalizeFirstLetter(result.metadata.author)}</strong> / {result.metadata.Projectname}
      </div>
    </a>
    {#if resultsCount[index]}
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
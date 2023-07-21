<script>
    /**
     * @type {any}
     */
     export let results;
    import { fade } from 'svelte/transition';
    import { linear } from 'svelte/easing';
    import {capitalizeFirstLetter} from '$lib/utils/textFormatting';  
</script>

{#each results as result, index (result)}
<!-- A div to hold 2 link buttons side by side in a grid -->

  <div class ="grid grid-cols-4 gap-4">
    <a
      class="results text-black no-underline col-span-4"
      href={result.metadata.url}
      out:fade={{ duration: 1000, easing: linear }}
      in:fade={{ delay: index * 400, duration: 1000, easing: linear }}
      target="_blank"
    >
    <!--        -->
      <div class="ProjectName">
        <strong>{capitalizeFirstLetter(result.metadata.filename)}</strong>
      </div>
    </a>
  </div> 
{/each}
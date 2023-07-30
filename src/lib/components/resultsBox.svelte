<script>
    import { fade } from 'svelte/transition';
    import { linear } from 'svelte/easing';
    import Githubadd from './githubadd.svelte';

    export let displayedResults;

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
</script>




<div class="resultsBox">
    <div class= "Heading text-black text-3xl"><strong></strong>Similar results</div>
    {#each displayedResults as result, index (result)}
    <a
      class="results text-black no-underline"
      href={"individualChat?project="+result.metadata.Projectname+"&author="+result.metadata.author}
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

  </div> 
  <div class = "githubadd">
    <Githubadd />
  </div>
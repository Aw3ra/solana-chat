<script>
  import Chatbox from '$lib/components/chatbox.svelte';
  // Log the url of this page
  import { page } from '$app/stores'

  let namespace = $page.url.searchParams.get('author') +'/'+ $page.url.searchParams.get('project')

</script>

<div class="my-auto mx-auto max-w-7xl py-5">
  <!-- A heading for the chatbox -->
  <Chatbox namespace={namespace} />
  
</div>

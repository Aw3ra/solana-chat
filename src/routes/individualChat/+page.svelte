<script>
  import Chatbox from '$lib/components/chatbox.svelte';
  // Log the url of this page
  import { page } from '$app/stores'

  let namespace = $page.url.searchParams.get('author') +'/'+ $page.url.searchParams.get('project')

</script>

<div class="mx-auto max-w-4xl py-5">
  <!-- A heading for the chatbox -->
  <Chatbox namespace={namespace} />
  
</div>

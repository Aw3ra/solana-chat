<script>
    import Chatbox from '../lib/components/chatbox.svelte';
    import {checkPinecone} from '../lib/utils/serverCalls';
    let namespace = 'solana';
    let query = "testing"

</script>

<div class="mx-auto max-w-4xl py-5">
    <!-- A heading for the chatbox -->
    <Chatbox namespace= {namespace}/>
</div>

<script>
    import { addFullGithubRepo, addReadmeGithubRepo } from "$lib/utils/serverCalls";

    let url = "";
    let inputVal = "";
    export let namespace=''
    let buttonDisabled = false;
    async function addGithubURL(){
        buttonDisabled = true;
        url = inputVal;
        inputVal = 'Uploading full repo...';
        // Hit the githubROute apit on the server
        await addFullGithubRepo(url, namespace);
        
        // Wait for 3 seconds
        await new Promise(r => setTimeout(r, 3000));
        inputVal = '';
        buttonDisabled = false;
    }
    async function addReadMe(){
        buttonDisabled = true;
        url = inputVal;
        inputVal = 'Uploading readme...';
        // Hit the githubROute apit on the server
        const response = await addReadmeGithubRepo(url, namespace);
        inputVal = response;
        await new Promise(r => setTimeout(r, 3000));
        inputVal = '';
        buttonDisabled = false;
        // Do nothing for now
    }
</script>

<!-- Entry box for github URLs -->
<div>Submit your git</div>
<input 
    class="githubaddEnter"
    bind:value={inputVal}
    placeholder="Enter your Github URL"
/>

<!-- Submit button, add enabled true so we can turn it off while we wait -->
<div class = "grid grid-cols-2 gap-5">
    <div class = "span-cols-1">
        <button 
            class="githubaddSubmit"
            on:click={addReadMe}
            disabled={buttonDisabled}>
            Readme
        </button>
    </div>
    <div class = "span-cols-1">
        <button 
            class="githubaddSubmit"
            on:click={addGithubURL}
            disabled={buttonDisabled}>
            Full repo
        </button>
    </div>




</div>





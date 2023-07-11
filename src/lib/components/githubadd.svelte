<script>
    let url = "";
    let inputVal = "";
    let buttonDisabled = false;
    async function addGithubURL(){
        buttonDisabled = true;
        // Hit the githubROute apit on the server
        try{
            url = inputVal;
            inputVal = "Checking github...."
            await fetch('/api/githubRoute',
                {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({url})
                })
                // API returns a json object with the response
                .then(response => response.json())
                .then(data => {
                    inputVal = data.status;
                })
        }
        catch(err){
            console.log(err)
        }
        
        // Wait for 3 seconds
        await new Promise(r => setTimeout(r, 3000));
        inputVal = '';
        buttonDisabled = false;
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
<button 
    class="githubaddSubmit"
    on:click={addGithubURL}
    disabled={buttonDisabled}>
    Submit
</button>


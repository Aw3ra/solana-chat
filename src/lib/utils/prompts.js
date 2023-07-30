const botName = "Solanoid"

export function titles (namespace){
    let heading = 'documents loaded from {DEFAULT} repo'
    let firstMesage = "Hi! I am "+botName+". I currently have access to information about "+namespace+", is there anything I can help you with?"
    if (namespace === 'solana') {
        heading = 'Solana repositories'
        firstMesage = "Hi! I am "+botName+". I have access to a wide variety of Solana Github Repositories, is there anything I can find for you?"
    }
    return {
        heading: heading,
        firstMesage: firstMesage
    }
}
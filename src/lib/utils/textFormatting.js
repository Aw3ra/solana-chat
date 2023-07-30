

/**
 * @param {string} text
 */
export function formatText(text) {
    // Replace newlines with <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Replace URLs with [Here] link
    const urlPattern = /(http[s]?:\/\/[^\s]*)/g;
    formattedText = formattedText.replace(urlPattern, '<a href="$1" target="_blank">[Link]</a>');

    // After replacing URLs, replace sections between triple back ticks with code blocks
    const codePattern = /```([^`]+)```/g;
    formattedText = formattedText.replace(codePattern, '<pre><code>$1</code></pre>');
    

    return formattedText;
}
/**
 * @param {string} string
 */
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function escapeHTML(html) {
    const escapeChars = {
        '"': '&quot;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
    };
    return html.replace(/[&<>"']/g, m => escapeChars[m]);
}
export function splitByCodeBlocks(text) {
    const codePattern = /```([^`]+)```/g;
    const pieces = [];
    let match;
    let lastIdx = 0;
    while ((match = codePattern.exec(text)) !== null) {
        if (lastIdx !== match.index) {
            // There's text before this match, add it
            pieces.push({type: 'text', content: text.slice(lastIdx, match.index)});
        }
        // Add the code with the appropriate HTML tags and escape the HTML inside
        pieces.push({type: 'code', content: '<pre><code>' + escapeHTML(match[1]) + '</code></pre>'});
        lastIdx = match.index + match[0].length;
    }
    if (lastIdx !== text.length) {
        // There's text after the last match, add it
        pieces.push({type: 'text', content: text.slice(lastIdx)});
    }
    return pieces;
}

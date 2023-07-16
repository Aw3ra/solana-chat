

/**
 * @param {string} text
 */
export function formatText(text) {
    // Replace newlines with <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Replace URLs with [Here] link
    const urlPattern = /(http[s]?:\/\/[^\s]*)/g;
    formattedText = formattedText.replace(urlPattern, '<a href="$1" target="_blank">[Link]</a>');

    return formattedText;
}
/**
 * @param {string} string
 */
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
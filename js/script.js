document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const emotionFilter = document.getElementById('emotionFilter');
    const emojiContainer = document.getElementById('emojiContainer');
    const emojiDescription = document.getElementById('emojiDescription');

    if (!filterInput || !emotionFilter || !emojiContainer || !emojiDescription) {
        console.error('One or more HTML elements are missing');
        return;
    }

    let emojis = []; // This will hold your emoji data

    /**
     * Debounce function to limit the rate at which a function can be invoked.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The number of milliseconds to wait before calling the function.
     * @returns {Function} A debounced version of the provided function.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Fetches the emoji data from a JSON file and displays them.
     */
    fetch('./data/NmojiList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(NmojiList => {
            emojis = NmojiList; // Store the fetched emojis
            console.log('Fetched emojis:', emojis);
            displayEmojis(emojis); // Initial display of emojis
            filterInput.addEventListener('input', debounce(filterEmojis, 300));
            emotionFilter.addEventListener('change', filterEmojis);
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    /**
     * Creates and displays emoji elements in the container.
     * @param {Array} filteredEmojis - Array of emoji objects to display.
     */
    function displayEmojis(filteredEmojis) {
        emojiContainer.innerHTML = ''; // Clear existing emojis
        filteredEmojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.classList.add('emoji');
            emojiElement.textContent = emoji.emoji;
            emojiElement.title = `${emoji.description} - Category: ${emoji.category}`;
            emojiElement.addEventListener('click', () => {
                copyToClipboard(emoji.emoji, emojiElement);
                updateDescription(emoji);
            });
            emojiContainer.appendChild(emojiElement);
        });
    }

    /**
     * Filters emojis based on the input value and emotion selection.
     */
    function filterEmojis() {
        const filterText = filterInput.value.toLowerCase();
        const selectedEmotion = emotionFilter.value.toLowerCase();

        console.log('Filter Text:', filterText);
        console.log('Selected Emotion:', selectedEmotion);

        const filteredEmojis = emojis.filter(emoji => {
            const matchesText = emoji.description.toLowerCase().includes(filterText);
            const matchesEmotion = selectedEmotion ? (emoji.tags && emoji.tags.includes(selectedEmotion)) : true;
            console.log(`Emoji: ${emoji.description}, Matches Text: ${matchesText}, Matches Emotion: ${matchesEmotion}`);
            return matchesText && matchesEmotion;
        });

        console.log('Filtered Emojis:', filteredEmojis);
        displayEmojis(filteredEmojis);
    }

    /**
     * Copies the given text to the clipboard and adds a visual effect to the element.
     * @param {string} text - The text to copy to the clipboard.
     * @param {HTMLElement} element - The element to apply the visual effect to.
     */
    function copyToClipboard(text, element) {
        element.classList.add('clicked'); // Add the class to trigger the animation

        if (navigator.clipboard) { // Modern async clipboard API
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard');
                setTimeout(() => {
                    element.classList.remove('clicked'); // Remove the class after the animation
                }, 750); // Match the duration of the CSS transition
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else { // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                const msg = successful ? 'successful' : 'unsuccessful';
                console.log('Fallback: Copying text command was ' + msg);
                setTimeout(() => {
                    element.classList.remove('clicked'); // Remove the class after the animation
                }, 750); // Match the duration of the CSS transition
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * Updates the description area with details of the selected emoji.
     * @param {Object} emoji - The emoji object containing details.
     */
    function updateDescription(emoji) {
        emojiDescription.innerHTML =
            `
            <div class="selected-emoji">${emoji.emoji}</div>
            <div class="emoji-title">${emoji.description}</div>
            <div class="emoji-category">Category: ${emoji.category}</div>
            <div class="emoji-tags">Tags: #${emoji.tags ? emoji.tags.join(', #') : 'None'}</div>
        `;
    }
});

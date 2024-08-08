document.addEventListener('DOMContentLoaded', () => {
    // Select the necessary DOM elements for filtering and displaying emojis
    const filterInput = document.getElementById('filterInput'); // Input field for text-based filtering
    const categoryFilter = document.getElementById('categoryFilter'); // Dropdown filter for emoji categories
    const tagFilter = document.getElementById('tagFilter'); // Dropdown filter for emoji tags
    const aliasFilter = document.getElementById('aliasFilter'); // Dropdown filter for emoji aliases
    const emojiContainer = document.getElementById('emojiContainer'); // Container to display the emojis
    const emojiDescription = document.getElementById('emojiDescription'); // Area to display selected emoji details
    
    let emojiData = []; // To store fetched emoji data

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
     * Fetches the emoji data from a JSON file and initializes filters.
     */
    fetch('./data/NmojiList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(NmojiList => {
            emojiData = NmojiList; // Store the fetched emoji data
            displayEmojis(emojiData); // Display all emojis initially
            populateFilterOptions(); // Populate dropdown filters with unique tags and aliases

            // Attach debounced filter function to the input and dropdown events
            filterInput.addEventListener('input', debounce(applyFilters, 300));
            categoryFilter.addEventListener('change', applyFilters);
            tagFilter.addEventListener('change', applyFilters);
            aliasFilter.addEventListener('change', applyFilters);
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    /**
     * Populates the tag and alias dropdown filters with unique values.
     */
    function populateFilterOptions() {
        const uniqueTags = new Set();
        const uniqueAliases = new Set();

        emojiData.forEach(emoji => {
            if (emoji.tags) {
                emoji.tags.forEach(tag => uniqueTags.add(tag));
            }
            if (emoji.aliases) {
                emoji.aliases.forEach(alias => uniqueAliases.add(alias));
            }
        });

        // Populate tagFilter dropdown
        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.toLowerCase();
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        // Populate aliasFilter dropdown
        uniqueAliases.forEach(alias => {
            const option = document.createElement('option');
            option.value = alias.toLowerCase();
            option.textContent = alias;
            aliasFilter.appendChild(option);
        });
    }

    /**
     * Creates and displays emoji elements in the container.
     * @param {Array} emojis - Array of emoji objects to display.
     */
    function displayEmojis(emojis) {
        emojiContainer.innerHTML = ''; // Clear existing emojis
        emojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.classList.add('emoji');
            emojiElement.textContent = emoji.emoji;
            emojiElement.title = `${emoji.description} - Category: ${emoji.category}`;
            emojiElement.addEventListener('click', () => {
                copyToClipboard(emoji.emoji, emojiElement); // Copy emoji to clipboard on click
                updateDescription(emoji); // Update description with the selected emoji details
            });
            emojiContainer.appendChild(emojiElement);
        });
    }

    /**
     * Applies filters based on the input value, category, tag, and alias, and updates the displayed emojis.
     */
    function applyFilters() {
        const filterValue = filterInput.value.toLowerCase(); // Get the input value for text-based filtering
        const selectedCategory = categoryFilter.value.toLowerCase(); // Get selected category from dropdown
        const selectedTag = tagFilter.value.toLowerCase(); // Get selected tag from dropdown
        const selectedAlias = aliasFilter.value.toLowerCase(); // Get selected alias from dropdown
        
        // Filter the emojis based on input, category, tag, and alias
        const filteredEmojis = emojiData.filter(emoji =>
            (emoji.emoji.toLowerCase().includes(filterValue) ||
            emoji.description.toLowerCase().includes(filterValue) ||
            emoji.category.toLowerCase().includes(filterValue) ||
            (emoji.aliases && emoji.aliases.some(alias => alias.toLowerCase().includes(filterValue))))
            && (selectedCategory === '' || emoji.category.toLowerCase() === selectedCategory)
            && (selectedTag === '' || (emoji.tags && emoji.tags.includes(selectedTag)))
            && (selectedAlias === '' || (emoji.aliases && emoji.aliases.includes(selectedAlias)))
        );
        displayEmojis(filteredEmojis); // Display the filtered emojis
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
            const tempInput = document.createElement('input');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select(); // Select the text
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    console.log('Fallback: Text copied to clipboard');
                } else {
                    console.error('Fallback: Failed to copy text');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(tempInput);
            
            setTimeout(() => {
                element.classList.remove('clicked'); // Remove the class after the animation
            }, 750); // Match the duration of the CSS transition
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

document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const emojiContainer = document.getElementById('emojiContainer');
    const suggestionContainer = document.createElement('div');
    suggestionContainer.classList.add('suggestion-container');
    document.body.appendChild(suggestionContainer);

    fetch('./data/NmojiList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(NmojiList => {
            displayEmojis(NmojiList);
            let debounceTimeout;
            filterInput.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    updateSuggestions(NmojiList);
                    filterEmojis(NmojiList);
                }, 300);
            });
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
            emojiContainer.innerHTML = '<p>Error loading emojis. Please try again later.</p>';
        });

    function displayEmojis(emojis) {
        emojiContainer.innerHTML = '';
        if (emojis.length === 0) {
            emojiContainer.innerHTML = '<p>No emojis found.</p>';
            return;
        }
        emojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.classList.add('emoji');
            emojiElement.innerHTML = emoji.emoji; // Update to use innerHTML
            emojiElement.title = `${emoji.description} - Category: ${emoji.category}`;
            emojiElement.addEventListener('click', () => copyToClipboard(emoji.emoji));
            emojiContainer.appendChild(emojiElement);
        });
    }

    function filterEmojis(NmojiList) {
        const filterValue = filterInput.value.trim().toLowerCase();
        if (!filterValue) {
            displayEmojis(NmojiList);
            return;
        }
        const filteredEmojis = NmojiList.filter(emoji =>
            emoji.emoji.toLowerCase().includes(filterValue) ||
            emoji.description.toLowerCase().includes(filterValue) ||
            emoji.category.toLowerCase().includes(filterValue) ||
            emoji.tags.some(tag => tag.toLowerCase().includes(filterValue))
        );

        displayEmojis(filteredEmojis.map(emoji => highlightMatchingText(emoji, filterValue)));
    }

    function updateSuggestions(NmojiList) {
        const filterValue = filterInput.value.trim().toLowerCase();
        if (!filterValue) {
            suggestionContainer.innerHTML = '';
            return;
        }
        const suggestions = new Set();

        NmojiList.forEach(emoji => {
            if (emoji.description.toLowerCase().startsWith(filterValue)) {
                suggestions.add(emoji.description);
            }
            if (emoji.category.toLowerCase().startsWith(filterValue)) {
                suggestions.add(emoji.category);
            }
            emoji.tags.forEach(tag => {
                if (tag.toLowerCase().startsWith(filterValue)) {
                    suggestions.add(tag);
                }
            });
        });

        displaySuggestions(Array.from(suggestions));
    }

    function displaySuggestions(suggestions) {
        suggestionContainer.innerHTML = '';
        if (suggestions.length === 0) {
            return;
        }
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion');
            suggestionElement.textContent = suggestion;
            suggestionElement.addEventListener('click', () => {
                filterInput.value = suggestion;
                suggestionContainer.innerHTML = '';
                filterInput.dispatchEvent(new Event('input')); // Trigger filter
            });
            suggestionContainer.appendChild(suggestionElement);
        });
    }

    function highlightMatchingText(emoji, filterValue) {
        const highlight = (text) => {
            return text.replace(new RegExp(`(${filterValue})`, 'gi'), '<mark>$1</mark>');
        };

        return {
            ...emoji,
            emoji: highlight(emoji.emoji),
            description: highlight(emoji.description),
            category: highlight(emoji.category),
            tags: emoji.tags.map(tag => highlight(tag))
        };
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert(`Copied: ${text}`);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
});

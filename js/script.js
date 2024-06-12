document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const emojiContainer = document.getElementById('emojiContainer');

    fetch('./data/NmojiList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(NmojiList => {
            displayEmojis(NmojiList);
            filterInput.addEventListener('input', () => filterEmojis(NmojiList));
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    function displayEmojis(emojis) {
        emojiContainer.innerHTML = '';
        emojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.classList.add('emoji');
            emojiElement.textContent = emoji.emoji;
            emojiElement.title = `${emoji.description} - Category: ${emoji.category}`;
            emojiElement.addEventListener('click', () => copyToClipboard(emoji.emoji));
            emojiContainer.appendChild(emojiElement);
        });
    }

    function filterEmojis(NmojiList) {
        const filterValue = filterInput.value.toLowerCase();
        const filteredEmojis = NmojiList.filter(emoji =>
            emoji.emoji.toLowerCase().includes(filterValue) ||
            emoji.description.toLowerCase().includes(filterValue) ||
            emoji.category.toLowerCase().includes(filterValue) ||
            emoji.tags.some(tag => tag.toLowerCase().includes(filterValue))
        );
        displayEmojis(filteredEmojis);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert(`Copied: ${text}`);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
});

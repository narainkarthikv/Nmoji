document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const tagFilter = document.getElementById('tagFilter');
    const aliasFilter = document.getElementById('aliasFilter');
    const emojiContainer = document.getElementById('emojiContainer');
    const emojiDescription = document.getElementById('emojiDescription');

    let emojiData = [];

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.textContent = '🌜';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '🌞';
            localStorage.setItem('theme', 'light');
        }
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '🌜';
    } else {
        themeIcon.textContent = '🌞';
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Fetches and caches emoji data for faster access.
     */
    async function fetchEmojiData() {
        const cachedData = localStorage.getItem('emojiData');
        if (cachedData) {
            emojiData = JSON.parse(cachedData);
            displayEmojis(emojiData);
            populateFilterOptions();
        } else {
            try {
                const response = await fetch('./data/NmojiList.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const NmojiList = await response.json();
                emojiData = NmojiList;
                localStorage.setItem('emojiData', JSON.stringify(NmojiList)); // Cache the data
                displayEmojis(emojiData);
                populateFilterOptions();
            } catch (error) {
                console.error('Error fetching the JSON data:', error);
            }
        }
    }

    /**
     * Lazy loading implementation with IntersectionObserver.
     */
    function lazyLoadEmojis() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const emojiElement = entry.target;
                    emojiElement.classList.add('visible'); // Animation class
                    observer.unobserve(emojiElement); // Stop observing once it's visible
                }
            });
        }, { threshold: 0.1 });

        const emojiElements = document.querySelectorAll('.emoji');
        emojiElements.forEach(emoji => observer.observe(emoji));
    }

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

        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.toLowerCase();
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        uniqueAliases.forEach(alias => {
            const option = document.createElement('option');
            option.value = alias.toLowerCase();
            option.textContent = alias;
            aliasFilter.appendChild(option);
        });
    }

    /**
     * Display emojis with lazy loading.
     */
    function displayEmojis(emojis) {
        emojiContainer.innerHTML = '';
        emojis.slice(0, 30).forEach(emoji => {
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

        // Trigger lazy loading
        lazyLoadEmojis();
    }

    /**
     * Apply filters
     */
    function applyFilters() {
        const filterValue = filterInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value.toLowerCase();
        const selectedTag = tagFilter.value.toLowerCase();
        const selectedAlias = aliasFilter.value.toLowerCase();

        const filteredEmojis = emojiData.filter(emoji =>
            (emoji.emoji.toLowerCase().includes(filterValue) ||
            emoji.description.toLowerCase().includes(filterValue) ||
            emoji.category.toLowerCase().includes(filterValue) ||
            (emoji.aliases && emoji.aliases.some(alias => alias.toLowerCase().includes(filterValue))))
            && (selectedCategory === '' || emoji.category.toLowerCase() === selectedCategory)
            && (selectedTag === '' || (emoji.tags && emoji.tags.includes(selectedTag)))
            && (selectedAlias === '' || (emoji.aliases && emoji.aliases.includes(selectedAlias)))
        );
        displayEmojis(filteredEmojis);
    }

    /**
     * Copies emoji to clipboard
     */
    function copyToClipboard(text, element) {
        element.classList.add('clicked');

        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
            setTimeout(() => element.classList.remove('clicked'), 750);
        }).catch(err => console.error('Failed to copy text:', err));
    }

    /**
     * Updates description
     */
    function updateDescription(emoji) {
        emojiDescription.innerHTML =
            `<div class="selected-emoji">${emoji.emoji}</div>
            <div class="emoji-title">${emoji.description}</div>
            <div class="emoji-category">Category: ${emoji.category}</div>
            <div class="emoji-tags">Tags: #${emoji.tags ? emoji.tags.join(', #') : 'None'}</div>`;
    }

    fetchEmojiData();

    filterInput.addEventListener('input', debounce(applyFilters, 300));
    categoryFilter.addEventListener('change', applyFilters);
    tagFilter.addEventListener('change', applyFilters);
    aliasFilter.addEventListener('change', applyFilters);
});

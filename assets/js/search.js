/* ========================================
   Search Functionality
   ======================================== */

// Search index storage
let searchIndex = {
    messages: [],
    topics: [],
    actions: []
};

// Initialize search index
async function initSearchIndex() {
    try {
        // Load all data
        const [messages, topics, analytics] = await Promise.all([
            fetch('data/messages.json').then(r => r.ok ? r.json() : []),
            fetch('data/topics.json').then(r => r.ok ? r.json() : []),
            fetch('data/analytics.json').then(r => r.ok ? r.json() : [])
        ]);
        
        searchIndex.messages = messages;
        searchIndex.topics = topics;
        searchIndex.actions = analytics.actions || [];
    } catch (err) {
        console.log('Search index initialization failed, using fallback');
    }
}

// Full-text search
function search(query, filters = {}) {
    query = query.toLowerCase().trim();
    if (!query) return [];
    
    const results = {
        messages: [],
        topics: [],
        actions: []
    };
    
    // Search messages
    if (!filters.type || filters.type === 'messages') {
        results.messages = searchIndex.messages
            .filter(msg => 
                msg.content.toLowerCase().includes(query) ||
                msg.sender.toLowerCase().includes(query) ||
                (msg.topic && msg.topic.toLowerCase().includes(query))
            )
            .map(msg => ({
                type: 'message',
                id: msg.id,
                title: msg.sender,
                preview: truncate(msg.content, 120),
                url: `archive.html?date=${msg.date}&msg=${msg.id}`,
                data: msg,
                score: calculateRelevance(msg, query)
            }))
            .sort((a, b) => b.score - a.score);
    }
    
    // Search topics
    if (!filters.type || filters.type === 'topics') {
        results.topics = searchIndex.topics
            .filter(topic =>
                topic.name.toLowerCase().includes(query) ||
                topic.description.toLowerCase().includes(query) ||
                (topic.tags && topic.tags.some(t => t.toLowerCase().includes(query)))
            )
            .map(topic => ({
                type: 'topic',
                id: topic.id,
                title: topic.name,
                preview: topic.description,
                url: `topics.html#${topic.id}`,
                data: topic,
                score: calculateRelevance(topic, query)
            }))
            .sort((a, b) => b.score - a.score);
    }
    
    // Search actions
    if (!filters.type || filters.type === 'actions') {
        results.actions = searchIndex.actions
            .filter(action =>
                action.title.toLowerCase().includes(query) ||
                action.description.toLowerCase().includes(query)
            )
            .map(action => ({
                type: 'action',
                id: action.id,
                title: action.title,
                preview: action.status,
                url: `index.html#actions`,
                data: action,
                score: calculateRelevance(action, query)
            }))
            .sort((a, b) => b.score - a.score);
    }
    
    return results;
}

// Calculate relevance score
function calculateRelevance(item, query) {
    let score = 0;
    const queryWords = query.split(' ');
    
    // Title match (highest weight)
    if (item.title && item.title.toLowerCase().includes(query)) {
        score += item.title.toLowerCase() === query ? 100 : 50;
    }
    
    // Content match
    if (item.content && item.content.toLowerCase().includes(query)) {
        score += item.content.toLowerCase() === query ? 80 : 30;
    }
    
    // Description match
    if (item.description && item.description.toLowerCase().includes(query)) {
        score += item.description.toLowerCase() === query ? 60 : 20;
    }
    
    // Word-level scoring
    queryWords.forEach(word => {
        if (item.title && item.title.toLowerCase().includes(word)) score += 10;
        if (item.content && item.content.toLowerCase().includes(word)) score += 5;
        if (item.description && item.description.toLowerCase().includes(word)) score += 5;
    });
    
    // Tags match
    if (item.tags) {
        item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query)) score += 15;
        });
    }
    
    return score;
}

// Truncate text
function truncate(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
}

// Highlight search terms in text
function highlight(text, query) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', initSearchIndex);
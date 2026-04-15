/* ========================================
   Main JavaScript - Core Functionality
   ======================================== */

// Global state
const state = {
    currentPage: 'index',
    isMobileNavOpen: false,
    searchOpen: false,
    chatOpen: false,
    searchQuery: '',
    messages: [],
    topics: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initKeyboardShortcuts();
    initBackToTop();
    initScrollAnimations();
    initSearch();
    initChatModal();
    loadData();
});

// Navigation
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            state.isMobileNavOpen = !state.isMobileNavOpen;
            navLinks.classList.toggle('active', state.isMobileNavOpen);
        });
    }
    
    // Highlight active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case '/':
                e.preventDefault();
                openSearch();
                break;
            case 'c':
                e.preventDefault();
                openChatModal();
                break;
            case 'Escape':
                closeSearch();
                closeChatModal();
                break;
            case 'g':
                if (e.shiftKey) {
                    e.preventDefault();
                    scrollToTop();
                }
                break;
        }
    });
}

// Back to top button
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTop.title = 'Back to top (Shift+G)';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', scrollToTop);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll animations (Intersection Observer)
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stat-card, .topic-card, .status-column, .chart-card').forEach(el => {
        el.classList.add('page-enter');
        observer.observe(el);
    });
}

// Search functionality
function initSearch() {
    // Create search modal if doesn't exist
    if (!document.getElementById('searchModal')) {
        const searchModal = document.createElement('div');
        searchModal.id = 'searchModal';
        searchModal.className = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search messages, topics, actions..." autocomplete="off">
                    <button class="chat-close" onclick="closeSearch()"><i class="fas fa-times"></i></button>
                </div>
                <div class="search-results" id="searchResults"></div>
                <div class="search-hint">
                    <span><kbd>/</kbd> to search</span>
                    <span><kbd>Esc</kbd> to close</span>
                    <span><kbd>Enter</kbd> to select</span>
                </div>
            </div>
        `;
        document.body.appendChild(searchModal);
        
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', debounce(handleSearch, 200));
        searchInput.addEventListener('keydown', handleSearchKeydown);
        
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeSearch();
        });
    }
}

function openSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('searchInput').focus();
        state.searchOpen = true;
    }
}

function closeSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
        state.searchOpen = false;
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query) {
        resultsContainer.innerHTML = '<div class="search-no-results">Start typing to search...</div>';
        return;
    }
    
    const results = searchAll(query);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results found for "' + query + '"</div>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(r => `
        <div class="search-result-item" onclick="navigateTo('${r.url}')">
            <div class="search-result-title">${r.title}</div>
            <div class="search-result-preview">${r.preview}</div>
        </div>
    `).join('');
}

function handleSearchKeydown(e) {
    if (e.key === 'Escape') {
        closeSearch();
    }
}

function searchAll(query) {
    const results = [];
    
    // Search messages
    state.messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(query)) {
            results.push({
                title: msg.sender + ' - ' + formatDate(msg.timestamp),
                preview: msg.content.substring(0, 100) + '...',
                url: 'archive.html?date=' + msg.date
            });
        }
    });
    
    // Search topics
    const topicMatches = {
        'solana-trading-bot': { title: 'Solana Trading Bot', url: 'topics.html#solana-trading-bot' },
        'airdrop-farming': { title: 'Airdrop Farming', url: 'topics.html#airdrop-farming' },
        'lst-yield': { title: 'LST Yield Research', url: 'topics.html#lst-yield' },
        'polymarket': { title: 'Polymarket Analysis', url: 'topics.html#polymarket' },
        'business-ideas': { title: 'Business Ideas', url: 'topics.html#business-ideas' },
        'sub-agents': { title: 'Sub-Agents', url: 'topics.html#sub-agents' }
    };
    
    Object.entries(topicMatches).forEach(([key, val]) => {
        if (key.includes(query) || val.title.toLowerCase().includes(query)) {
            results.push({
                title: val.title,
                preview: 'Topic section',
                url: val.url
            });
        }
    });
    
    return results.slice(0, 10);
}

function navigateTo(url) {
    closeSearch();
    window.location.href = url;
}

// Chat modal
function initChatModal() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) closeChatModal();
        });
    }
}

function openChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.add('active');
        state.chatOpen = true;
        
        // Focus chat input if exists
        setTimeout(() => {
            const chatFrame = modal.querySelector('iframe');
            if (chatFrame) {
                const frameDoc = chatFrame.contentDocument || chatFrame.contentWindow.document;
                const chatInput = frameDoc.getElementById('chatInput');
                if (chatInput) chatInput.focus();
            }
        }, 100);
    }
}

function closeChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.remove('active');
        state.chatOpen = false;
    }
}

// Mobile nav toggle
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Load data from JSON files
async function loadData() {
    try {
        const [messagesRes, topicsRes] = await Promise.all([
            fetch('data/messages.json'),
            fetch('data/topics.json')
        ]);
        
        if (messagesRes.ok) {
            state.messages = await messagesRes.json();
        }
        if (topicsRes.ok) {
            state.topics = await topicsRes.json();
        }
    } catch (err) {
        console.log('Using sample data');
    }
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Debounce utility
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

// Copy link to clipboard
function copyLink(elementId) {
    const url = window.location.href + '#' + elementId;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied!');
    });
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 12px 24px;
        border-radius: var(--radius-md);
        font-size: 14px;
        z-index: 3000;
        animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Export functions to global scope
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.openChatModal = openChatModal;
window.closeChatModal = closeChatModal;
window.toggleMobileNav = toggleMobileNav;
window.navigateTo = navigateTo;
window.copyLink = copyLink;
window.showToast = showToast;
window.scrollToTop = scrollToTop;
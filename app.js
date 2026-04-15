/* ========================================
   JOURNAL — APP.JS
   Simple personal AI journal
   ======================================== */

// State
let entries = [];
let notes = [];
let actions = [
    { text: "Set up journal", done: true },
    { text: "Add first thought", done: false }
];

// Load from localStorage
function load() {
    const saved = localStorage.getItem('huda_journal');
    if (saved) {
        const data = JSON.parse(saved);
        entries = data.entries || [];
        notes = data.notes || [];
        actions = data.actions || actions;
    }
    render();
}

// Save to localStorage
function save() {
    localStorage.setItem('huda_journal', JSON.stringify({ entries, notes, actions }));
}

// Generate simple insight from entries
function generateInsight() {
    const insightEl = document.getElementById('todayInsight');
    
    if (entries.length === 0) {
        insightEl.textContent = "Add your first entry to get a personalized insight.";
        return;
    }
    
    const latest = entries[0];
    const wordCount = latest.text.split(/\s+/).length;
    
    if (wordCount > 50) {
        insightEl.textContent = `You've captured a detailed thought (${wordCount} words). Consider breaking it into smaller action items.`;
    } else if (latest.text.includes('?')) {
        insightEl.textContent = "You're asking good questions. Keep reflecting — answers often come later.";
    } else if (entries.length > 5) {
        insightEl.textContent = `You have ${entries.length} entries. Great consistency. Revisit older ones to see patterns.`;
    } else {
        insightEl.textContent = "Keep adding thoughts. Over time, patterns will emerge.";
    }
}

// Render everything
function render() {
    renderInsight();
    renderNotes();
    renderActions();
    renderArchive();
}

// Add new entry
function addEntry() {
    const input = document.getElementById('thoughtInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    entries.unshift({
        text,
        date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    });
    
    // Extract potential action items (lines starting with - or *)
    const actionMatches = text.match(/[-*]\s*(.+)/g);
    if (actionMatches && actions.length < 5) {
        actionMatches.slice(0, 3).forEach(match => {
            const actionText = match.replace(/^[-*]\s*/, '').trim();
            if (actionText && !actions.find(a => a.text === actionText)) {
                actions.push({ text: actionText, done: false });
            }
        });
    }
    
    input.value = '';
    save();
    render();
}

// Render insight
function renderInsight() {
    generateInsight();
}

// Render notes
function renderNotes() {
    const ul = document.getElementById('keyNotes');
    
    if (notes.length === 0) {
        ul.innerHTML = '<li class="empty">No notes yet. Start by adding an entry above.</li>';
        return;
    }
    
    ul.innerHTML = notes.map((note, i) => `
        <li>
            <span>${note}</span>
            <button onclick="removeNote(${i})" style="float: right; background: none; color: var(--text-muted); padding: 2px 6px; font-size: 12px;">×</button>
        </li>
    `).join('');
}

// Render actions
function renderActions() {
    const ul = document.getElementById('actionList');
    
    if (actions.length === 0) {
        ul.innerHTML = '<li class="empty">No actions yet.</li>';
        return;
    }
    
    ul.innerHTML = actions.map((action, i) => `
        <li class="action-item ${action.done ? 'done' : ''}">
            <input type="checkbox" ${action.done ? 'checked' : ''} onchange="toggleAction(${i})">
            <span>${action.text}</span>
        </li>
    `).join('');
}

// Render archive
function renderArchive() {
    const container = document.getElementById('archiveList');
    
    if (entries.length === 0) {
        container.innerHTML = '<p class="empty">No entries yet.</p>';
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="archive-item">
            <div class="archive-date">${entry.date}</div>
            <div class="archive-text">${entry.text.substring(0, 200)}${entry.text.length > 200 ? '...' : ''}</div>
        </div>
    `).join('');
}

// Toggle action done
function toggleAction(index) {
    actions[index].done = !actions[index].done;
    save();
    renderActions();
}

// Remove note
function removeNote(index) {
    notes.splice(index, 1);
    save();
    renderNotes();
}

// Add note manually
function addNote(text) {
    if (text && notes.length < 10) {
        notes.unshift(text);
        save();
        renderNotes();
    }
}

// Theme
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
    document.body.classList.add('dark');
}

// Init
document.addEventListener('DOMContentLoaded', load);

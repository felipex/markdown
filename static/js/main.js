// Configuration
const DEBOUNCE_MS = 300;
let debounceTimer;
let currentOpenedFile = null;

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
});

// UI Elements
const markdownInput = document.getElementById('markdown-input');
const markdownOutput = document.getElementById('markdown-output');
const btnSave = document.getElementById('btn-save');
const btnNew = document.getElementById('btn-new');
const currentFilenameDisplay = document.getElementById('current-filename');
const toast = document.getElementById('toast');

// --- Markdown Rendering ---

function renderMarkdown() {
    const rawValue = markdownInput.value;

    // Convert Markdown to HTML using marked.js
    const htmlOutput = marked.parse(rawValue);
    markdownOutput.innerHTML = htmlOutput;

    // Handle Mermaid diagrams
    renderMermaid();

    // Handle LaTeX equations
    renderMath();
}

function renderMath() {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(markdownOutput, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true }
            ],
            throwOnError: false
        });
    }
}

async function renderMermaid() {
    const mermaidBlocks = markdownOutput.querySelectorAll('pre code.language-mermaid');

    for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        const container = block.parentElement;
        const code = block.textContent;

        try {
            const { svg } = await mermaid.render(`mermaid-${i}`, code);
            container.innerHTML = svg;
            container.classList.add('mermaid-rendered');
        } catch (error) {
            console.error('Mermaid render error:', error);
            container.innerHTML = `<div class="error-msg">Erro no diagrama: ${error.message}</div>`;
        }
    }
}

// Debounce for real-time preview
markdownInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderMarkdown, DEBOUNCE_MS);
});

// --- File Operations ---

async function loadFileList() {
    const response = await fetch(`/api/files/${window.CURRENT_USER}`);
    const data = await response.json();

    const fileListContainer = document.getElementById('file-list');
    fileListContainer.innerHTML = '';

    if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item';
            if (currentOpenedFile === file) div.classList.add('active');
            div.textContent = file;
            div.onclick = () => loadFile(file);
            fileListContainer.appendChild(div);
        });
    } else {
        fileListContainer.innerHTML = '<div class="loader">Nenhum arquivo encontrado</div>';
    }
}

async function loadFile(filename) {
    try {
        const response = await fetch(`/api/file/${window.CURRENT_USER}/${filename}`);
        const data = await response.json();

        if (data.error) {
            showToast(data.error, 'error');
            return;
        }

        currentOpenedFile = filename;
        currentFilenameDisplay.textContent = filename;
        markdownInput.value = data.content;
        renderMarkdown();

        // Update active class in sidebar
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent === filename) item.classList.add('active');
        });

    } catch (error) {
        showToast('Erro ao carregar arquivo', 'error');
    }
}

async function saveFile() {
    let filename = currentOpenedFile;

    if (!filename) {
        filename = prompt('Digite o nome do arquivo (ex: nota.md):');
        if (!filename) return;
        if (!filename.endsWith('.md')) filename += '.md';
    }

    try {
        const response = await fetch(`/api/save/${window.CURRENT_USER}/${filename}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: markdownInput.value })
        });

        const data = await response.json();
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Salvo com sucesso!', 'success');
            currentOpenedFile = data.filename;
            currentFilenameDisplay.textContent = data.filename;
            loadFileList();
        }
    } catch (error) {
        showToast('Erro ao salvar arquivo', 'error');
    }
}

function createNewFile() {
    currentOpenedFile = null;
    currentFilenameDisplay.textContent = 'Sem título.md';
    markdownInput.value = '';
    renderMarkdown();
    document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
    markdownInput.focus();
}

// --- UI Helpers ---

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// --- Mobile UI Logic ---

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const toggleEdit = document.getElementById('toggle-edit');
const togglePreview = document.getElementById('toggle-preview');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible');
}

function setViewMode(mode) {
    document.body.setAttribute('data-view', mode);
    if (mode === 'edit') {
        toggleEdit.classList.add('active');
        togglePreview.classList.remove('active');
        markdownInput.focus();
    } else {
        toggleEdit.classList.remove('active');
        togglePreview.classList.add('active');
        renderMarkdown();
    }
}

// Event Listeners for Mobile
if (menuToggle) menuToggle.onclick = toggleSidebar;
if (sidebarOverlay) sidebarOverlay.onclick = toggleSidebar;
if (toggleEdit) toggleEdit.onclick = () => setViewMode('edit');
if (togglePreview) togglePreview.onclick = () => setViewMode('preview');

// Initialize view mode
document.body.setAttribute('data-view', 'edit');

// Shortcuts
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
    }
});

// Event Listeners
btnSave.onclick = saveFile;
btnNew.onclick = createNewFile;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFileList();
    renderMarkdown();
});

// HTMX refresh integration
document.body.addEventListener('refreshFiles', () => {
    loadFileList();
});

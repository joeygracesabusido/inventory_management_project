// DOM Element Selectors
const getEl = (id) => document.getElementById(id);

const elements = {
    appContainer: getEl('app-container'),
    loginView: getEl('login-view'),
    signupView: getEl('signup-view'),
    mainView: getEl('main-view'),
    viewTitle: getEl('view-title'),
    headerActions: getEl('header-actions'),
    contentArea: getEl('content-area'),
    modalBackdrop: getEl('modal-backdrop'),
    modalContent: getEl('modal-content'),
    modalTitle: getEl('modal-title'),
    modalBody: getEl('modal-body'),
    modalCloseBtn: getEl('modal-close-btn'),
    signupLink: getEl('signup-link'),
    loginLink: getEl('login-link'),
};

// --- View Management ---
function toggleViews(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    getEl(viewId).classList.add('active');
}

// --- Modal Management ---
function showModal(title, content) {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    elements.modalBackdrop.classList.remove('hidden');
}

function hideModal() {
    elements.modalBackdrop.classList.add('hidden');
    elements.modalTitle.textContent = '';
    elements.modalBody.innerHTML = '';
}

// --- Dynamic Content Rendering ---
function setView(title, headerButtons = '') {
    elements.viewTitle.textContent = title;
    elements.headerActions.innerHTML = headerButtons;
}

function renderContent(html) {
    elements.contentArea.innerHTML = html;
}

// --- Table Rendering ---
function createTable(headers, rows) {
    const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
    const bodyHtml = rows.map(row => `<tr>${row.map(col => `<td>${col}</td>`).join('')}</tr>`).join('');

    return `
        <table class="content-table">
            <thead>
                <tr>${headerHtml}</tr>
            </thead>
            <tbody>
                ${bodyHtml}
            </tbody>
        </table>
    `;
}

// --- Form Generation ---
function createForm(fields, actions) {
    const fieldsHtml = fields.map(field => {
        let fieldHtml = '';
        switch (field.type) {
            case 'textarea':
                fieldHtml = `<textarea id="${field.id}" name="${field.name}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`;
                break;
            case 'checkbox':
                fieldHtml = `<input type="checkbox" id="${field.id}" name="${field.name}" ${field.value ? 'checked' : ''}>`;
                break;
            default:
                fieldHtml = `<input type="${field.type || 'text'}" id="${field.id}" name="${field.name}" value="${field.value || ''}" ${field.required ? 'required' : ''}>`;
        }
        return `
            <div class="form-group">
                <label for="${field.id}">${field.label}</label>
                ${fieldHtml}
            </div>
        `;
    }).join('');

    const actionsHtml = actions.map(action => `
        <button type="button" id="${action.id}" class="${action.class}">${action.label}</button>
    `).join('');

    return `
        <form id="modal-form">
            ${fieldsHtml}
            <div class="form-actions">
                ${actionsHtml}
            </div>
        </form>
    `;
}

// --- Auth Views Event Listeners ---
function initializeAuthViews() {
    elements.signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleViews('signup-view');
    });

    elements.loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleViews('login-view');
    });
}

// --- Event Listeners Setup ---
function initializeUI() {
    elements.modalCloseBtn.addEventListener('click', hideModal);
    elements.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.modalBackdrop) {
            hideModal();
        }
    });
    initializeAuthViews();
}

document.addEventListener('DOMContentLoaded', () => {
    const addCategoryButton = document.getElementById('add-category-button');
    const addCategoryModal = document.getElementById('add-category-modal');

    if (addCategoryButton && addCategoryModal) {
        addCategoryButton.addEventListener('click', () => {
            addCategoryModal.classList.toggle('hidden');
            addCategoryModal.setAttribute('aria-hidden', addCategoryModal.classList.contains('hidden'));
        });

        // Close modal when clicking on the close button inside the modal
        const closeButtons = addCategoryModal.querySelectorAll('[data-modal-hide="add-category-modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                addCategoryModal.classList.add('hidden');
                addCategoryModal.setAttribute('aria-hidden', 'true');
            });
        });

        // Close modal when clicking outside the modal content
        addCategoryModal.addEventListener('click', (event) => {
            if (event.target === addCategoryModal) {
                addCategoryModal.classList.add('hidden');
                addCategoryModal.setAttribute('aria-hidden', 'true');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize UI event listeners (like for the modal)
    initializeUI();

    // Check for existing token to see if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
        toggleViews('main-view');
        navigateTo('dashboard');
    } else {
        toggleViews('login-view');
    }

    // Setup major event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form submission
    getEl('login-form').addEventListener('submit', handleLogin);

    // Logout button
    getEl('logout-btn').addEventListener('click', handleLogout);

    // Sidebar navigation
    document.querySelector('.sidebar nav').addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const viewName = e.target.dataset.view;
            navigateTo(viewName);
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = getEl('email').value;
    const password = getEl('password').value;
    const loginErrorEl = getEl('login-error');
    loginErrorEl.textContent = '';

    const LOGIN_MUTATION = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                accessToken
                tokenType
            }
        }
    `;

    try {
        const data = await fetchGraphQL(LOGIN_MUTATION, { email, password });
        const token = data.login.accessToken;

        if (token) {
            localStorage.setItem('accessToken', token);
            toggleViews('main-view');
            navigateTo('dashboard');
        } else {
            loginErrorEl.textContent = 'Login failed: No token received.';
        }
    } catch (error) {
        loginErrorEl.textContent = error.message || 'An error occurred during login.';
    }
}

function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    getEl('login-form').reset();
    toggleViews('login-view');
}

function navigateTo(viewName) {
    console.log(`Navigating to ${viewName}`);
    // Update active link in sidebar
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        a.classList.remove('active');
        if (a.dataset.view === viewName) {
            a.classList.add('active');
        }
    });

    // Render the corresponding view
    switch (viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'items':
            renderItemsView();
            break;
        // Add other cases here as they are built
        default:
            setView('Not Found');
            renderContent('<p>View not implemented yet.</p>');
            break;
    }
}

// --- View Rendering Functions (Stubs) ---

function renderDashboard() {
    setView('Dashboard');
    renderContent('<p>Welcome to the inventory system. This is the main dashboard.</p>');
}

function renderItemsView() {
    const headerButtons = `<button id="add-item-btn" class="btn-primary">+ Add Item</button>`;
    setView('Items', headerButtons);
    
    // Placeholder content
    const headers = ['Item Code', 'Name', 'Category', 'Unit Price', 'On Hand', 'Actions'];
    const rows = [
        ['SKU-001', 'Sample Item', 'Category A', '19.99', '100', '<button>Edit</button>'],
    ];
    renderContent(createTable(headers, rows));

    // Add event listener for the new button
    getEl('add-item-btn').addEventListener('click', () => {
        showAddItemModal();
    });
}

function showAddItemModal() {
    const formFields = [
        { id: 'itemCode', name: 'itemCode', label: 'Item Code', required: true },
        { id: 'itemName', name: 'itemName', label: 'Item Name', required: true },
        { id: 'category', name: 'category', label: 'Category' },
        { id: 'unitPrice', name: 'unitPrice', label: 'Unit Price', type: 'number' },
    ];
    const formActions = [
        { id: 'cancel-btn', label: 'Cancel', class: 'btn-secondary' },
        { id: 'save-item-btn', label: 'Save Item', class: 'btn-primary' },
    ];
    const formHtml = createForm(formFields, formActions);
    showModal('Add New Item', formHtml);

    getEl('cancel-btn').addEventListener('click', hideModal);
    getEl('save-item-btn').addEventListener('click', () => {
        console.log('Saving item...');
        // Logic to save item data will go here
        hideModal();
    });
}

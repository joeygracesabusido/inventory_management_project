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

    // Signup form submission
    getEl('signup-form').addEventListener('submit', handleSignUp);

    // Logout button
    getEl('logout-btn').addEventListener('click', handleLogout);

    // Switch to sign up view
    getEl('signup-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleViews('signup-view');
    });

    // Switch to login view
    getEl('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleViews('login-view');
    });

    // Sidebar navigation
    document.querySelector('aside nav').addEventListener('click', (e) => {
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

    try {
        await login(email, password);
        const token = localStorage.getItem('accessToken');

        if (token) {
            window.location.href = '/dashboard';
        } else {
            loginErrorEl.textContent = 'Login failed: Please check your credentials.';
        }
    } catch (error) {
        loginErrorEl.textContent = error.message || 'An error occurred during login.';
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    console.log("handleSignUp called");
    const email = getEl('signup-email').value;
    const password = getEl('signup-password').value;
    const firstName = getEl('first-name').value;
    const lastName = getEl('last-name').value;

    console.log("Email:", email);
    console.log("Password:", password);
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);

    // You can add a signup-error element to the HTML to show errors
    // const signupErrorEl = getEl('signup-error');
    // signupErrorEl.textContent = '';

    const SIGNUP_MUTATION = `
        mutation SignUp($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
            signUp(email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
                id
                email
            }
        }
    `;

    try {
        console.log("Calling fetchGraphQL for signup");
        const data = await fetchGraphQL(SIGNUP_MUTATION, { email, password, firstName, lastName });
        console.log("GraphQL response:", data);

        if (data.signUp) {
            // Maybe show a success message and switch to login view
            console.log('Sign up successful:', data.signUp);
            toggleViews('login-view');
        } else {
            // signupErrorEl.textContent = 'Sign up failed.';
            console.error('Sign up failed');
        }
    } catch (error) {
        // signupErrorEl.textContent = error.message || 'An error occurred during sign up.';
        console.error("Error in handleSignUp:", error);
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
    document.querySelectorAll('aside nav a').forEach(a => {
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

    getEl('add-category-btn').addEventListener('click', () => {
        showAddCategoryModal();
    });
}

function showAddCategoryModal() {
    const formFields = [
        { id: 'category-name', name: 'category-name', label: 'Category Name', required: true },
    ];
    const formActions = [
        { id: 'cancel-category-btn', label: 'Cancel', class: 'btn-secondary' },
        { id: 'save-category-btn', label: 'Save Category', class: 'btn-primary' },
    ];
    const formHtml = createForm(formFields, formActions);
    showModal('Add New Category', formHtml);

    getEl('cancel-category-btn').addEventListener('click', hideModal);
    getEl('save-category-btn').addEventListener('click', async () => {
        const categoryName = getEl('category-name').value;

        const ADD_CATEGORY_MUTATION = `
            mutation AddCategory($name: String!) {
                addCategory(name: $name) {
                    id
                    name
                }
            }
        `;

        try {
            const data = await fetchGraphQL(ADD_CATEGORY_MUTATION, { name: categoryName });
            if (data.addCategory) {
                hideModal();
                // Optionally, refresh a category list or give feedback
            } else {
                // Handle error
                console.error('Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    });
}

function showAddItemModal() {
    const formFields = [
        { id: 'code', name: 'code', label: 'Item Code', required: true },
        { id: 'name', name: 'name', label: 'Item Name', required: true },
        { id: 'track_inventory', name: 'track_inventory', label: 'Track Inventory', type: 'checkbox' },
        { id: 'purchase', name: 'purchase', label: 'Purchase', type: 'checkbox' },
        { id: 'cost_price', name: 'cost_price', label: 'Cost Price', type: 'number' },
        { id: 'purchase_account', name: 'purchase_account', label: 'Purchase Account' },
        { id: 'purchase_tax_rate', name: 'purchase_tax_rate', label: 'Purchase Tax Rate' },
        { id: 'purchase_description', name: 'purchase_description', label: 'Purchase Description', type: 'textarea' },
        { id: 'sell', name: 'sell', label: 'Sell', type: 'checkbox' },
        { id: 'sale_price', name: 'sale_price', label: 'Sale Price', type: 'number' },
        { id: 'sales_account', name: 'sales_account', label: 'Sales Account' },
        { id: 'sales_tax_rate', name: 'sales_tax_rate', label: 'Sales Tax Rate' },
        { id: 'sales_description', name: 'sales_description', label: 'Sales Description', type: 'textarea' },
    ];
    const formActions = [
        { id: 'cancel-btn', label: 'Cancel', class: 'btn-secondary' },
        { id: 'save-item-btn', label: 'Save Item', class: 'btn-primary' },
    ];
    const formHtml = createForm(formFields, formActions);
    showModal('Add New Item', formHtml);

    getEl('cancel-btn').addEventListener('click', hideModal);
    getEl('save-item-btn').addEventListener('click', async () => {
        const itemData = {
            code: getEl('code').value,
            name: getEl('name').value,
            track_inventory: getEl('track_inventory').checked,
            purchase: getEl('purchase').checked,
            cost_price: parseFloat(getEl('cost_price').value),
            purchase_account: getEl('purchase_account').value,
            purchase_tax_rate: getEl('purchase_tax_rate').value,
            purchase_description: getEl('purchase_description').value,
            sell: getEl('sell').checked,
            sale_price: parseFloat(getEl('sale_price').value),
            sales_account: getEl('sales_account').value,
            sales_tax_rate: getEl('sales_tax_rate').value,
            sales_description: getEl('sales_description').value,
        };

        const ADD_ITEM_MUTATION = `
            mutation AddItem($itemData: ItemCreate!) {
                addItem(itemData: $itemData) {
                    id
                    code
                }
            }
        `;

        try {
            const data = await fetchGraphQL(ADD_ITEM_MUTATION, { itemData });
            if (data.addItem) {
                hideModal();
                renderItemsView(); // Refresh the items view
            } else {
                // Handle error
                console.error('Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    });
}
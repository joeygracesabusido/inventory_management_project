
document.addEventListener('DOMContentLoaded', () => {
    const categoryInput = document.getElementById('category');
    const categorySuggestions = document.getElementById('category-suggestions');
    const addCategoryModal = document.getElementById('add-category-modal');
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryNameInput = document.getElementById('category-name');
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');
    const contactsInput = document.getElementById('contacts');
    const contactsSuggestions = document.getElementById('contacts-suggestions');

    const graphqlFetch = async (query, variables = {}) => {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Network error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        return response.json();
    };

    const fetchContacts = async (query) => {
        const GQL_QUERY = `
            query GetContacts($name: String) {
                contacts(name: $name) {
                    id
                    contact_name
                }
            }
        `;
        try {
            const responseData = await graphqlFetch(GQL_QUERY, { name: query });
            if (responseData.errors) {
                console.error('Error fetching contacts:', responseData.errors);
                return [];
            }
            return responseData.data?.contacts || [];
        } catch (error) {
            console.error('Network error:', error);
            return [];
        }
    };

    const showContactSuggestions = (contacts) => {
        contactsSuggestions.innerHTML = '';
        if (contacts.length > 0) {
            contacts.forEach(contact => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestion.textContent = contact.contact_name;
                suggestion.addEventListener('click', () => {
                    contactsInput.value = contact.contact_name;
                    contactsSuggestions.classList.add('hidden');
                });
                contactsSuggestions.appendChild(suggestion);
            });
        }
        contactsSuggestions.classList.remove('hidden');
    };

    contactsInput.addEventListener('input', async () => {
        const query = contactsInput.value.trim();
        if (query.length > 0) {
            const contacts = await fetchContacts(query);
            showContactSuggestions(contacts);
        } else {
            contactsSuggestions.classList.add('hidden');
        }
    });

    const fetchCategories = async (query) => {
        const GQL_QUERY = `
            query GetCategories($name: String) {
                categories(name: $name) {
                    id
                    name
                }
            }
        `;
        try {
            const responseData = await graphqlFetch(GQL_QUERY, { name: query });
            console.log(responseData)
            if (responseData.errors) {
                console.error('Error fetching categories:', responseData.errors);
                return [];
            }
            return responseData.data?.categories || [];
        } catch (error) {
            console.error('Network error:', error);
            return [];
        }
    };

    const showSuggestions = (categories, query) => {
        categorySuggestions.innerHTML = '';
        if (categories.length > 0) {
            categories.forEach(category => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestion.textContent = category.name;
                suggestion.addEventListener('click', () => {
                    categoryInput.value = category.name;
                    categorySuggestions.classList.add('hidden');
                });
                categorySuggestions.appendChild(suggestion);
            });
        }
        
        const createOption = document.createElement('div');
        createOption.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200', 'text-indigo-600');
        createOption.innerHTML = `<i class="fas fa-plus mr-2"></i> Create "${query}"`;
        createOption.addEventListener('click', () => {
            categoryNameInput.value = query;
            addCategoryModal.classList.remove('hidden');
            categorySuggestions.classList.add('hidden');
        });
        categorySuggestions.appendChild(createOption);

        categorySuggestions.classList.remove('hidden');
    };

    categoryInput.addEventListener('input', async () => {
        const query = categoryInput.value.trim();
        if (query.length > 0) {
            const categories = await fetchCategories(query);
            showSuggestions(categories, query);
        } else {
            categorySuggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!categoryInput.contains(e.target) && !categorySuggestions.contains(e.target)) {
            categorySuggestions.classList.add('hidden');
        }
        if (!contactsInput.contains(e.target) && !contactsSuggestions.contains(e.target)) {
            contactsSuggestions.classList.add('hidden');
        }
    });

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();
        if (!categoryName) {
            alert('Category name cannot be empty.');
            return;
        }

        const ADD_CATEGORY_MUTATION = `
            mutation AddCategory($name: String!) {
                addCategory(name: $name) {
                    id
                    name
                }
            }
        `;

        try {
            const responseData = await graphqlFetch(ADD_CATEGORY_MUTATION, { name: categoryName });
            
            if (responseData.errors) {
                alert(`Error adding category: ${responseData.errors[0].message}`);
            } else if (responseData.data && responseData.data.addCategory) {
                categoryInput.value = responseData.data.addCategory.name;
                addCategoryModal.classList.add('hidden');
            } else {
                alert('An unexpected error occurred.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to the server. Please try again.');
        }
    });

    cancelCategoryBtn.addEventListener('click', () => {
        addCategoryModal.classList.add('hidden');
    });

    const newItemForm = document.getElementById('new-item-form');
    newItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(newItemForm);
        const itemData = {
            code: formData.get('code'),
            name: formData.get('name'),
            category: formData.get('category'),
            costPrice: parseFloat(formData.get('cost_price')),
            salePrice: parseFloat(formData.get('sale_price')),
            purchaseAccount: formData.get('purchase_account'),
            salesAccount: formData.get('sales_account'),
            purchaseTaxRate: parseFloat(formData.get('purchase_tax_rate')),
            salesTaxRate: parseFloat(formData.get('sales_tax_rate')),
            purchaseDescription: formData.get('purchase_description'),
            salesDescription: formData.get('sales_description'),
            trackInventory: formData.get('track_inventory') === 'on',
            purchase: formData.get('purchase') === 'on',
            sell: formData.get('sell') === 'on',
        };

        const ADD_ITEM_MUTATION = `
            mutation AddItem($itemData: ItemCreate!) {
                addItem(itemData: $itemData) {
                    id
                }
            }
        `;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: ADD_ITEM_MUTATION,
                    variables: { itemData: itemData }
                })
            });

            const responseData = await response.json();

            if (responseData.errors) {
                alert(`Error adding item: ${responseData.errors[0].message}`);
            } else if (responseData.data && responseData.data.addItem) {
                window.location.href = '/products';
            } else {
                alert('An unexpected error occurred.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to the server. Please try again.');
        }
    });
});

// --- Category Modal Form Submission (GraphQL) ---
document.addEventListener('DOMContentLoaded', () => {
    const addCategoryModal = document.getElementById('add-category-modal');
    const addCategoryForm = addCategoryModal ? addCategoryModal.querySelector('form') : null;
    const categoryNameInput = addCategoryModal ? addCategoryModal.querySelector('#category-name') : null;

    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const categoryName = categoryNameInput ? categoryNameInput.value.trim() : '';

            if (!categoryName) {
                alert('Category name cannot be empty.');
                return;
            }

            const query = `
                mutation AddCategory($name: String!) {
                    addCategory(name: $name) {
                        id
                        name
                    }
                }
            `;

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: { name: categoryName }
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Network error: ${response.status} ${response.statusText} - ${errorBody}`);
                }

                const responseData = await response.json();

                if (responseData.errors) {
                    alert(`Error adding category: ${responseData.errors[0].message}`);
                } else if (responseData.data && responseData.data.addCategory) {
                    alert(`Category "${responseData.data.addCategory.name}" added successfully!`);
                    window.location.reload();
                    addCategoryModal.classList.add('hidden');
                    addCategoryModal.setAttribute('aria-hidden', 'true');
                    if (categoryNameInput) categoryNameInput.value = '';
                } else {
                    alert('An unexpected error occurred.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Failed to connect to the server. Please try again.');
            }
        });
    }

    // --- Fetch and Display Items ---
    if (window.location.pathname === '/products') {
        const fetchAndDisplayItems = async () => {
            const getItemsQuery = `
                query GetItems {
                    getItems {
                        code
                        name
                        costPrice
                        salePrice
                        trackInventory
                        measurement
                    }
                }
            `;

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        query: getItemsQuery
                    })
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Network error: ${response.status} ${response.statusText} - ${errorBody}`);
                }

                const responseData = await response.json();

                if (responseData.errors) {
                    alert(`Error fetching items: ${responseData.errors[0].message}`);
                } else if (responseData.data && responseData.data.getItems) {
                    const items = responseData.data.getItems;
                    const tbody = document.querySelector('tbody');
                    tbody.innerHTML = ''; // Clear existing rows

                    items.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.costPrice || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.salePrice || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.trackInventory ? 'Yes' : 'No'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.measurement || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" class="text-indigo-600 hover:text-indigo-900">...</a>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                } else {
                    alert('An unexpected error occurred while fetching items.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Failed to connect to the server. Please try again.');
            }
        };

        fetchAndDisplayItems();
    }
});

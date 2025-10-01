
document.addEventListener('DOMContentLoaded', () => {
    const addCategoryModal = document.getElementById('add-category-modal');
    const addCategoryForm = addCategoryModal ? addCategoryModal.querySelector('form') : null;
    const categoryNameInput = addCategoryModal ? addCategoryModal.querySelector('#category-name') : null;

    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();

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
                } else {
                    alert('An unexpected error occurred.');
                }
            }
            catch (error) {
                console.error('Network error:', error);
                alert('Failed to connect to the server. Please try again.');
            }
        });
    }

    if (window.location.pathname === '/products') {
        const searchInput = document.getElementById('Search');
        const tbody = document.querySelector('tbody');
        const paginationContainer = document.getElementById('pagination-container');
        
        let currentPage = 1;
        const pageSize = 20;

        const fetchAndDisplayItems = async (searchTerm = '', page = 1) => {
            const getItemsQuery = `
                query GetItems($search: String, $page: Int, $pageSize: Int) {
                    getItems(search: $search, page: $page, pageSize: $pageSize) {
                        items {
                            id
                            code
                            name
                            category
                            costPrice
                            salePrice
                            quantity
                            measurement
                        }
                        totalItems
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
                        query: getItemsQuery,
                        variables: { search: searchTerm, page: page, pageSize: pageSize }
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
                    const { items, total_items } = responseData.data.getItems;
                    tbody.innerHTML = '';

                    items.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.category}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.costPrice || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.salePrice || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.measurement || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="/edit_item/${item.id}" class="text-indigo-600 hover:text-indigo-900">...</a>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });

                    renderPagination(total_items, page, pageSize);
                } else {
                    alert('An unexpected error occurred while fetching items.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Failed to connect to the server. Please try again.');
            }
        };

        const renderPagination = (totalItems, currentPage, pageSize) => {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(totalItems / pageSize);

            if (totalPages <= 1) return;

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.className = `px-4 py-2 mx-1 text-sm font-medium rounded-md ${i === currentPage ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`;
                button.addEventListener('click', () => {
                    currentPage = i;
                    fetchAndDisplayItems(searchInput.value, currentPage);
                });
                paginationContainer.appendChild(button);
            }
        };

        searchInput.addEventListener('keyup', () => {
            currentPage = 1;
            fetchAndDisplayItems(searchInput.value, currentPage);
        });

        fetchAndDisplayItems();
    }
});

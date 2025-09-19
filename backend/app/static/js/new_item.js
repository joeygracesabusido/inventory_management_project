
document.addEventListener('DOMContentLoaded', () => {
    const categoryInput = document.getElementById('category');
    const categorySuggestions = document.getElementById('category-suggestions');
    const addCategoryModal = document.getElementById('add-category-modal');
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryNameInput = document.getElementById('category-name');
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');

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
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: GQL_QUERY,
                    variables: { name: query }
                })
            });
            const responseData = await response.json();
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
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: ADD_CATEGORY_MUTATION,
                    variables: { name: categoryName }
                })
            });
            const responseData = await response.json();
            
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
});

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
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Add authorization header if needed
                        // 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: { name: categoryName }
                    })
                });

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
});

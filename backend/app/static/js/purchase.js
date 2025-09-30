document.addEventListener('DOMContentLoaded', () => {
    const purchaseForm = document.getElementById('purchase-form');
    const itemNameInput = document.getElementById('item_name');
    const itemSuggestions = document.getElementById('item-suggestions');
    let selectedItemId = null;

    const graphqlFetch = async (query, variables) => {
        const token = localStorage.getItem("accessToken");
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query, variables }),
        });
        return response.json();
    };

    const fetchItems = async (query) => {
        const GQL_QUERY = `
            query GetItemsAutocomplete($search: String) {
                getItemsAutocomplete(search: $search) {
                    items {
                        id
                        name
                    }
                }
            }
        `;
        try {
            const responseData = await graphqlFetch(GQL_QUERY, { search: query });
            if (responseData.errors) {
                console.error('Error fetching items:', responseData.errors);
                return [];
            }
            return responseData.data?.getItemsAutocomplete?.items || [];
        } catch (error) {
            console.error('Network error:', error);
            return [];
        }
    };

    const showItemSuggestions = (suggestions) => {
        itemSuggestions.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(item => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestionElement.textContent = item.name;
                suggestionElement.addEventListener('click', () => {
                    itemNameInput.value = item.name;
                    selectedItemId = item.id;
                    itemSuggestions.classList.add('hidden');
                });
                itemSuggestions.appendChild(suggestionElement);
            });
        }
        itemSuggestions.classList.remove('hidden');
    };

    itemNameInput.addEventListener('input', async () => {
        const query = itemNameInput.value.trim();
        if (query.length > 0) {
            const items = await fetchItems(query);
            showItemSuggestions(items);
        } else {
            itemSuggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', (event) => {
        if (!itemNameInput.contains(event.target)) {
            itemSuggestions.classList.add('hidden');
        }
    });

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!selectedItemId) {
                alert('Please select an item from the list.');
                return;
            }

            const stockData = {
                item_id: selectedItemId,
                quantity: parseInt(document.getElementById('quantity').value, 10),
                purchase_price: parseFloat(document.getElementById('purchase_price').value),
                purchase_date: document.getElementById('purchase_date').value ? new Date(document.getElementById('purchase_date').value).toISOString() : new Date().toISOString(),
            };

            const GQL_MUTATION = `
                mutation AddStock($stockData: StockCreate!) {
                    addStock(stockData: $stockData) {
                        id
                    }
                }
            `;

            try {
                const responseData = await graphqlFetch(GQL_MUTATION, { stockData });
                if (responseData.errors) {
                    console.error('Error adding stock:', responseData.errors);
                    alert('Error adding stock. See console for details.');
                } else {
                    alert('Stock added successfully!');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Network error. See console for details.');
            }
        });
    }
});

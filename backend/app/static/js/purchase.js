document.addEventListener('DOMContentLoaded', () => {
    const purchaseForm = document.getElementById('purchase-form');
    const cancelPurchaseButton = document.getElementById('cancel-purchase');
    const itemNameInput = document.getElementById('item_name');
    const itemSuggestions = document.getElementById('item-suggestions');
    const supplierNameInput = document.getElementById('supplier_name');
    const supplierSuggestions = document.getElementById('supplier-suggestions');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('purchase_price');
    const suggestedSellingPriceInput = document.getElementById('suggested_selling_price');
    const subtotalInput = document.getElementById('subtotal');
    const vatInput = document.getElementById('vat');
    const totalInput = document.getElementById('total');
    let selectedItemId = null;
    let selectedSupplierId = null;

    if (cancelPurchaseButton) {
        cancelPurchaseButton.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
    }

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

    const fetchContacts = async (query) => {
        const GQL_QUERY = `
            query GetContacts($name: String) {
                contacts(name: $name) {
                    id
                    contactName
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

    const showSupplierSuggestions = (suggestions) => {
        supplierSuggestions.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(supplier => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestionElement.textContent = supplier.contactName;
                suggestionElement.addEventListener('click', () => {
                    supplierNameInput.value = supplier.contactName;
                    selectedSupplierId = supplier.id;
                    supplierSuggestions.classList.add('hidden');
                });
                supplierSuggestions.appendChild(suggestionElement);
            });
        }
        supplierSuggestions.classList.remove('hidden');
    };

    const calculateTotals = () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const vat = parseFloat(vatInput.value) || 0;

        const subtotal = quantity * price;
        const total = subtotal * (1 + vat / 100);

        subtotalInput.value = subtotal.toFixed(2);
        totalInput.value = total.toFixed(2);
    };

    [quantityInput, priceInput, vatInput].forEach(input => {
        input.addEventListener('input', calculateTotals);
    });

    itemNameInput.addEventListener('input', async () => {
        const query = itemNameInput.value.trim();
        if (query.length > 0) {
            const items = await fetchItems(query);
            showItemSuggestions(items);
        } else {
            itemSuggestions.classList.add('hidden');
            selectedItemId = null;
        }
    });

    supplierNameInput.addEventListener('input', async () => {
        const query = supplierNameInput.value.trim();
        if (query.length > 0) {
            const contacts = await fetchContacts(query);
            showSupplierSuggestions(contacts);
        } else {
            supplierSuggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', (event) => {
        if (!itemNameInput.contains(event.target)) {
            itemSuggestions.classList.add('hidden');
        }
        if (!supplierNameInput.contains(event.target)) {
            supplierSuggestions.classList.add('hidden');
        }
    });

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!selectedItemId) {
                alert('Please select an item from the list.');
                return;
            }

            const purchaseData = {
                supplierName: document.getElementById('supplier_name').value,
                purchaseDate: document.getElementById('purchase_date').value ? new Date(document.getElementById('purchase_date').value).toISOString() : new Date().toISOString(),
                items: [{
                    itemId: selectedItemId,
                    quantity: parseInt(quantityInput.value, 10),
                    purchasePrice: parseFloat(priceInput.value),
                    sellingPrice: suggestedSellingPriceInput.value ? parseFloat(suggestedSellingPriceInput.value) : null,
                }],
                subtotal: parseFloat(subtotalInput.value),
                vat: parseFloat(vatInput.value),
                total: parseFloat(totalInput.value),
            };

            const GQL_MUTATION = `
                mutation CreatePurchase($purchaseData: PurchaseCreate!) {
                    createPurchase(purchaseData: $purchaseData) {
                        id
                    }
                }
            `;

            try {
                const responseData = await graphqlFetch(GQL_MUTATION, { purchaseData });
                if (responseData.errors) {
                    console.error('Error creating purchase:', responseData.errors);
                    alert('Error creating purchase. See console for details.');
                } else {
                    alert('Purchase created successfully!');
                    window.location.href = '/products';
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Network error. See console for details.');
            }
        });
    }
});

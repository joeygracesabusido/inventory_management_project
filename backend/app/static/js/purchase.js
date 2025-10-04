document.addEventListener('DOMContentLoaded', () => {
    const purchaseForm = document.getElementById('purchase-form');
    const cancelPurchaseButton = document.getElementById('cancel-purchase');
    const supplierNameInput = document.getElementById('supplier_name');
    const supplierSuggestions = document.getElementById('supplier-suggestions');
    const purchaseTbody = document.getElementById('purchase-tbody');
    const addNewLineBtn = document.getElementById('add-new-line-btn-purchase');
    const taxModeSelect = document.getElementById('tax-mode');
    const modal = document.getElementById('confirmation-modal-purchase');
    const modalSummary = document.getElementById('modal-summary');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

    let selectedSupplierId = null;
    let focusedSuggestionIndex = -1;

    const handleAutocompleteKeyDown = (e, suggestionsContainer) => {
        const suggestions = suggestionsContainer.querySelectorAll('div');
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedSuggestionIndex = (focusedSuggestionIndex + 1) % suggestions.length;
            highlightSuggestion(suggestions, focusedSuggestionIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedSuggestionIndex = (focusedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            highlightSuggestion(suggestions, focusedSuggestionIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedSuggestionIndex > -1) {
                suggestions[focusedSuggestionIndex].click();
            }
        }
    };

    const highlightSuggestion = (suggestions, index) => {
        suggestions.forEach((suggestion, i) => {
            if (i === index) {
                suggestion.classList.add('bg-gray-200');
            } else {
                suggestion.classList.remove('bg-gray-200');
            }
        });
    };

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
                        purchasePrice
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

    const showItemSuggestions = (suggestions, inputElement) => {
        const suggestionsContainer = inputElement.nextElementSibling;
        suggestionsContainer.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(item => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestionElement.textContent = item.name;
                suggestionElement.addEventListener('click', () => {
                    const row = inputElement.closest('tr');
                    row.dataset.itemId = item.id;
                    inputElement.value = item.name;
                    const priceInput = row.querySelector('.purchase-price-input');
                    if (priceInput) {
                        priceInput.value = item.purchasePrice;
                    }
                    calculateRowTotal(row);
                    suggestionsContainer.classList.add('hidden');
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
        }
        suggestionsContainer.classList.remove('hidden');
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

    const calculateRowTotal = (row) => {
        const quantityInput = row.querySelector('.purchase-quantity-input');
        const priceInput = row.querySelector('.purchase-price-input');
        const discountInput = row.querySelector('.purchase-discount-input');
        const totalInput = row.querySelector('.purchase-total-input');

        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;

        const total = (quantity * price) - discount;
        totalInput.value = total.toFixed(2);
        updateGrandTotal();
    };

    const updateGrandTotal = () => {
        let subtotal = 0;
        document.querySelectorAll('.purchase-total-input').forEach(input => {
            subtotal += parseFloat(input.value) || 0;
        });

        const taxMode = taxModeSelect.value;
        let vat = 0;
        if (taxMode === 'Inclusive of Tax') {
            vat = (subtotal / 1.12) * 0.12;
        } else { // Exclusive of Tax
            vat = subtotal * 0.12;
        }

        const amountDue = subtotal + vat;

        document.querySelector('.sale-total-amount-input').value = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.querySelector('.sale-vat-input').value = vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.querySelector('.sale-amount-due-input').value = amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.querySelector('.sale-amount2-due-input').value = amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const addNewRow = () => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap relative">
                <input type="text" placeholder="Enter an item..." class="w-full border-none item-input">
                <div class="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 hidden item-suggestions"></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="text"  class="w-full border-none purchase-description-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-quantity-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-price-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-selling-price-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-tax-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-discount-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none purchase-total-input" readonly></td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button type="button" class="delete-row-btn text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        purchaseTbody.appendChild(newRow);
        updateGrandTotal();
    };

    const deleteRow = (event) => {
        const btn = event.target.closest('.delete-row-btn');
        if (btn) {
            btn.closest('tr').remove();
            updateGrandTotal();
        }
    };

    if (addNewLineBtn) {
        addNewLineBtn.addEventListener('click', addNewRow);
    }

    if (taxModeSelect) {
        taxModeSelect.addEventListener('change', updateGrandTotal);
    }

    if (purchaseTbody) {
        purchaseTbody.addEventListener('click', deleteRow);

        purchaseTbody.addEventListener('input', async (event) => {
            if (event.target.classList.contains('item-input')) {
                const inputElement = event.target;
                const query = inputElement.value.trim();
                if (query.length > 0) {
                    const items = await fetchItems(query);
                    showItemSuggestions(items, inputElement);
                    focusedSuggestionIndex = -1; // Reset focus
                } else {
                    const suggestionsContainer = inputElement.nextElementSibling;
                    suggestionsContainer.classList.add('hidden');
                }
            } else if (event.target.classList.contains('purchase-quantity-input') || event.target.classList.contains('purchase-price-input') || event.target.classList.contains('purchase-discount-input')) {
                const row = event.target.closest('tr');
                calculateRowTotal(row);
            }
        });

        purchaseTbody.addEventListener('keydown', (event) => {
            if (event.target.classList.contains('item-input')) {
                const inputElement = event.target;
                const suggestionsContainer = inputElement.nextElementSibling;
                handleAutocompleteKeyDown(event, suggestionsContainer);
            }
        });
    }

    supplierNameInput.addEventListener('input', async () => {
        const query = supplierNameInput.value.trim();
        if (query.length > 0) {
            const contacts = await fetchContacts(query);
            showSupplierSuggestions(contacts);
            focusedSuggestionIndex = -1; // Reset focus
        } else {
            supplierSuggestions.classList.add('hidden');
        }
    });

    supplierNameInput.addEventListener('keydown', (event) => {
        handleAutocompleteKeyDown(event, supplierSuggestions);
    });

    document.addEventListener('click', (event) => {
        if (!supplierNameInput.contains(event.target)) {
            supplierSuggestions.classList.add('hidden');
        }
        document.querySelectorAll('.item-suggestions').forEach(container => {
            if (!container.previousElementSibling.contains(event.target)) {
                container.classList.add('hidden');
            }
        });
    });

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const items = [];
            purchaseTbody.querySelectorAll('tr').forEach(row => {
                const itemId = row.dataset.itemId;
                if (itemId) {
                    const quantity = parseInt(row.querySelector('.purchase-quantity-input').value, 10);
                    const purchasePrice = parseFloat(row.querySelector('.purchase-price-input').value);
                    const sellingPrice = parseFloat(row.querySelector('.purchase-selling-price-input').value);
                    items.push({ itemId, quantity, purchasePrice, sellingPrice });
                }
            });

            if (items.length === 0) {
                alert('Please add at least one item to the purchase.');
                return;
            }

            const purchaseData = {
                supplierName: document.getElementById('supplier_name').value,
                purchaseDate: document.getElementById('invoice_date').value ? new Date(document.getElementById('invoice_date').value).toISOString() : new Date().toISOString(),
                items: items,
                subtotal: parseFloat(document.querySelector('.sale-total-amount-input').value.replace(/,/g, '')),
                vat: parseFloat(document.querySelector('.sale-vat-input').value.replace(/,/g, '')),
                total: parseFloat(document.querySelector('.sale-amount-due-input').value.replace(/,/g, '')),
            };

            modalSummary.innerHTML = `
                <p><strong>Supplier:</strong> ${purchaseData.supplierName}</p>
                <p><strong>Total Amount:</strong> ${purchaseData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            `;
            modal.classList.remove('hidden');
        });
    }

    confirmPurchaseBtn.addEventListener('click', async () => {
        modal.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const items = [];
        purchaseTbody.querySelectorAll('tr').forEach(row => {
            const itemId = row.dataset.itemId;
            if (itemId) {
                const quantity = parseInt(row.querySelector('.purchase-quantity-input').value, 10);
                const purchasePrice = parseFloat(row.querySelector('.purchase-price-input').value);
                const sellingPrice = parseFloat(row.querySelector('.purchase-selling-price-input').value);
                items.push({ itemId, quantity, purchasePrice, sellingPrice });
            }
        });

        const purchaseData = {
            supplierName: document.getElementById('supplier_name').value,
            purchaseDate: document.getElementById('invoice_date').value ? new Date(document.getElementById('invoice_date').value).toISOString() : new Date().toISOString(),
            items: items,
            subtotal: parseFloat(document.querySelector('.sale-total-amount-input').value.replace(/,/g, '')),
            vat: parseFloat(document.querySelector('.sale-vat-input').value.replace(/,/g, '')),
            total: parseFloat(document.querySelector('.sale-amount-due-input').value.replace(/,/g, '')),
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
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    cancelPurchaseBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Initial calculation
    updateGrandTotal();
});
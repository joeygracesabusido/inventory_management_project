document.addEventListener('DOMContentLoaded', () => {
    const contactsInput = document.getElementById('customer_name');
    const contactsSuggestions = document.getElementById('customer-suggestions');
    const salesOrderTbody = document.getElementById('sales-order-tbody');
    const addNewLineBtn = document.getElementById('add-new-line-btn');
    const taxModeSelect = document.getElementById('tax-mode');
    const salesOrderForm = document.getElementById('sales-order-form');
    const modal = document.getElementById('confirmation-modal');
    const modalSummary = document.getElementById('modal-summary');
    const confirmSaleBtn = document.getElementById('confirm-sale-btn');
    const cancelSaleBtn = document.getElementById('cancel-sale-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

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

    const showContactSuggestions = (contacts, query) => {
        contactsSuggestions.innerHTML = '';
        if (contacts.length > 0) {
            contacts.forEach(contact => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
                suggestion.textContent = contact.contactName;
                suggestion.addEventListener('click', () => {
                    contactsInput.value = contact.contactName;
                    contactsSuggestions.classList.add('hidden');
                });
                contactsSuggestions.appendChild(suggestion);
            });
        }

        const createOption = document.createElement('div');
        createOption.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200', 'text-indigo-600');
        createOption.innerHTML = `<i class="fas fa-plus mr-2"></i> Create "${query}"`;
        createOption.addEventListener('click', () => {
            window.location.href = '/add_contact';
        });
        contactsSuggestions.appendChild(createOption);

        contactsSuggestions.classList.remove('hidden');
    };

    const fetchItems = async (query) => {
        const GQL_QUERY = `
            query GetItemsAutocomplete($search: String) {
                getItemsAutocomplete(search: $search) {
                    items {
                        id
                        name
                        salePrice
                        salesTaxRate
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

    const fetchSellingPriceFromStock = async (itemId) => {
        const GQL_QUERY = `
            query GetItemSellingPriceFromStock($itemId: String!) {
                getItemSellingPriceFromStock(itemId: $itemId)
            }
        `;
        try {
            const responseData = await graphqlFetch(GQL_QUERY, { itemId });
            if (responseData.errors) {
                console.error('Error fetching selling price from stock:', responseData.errors);
                return null;
            }
            return responseData.data?.getItemSellingPriceFromStock;
        } catch (error) {
            console.error('Network error:', error);
            return null;
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
                suggestionElement.addEventListener('click', async () => {
                    const row = inputElement.closest('tr');
                    row.dataset.itemId = item.id;
                    inputElement.value = item.name;
                    const priceInput = row.querySelector('.sale-price-input');
                    const taxInput = row.querySelector('.sale-tax-input');
                    
                    // Fetch selling price from stock
                    const sellingPriceFromStock = await fetchSellingPriceFromStock(item.id);

                    if (priceInput) {
                        priceInput.value = sellingPriceFromStock !== null ? sellingPriceFromStock : item.salePrice;
                    }
                    if (taxInput) {
                        taxInput.value = item.salesTaxRate;
                    }
                    calculateRowTotal(row);
                    suggestionsContainer.classList.add('hidden');
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
        }
        suggestionsContainer.classList.remove('hidden');
    };

    const calculateRowTotal = (row) => {
        const quantityInput = row.querySelector('.sale-quantity-input');
        const priceInput = row.querySelector('.sale-price-input');
        const discountInput = row.querySelector('.sale-discount-input');
        const totalInput = row.querySelector('.sale-total-input');

        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;

        const total = (quantity * price) - discount;
        totalInput.value = total.toFixed(2);
        updateGrandTotal();
    };

    const updateGrandTotal = () => {
        let subtotal = 0;
        document.querySelectorAll('.sale-total-input').forEach(input => {
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
            <td class="px-6 py-4 whitespace-nowrap"><input type="text"  class="w-full border-none sale-description-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none sale-quantity-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none sale-price-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none sale-tax-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none sale-discount-input"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none sale-total-input" readonly></td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button type="button" class="delete-row-btn text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        salesOrderTbody.appendChild(newRow);
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

    if (salesOrderTbody) {
        salesOrderTbody.addEventListener('click', deleteRow);

        salesOrderTbody.addEventListener('input', async (event) => {
            if (event.target.classList.contains('item-input')) {
                const inputElement = event.target;
                const query = inputElement.value.trim();
                if (query.length > 0) {
                    const items = await fetchItems(query);
                    showItemSuggestions(items, inputElement);
                } else {
                    const suggestionsContainer = inputElement.nextElementSibling;
                    suggestionsContainer.classList.add('hidden');
                }
            } else if (event.target.classList.contains('sale-quantity-input') || event.target.classList.contains('sale-price-input') || event.target.classList.contains('sale-discount-input')) {
                const row = event.target.closest('tr');
                calculateRowTotal(row);
            }
        });
    }

    if (salesOrderForm) {
        salesOrderForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const items = [];
            salesOrderTbody.querySelectorAll('tr').forEach(row => {
                const itemId = row.dataset.itemId;
                if (itemId) {
                    const quantity = parseFloat(row.querySelector('.sale-quantity-input').value) || 0;
                    const salePrice = parseFloat(row.querySelector('.sale-price-input').value) || 0;
                    items.push({ itemId, quantity, salePrice });
                }
            });

            const salesOrderData = {
                customerName: contactsInput.value,
                invoiceDate: document.getElementById('invoice_date').value,
                items: items,
                subtotal: parseFloat(document.querySelector('.sale-total-amount-input').value.replace(/,/g, '')),
                vat: parseFloat(document.querySelector('.sale-vat-input').value.replace(/,/g, '')),
                total: parseFloat(document.querySelector('.sale-amount-due-input').value.replace(/,/g, ''))
            };

            modalSummary.innerHTML = `
                <p><strong>Customer:</strong> ${salesOrderData.customerName}</p>
                <p><strong>Total Amount:</strong> ${salesOrderData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            `;
            modal.classList.remove('hidden');
        });
    }

    confirmSaleBtn.addEventListener('click', async () => {
        modal.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const items = [];
        salesOrderTbody.querySelectorAll('tr').forEach(row => {
            const itemId = row.dataset.itemId;
            if (itemId) {
                const quantity = parseFloat(row.querySelector('.sale-quantity-input').value) || 0;
                const salePrice = parseFloat(row.querySelector('.sale-price-input').value) || 0;
                items.push({ itemId, quantity, salePrice });
            }
        });

        const salesOrderData = {
            customerName: contactsInput.value,
            invoiceDate: document.getElementById('invoice_date').value,
            items: items,
            subtotal: parseFloat(document.querySelector('.sale-total-amount-input').value.replace(/,/g, '')),
            vat: parseFloat(document.querySelector('.sale-vat-input').value.replace(/,/g, '')),
            total: parseFloat(document.querySelector('.sale-amount-due-input').value.replace(/,/g, ''))
        };

        const GQL_MUTATION = `
            mutation CreateSalesOrder($salesOrderData: SalesOrderCreate!) {
                createSalesOrder(salesOrderData: $salesOrderData) {
                    id
                }
            }
        `;

        try {
            const responseData = await graphqlFetch(GQL_MUTATION, { salesOrderData });
            if (responseData.errors) {
                console.error('Error creating sales order:', responseData.errors);
                alert(`Error creating sales order: ${responseData.errors[0].message}`);
            } else {
                alert('Sales order created successfully!');
                window.location.reload();
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. See console for details.');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    cancelSaleBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    contactsInput.addEventListener('input', async () => {
        const query = contactsInput.value.trim();
        if (query.length > 0) {
            const contacts = await fetchContacts(query);
            showContactSuggestions(contacts, query);
        } else {
            contactsSuggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', (event) => {
        if (!contactsInput.contains(event.target)) {
            contactsSuggestions.classList.add('hidden');
        }

        document.querySelectorAll('.item-suggestions').forEach(container => {
            if (!container.previousElementSibling.contains(event.target)) {
                container.classList.add('hidden');
            }
        });
    });

    // Initial calculation
    updateGrandTotal();
});
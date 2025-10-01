document.addEventListener('DOMContentLoaded', () => {
    const itemNameInput = document.getElementById('item_name');
    const itemSuggestions = document.getElementById('item-suggestions');
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportTbody = document.getElementById('report-tbody');

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
            selectedItemId = null;
        }
    });

    document.addEventListener('click', (event) => {
        if (!itemNameInput.contains(event.target)) {
            itemSuggestions.classList.add('hidden');
        }
    });

    generateReportBtn.addEventListener('click', async () => {
        const startDate = startDateInput.value ? new Date(startDateInput.value).toISOString() : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value).toISOString() : null;

        const GQL_QUERY = `
            query InventoryValuationReport($itemId: String, $startDate: DateTime, $endDate: DateTime) {
                inventoryValuationReport(itemId: $itemId, startDate: $startDate, endDate: $endDate) {
                    date
                    type
                    transactionId
                    quantity
                    rate
                    value
                    profitMargin
                    runningQuantity
                    runningValue
                }
            }
        `;

        const variables = {
            itemId: selectedItemId,
            startDate: startDate,
            endDate: endDate,
        };

        let responseData;
        try {
            responseData = await graphqlFetch(GQL_QUERY, variables);
            if (responseData.errors) {
                console.error('Error fetching report:', responseData.errors);
                alert(`Error fetching report: ${responseData.errors[0].message}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. See console for details.');
        }
        finally {
            // This block was added by me to fix a bug where the table was not cleared
            // if the report failed to fetch.
            populateReportTable(responseData?.data?.inventoryValuationReport || []);
        }
    });

    const populateReportTable = (reportData) => {
        reportTbody.innerHTML = '';
        if (reportData.length === 0) {
            reportTbody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No data available for the selected criteria.</td></tr>';
            return;
        }

        reportData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(row.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.type}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.transactionId}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.quantity.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.rate.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.value.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.profitMargin.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.runningQuantity.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${row.runningValue.toFixed(2)}</td>
            `;
            reportTbody.appendChild(tr);
        });
    };
});

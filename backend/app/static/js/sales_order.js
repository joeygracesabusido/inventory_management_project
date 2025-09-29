document.addEventListener('DOMContentLoaded', () => {
    const contactsInput = document.getElementById('customer_name');
    const contactsSuggestions = document.getElementById('customer-suggestions');
    const salesOrderTbody = document.getElementById('sales-order-tbody');
    const addNewLineBtn = document.getElementById('add-new-line-btn');

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

    const addNewRow = () => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap"><input type="text" placeholder="Enter an item..." class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="text"  class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"><input type="number"  class="w-full border-none"></td>
            <td class="px-6 py-4 whitespace-nowrap"></td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button type="button" class="delete-row-btn text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        salesOrderTbody.appendChild(newRow);
    };

    const deleteRow = (event) => {
        const btn = event.target.closest('.delete-row-btn');
        if (btn) {
            btn.closest('tr').remove();
        }
    };

    if (addNewLineBtn) {
        addNewLineBtn.addEventListener('click', addNewRow);
    }

    if (salesOrderTbody) {
        salesOrderTbody.addEventListener('click', deleteRow);
    }

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
    });
});
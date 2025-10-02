document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:8000/graphql';
    const accessToken = localStorage.getItem('accessToken');

    async function fetchCogsReport() {
        const query = `
            query {
                cogsPerItemReport {
                    itemName
                    quantitySold
                    costOfSales
                    saleAmount
                    profitMargin
                }
            }
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ query })
            });

            const result = await response.json();
            if (result.errors) {
                console.error('Error fetching COGS report:', result.errors);
                return;
            }

            const reportData = result.data.cogsPerItemReport;
            const reportTbody = document.getElementById('cogs-report-tbody');
            reportTbody.innerHTML = '';

            reportData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.itemName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.quantitySold}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.costOfSales.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.saleAmount.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.profitMargin.toFixed(2)}</td>
                `;
                reportTbody.appendChild(row);
            });

        } catch (error) {
            console.error('Error fetching COGS report:', error);
        }
    }

    fetchCogsReport();
});

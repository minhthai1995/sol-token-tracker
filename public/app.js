document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mintForm');
    const loader = document.getElementById('loader');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const mint = formData.get('mintAddress');
        const wallets = formData.get('wallets').split('\n').map(wallet => wallet.trim()).filter(wallet => wallet !== '');

        // Initiate polling with the new mint and wallets
        startPolling(mint, wallets);
    });
});

function startPolling(mint, wallets) {
    const loader = document.getElementById('loader');
    const interval = 5000;  // Polling interval in milliseconds

    // Clear any existing intervals to prevent multiple intervals running
    if (window.pollInterval) {
        clearInterval(window.pollInterval);
    }

    // Define the polling function
    async function pollData() {
        loader.style.display = 'block';
        try {
            const response = await fetch(`/data?mint=${encodeURIComponent(mint)}&wallets=${encodeURIComponent(wallets.join('\n'))}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            displayData(data);
        } catch (error) {
            console.error('There was a problem fetching the data:', error);
        } finally {
            loader.style.display = 'none';
        }
    }

    // Start polling
    pollData(); // Initial call
    window.pollInterval = setInterval(pollData, interval); // Subsequent polls
}

function displayData(data) {
    const tableBody = document.getElementById('accountData');
    tableBody.innerHTML = '';

    data.forEach(account => {
        const row = document.createElement('tr');
        // const addressCell = document.createElement('td');
        // addressCell.textContent = account.address;
        // const amountCell = document.createElement('td');
        // amountCell.textContent = account.amount;
        const ownerCell = document.createElement('td');
        ownerCell.textContent = account.owner;
        const percentageCell = document.createElement('td');
        percentageCell.textContent = account.percentage;

        // row.appendChild(addressCell);
        // row.appendChild(amountCell);
        row.appendChild(ownerCell);
        row.appendChild(percentageCell);
        tableBody.appendChild(row);
    });
}

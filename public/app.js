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
            displayData(data, wallets);
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

function displayData(data, excludedWallets) {
    const tableBody = document.getElementById('accountData');
    const excludedTableBody = document.getElementById('excludedWallets');
    tableBody.innerHTML = '';
    excludedTableBody.innerHTML = '';

    let totalTokens = data.reduce((sum, account) => sum + parseFloat(account.amount), 0);

    data.forEach(account => {
        if (!excludedWallets.includes(account.owner)) {
            const row = document.createElement('tr');
            const ownerCell = document.createElement('td');
            ownerCell.textContent = account.owner;
            const percentageCell = document.createElement('td');
            percentageCell.textContent = ((account.amount / totalTokens) * 100).toFixed(2) + '%';

            row.appendChild(ownerCell);
            row.appendChild(percentageCell);
            tableBody.appendChild(row);
        }
    });

    excludedWallets.forEach(wallet => {
        let account = data.find(account => account.owner === wallet);
        if (account) {
            const row = document.createElement('tr');
            const ownerCell = document.createElement('td');
            ownerCell.textContent = account.owner;
            const amountCell = document.createElement('td');
            amountCell.textContent = account.amount;
            const percentageCell = document.createElement('td');
            percentageCell.textContent = ((account.amount / totalTokens) * 100).toFixed(2) + '%';

            row.appendChild(ownerCell);
            row.appendChild(amountCell);
            row.appendChild(percentageCell);
            excludedTableBody.appendChild(row);
        }
    });
}

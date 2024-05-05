let currentMint = '';  // Variable to store the current mint address

document.getElementById('mintForm').addEventListener('submit', function(event) {
    event.preventDefault();
    currentMint = document.getElementById('mintAddress').value;
    fetchData(currentMint);  // Call fetchData with the new mint address
});

async function fetchData(mint) {
    const response = await fetch('/data?mint=' + encodeURIComponent(mint));
    const accounts = await response.json();
    const tableBody = document.getElementById('accountData');
    tableBody.innerHTML = '';
    accounts.forEach(account => {
        const row = `<tr>
            <td>${account.owner}</td>
            <td>${account.amount}</td>
            <td>${account.percentage}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Set interval to refresh data every 5 seconds
setInterval(() => {
    fetchData(currentMint);  // Continuously fetch data with the current mint
}, 5000);

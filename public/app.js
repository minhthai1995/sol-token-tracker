// document.addEventListener('DOMContentLoaded', function () {
//     const form = document.getElementById('mintForm');

//     form.addEventListener('submit', async function (event) {
//         event.preventDefault();
//         const formData = new FormData(form);
//         const mint = formData.get('mintAddress');
//         const wallets = formData.get('wallets');

//         try {
//             const response = await fetch('/data?mint=' + encodeURIComponent(mint) + '&wallets=' + encodeURIComponent(wallets), {
//                 method: 'GET',
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
//             displayData(data);
//         } catch (error) {
//             console.error('There was a problem fetching the data:', error);
//         }
//     });
// });

// function displayData(data) {
//     const tableBody = document.getElementById('accountData');
//     tableBody.innerHTML = '';

//     data.forEach(account => {
//         const row = document.createElement('tr');

//         const addressCell = document.createElement('td');
//         addressCell.textContent = account.address;
//         row.appendChild(addressCell);

//         const amountCell = document.createElement('td');
//         amountCell.textContent = account.amount;
//         row.appendChild(amountCell);

//         const ownerCell = document.createElement('td');
//         ownerCell.textContent = account.owner;
//         row.appendChild(ownerCell);

//         const percentageCell = document.createElement('td');
//         percentageCell.textContent = account.percentage;
//         row.appendChild(percentageCell);

//         tableBody.appendChild(row);
//     });
// }


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mintForm');
    const loader = document.getElementById('loader');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const mint = formData.get('mintAddress');
        const wallets = formData.get('wallets');

        // Show loader
        loader.style.display = 'block';

        try {
            const response = await fetch('/data?mint=' + encodeURIComponent(mint) + '&wallets=' + encodeURIComponent(wallets), {
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
            // Hide loader regardless of the outcome
            loader.style.display = 'none';
        }
    });
});

function displayData(data) {
    const tableBody = document.getElementById('accountData');
    tableBody.innerHTML = '';

    data.forEach(account => {
        const row = document.createElement('tr');
        const addressCell = document.createElement('td');
        addressCell.textContent = account.address;
        // const amountCell = document.createElement('td');
        // amountCell.textContent = account.amount;
        const ownerCell = document.createElement('td');
        ownerCell.textContent = account.owner;
        const percentageCell = document.createElement('td');
        percentageCell.textContent = account.percentage;

        row.appendChild(addressCell);
        // row.appendChild(amountCell);
        row.appendChild(ownerCell);
        row.appendChild(percentageCell);
        tableBody.appendChild(row);
    });
}

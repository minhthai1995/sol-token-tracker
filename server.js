import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = `https://mainnet.helius-rpc.com/?api-key=e05277ba-444e-4bd0-86aa-b7993cf14ad6`;
const mint = "6ftUfgx5U5GLwygn36nyBbPAayRzDTNze65drJWwtNpx";

// Function to read excluded wallets from a file
async function readExcludedWallets() {
  try {
    const data = await fs.promises.readFile(path.join(__dirname, 'wallets.txt'), 'utf8');
    return new Set(data.split('\n').map(line => line.trim()).filter(line => line));
  } catch (error) {
    console.error('Failed to read wallets.txt:', error);
    return new Set();
  }
}

async function findHolders() {
    const excludedWallets = await readExcludedWallets();
    console.log(excludedWallets);
    let page = 1;
    let allAccounts = [];
    let continueFetching = true;
    let totalTokens = 0;

    while (continueFetching) {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getTokenAccounts",
                id: "helius-test",
                params: { page, limit: 1000, displayOptions: {}, mint }
            }),
        });

        const data = await response.json();
        if (!data.result || data.result.token_accounts.length === 0) {
            continueFetching = false;
        } else {
            data.result.token_accounts.forEach(account => {
                if (!excludedWallets.has(account.owner)) {
                    allAccounts.push({
                        address: account.address,
                        owner: account.owner,
                        amount: account.amount,
                        frozen: account.frozen
                    });
                    totalTokens += account.amount;
                }
            });
            page++;
        }
    }

    if (totalTokens > 0) {
        allAccounts = allAccounts.map(account => ({
            ...account,
            percentage: ((account.amount / totalTokens) * 100).toFixed(2) + '%'
        }));
    }

    allAccounts.sort((a, b) => b.amount - a.amount);
    fs.writeFileSync("output.json", JSON.stringify(allAccounts, null, 2));
    console.log('All data has been processed and saved.');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'output.json'));
});

setInterval(findHolders, 5000);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    findHolders(); // Initial fetch
});

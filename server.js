import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mint = "";
const url = `https://mainnet.helius-rpc.com/?api-key=e05277ba-444e-4bd0-86aa-b7993cf14ad6`;
app.use(express.static('public'));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
let wallets = []

async function findHolders(mint, wallets) {
    let page = 1;
    let allAccounts = [];
    let continueFetching = true;
    let totalTokens = 0;
    const decimals = 9; // Token has 9 decimal places

    while (continueFetching) {
        try {
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
                    let convertedAmount = account.amount / Math.pow(10, decimals); // Convert amount
                    if (!wallets.includes(account.address)) {
                        allAccounts.push({
                            address: account.address,
                            owner: account.owner,
                            amount: convertedAmount, // Store converted amount
                            frozen: account.frozen
                        });
                    }
                    totalTokens += convertedAmount;
                });
                page++;
            }
        } catch (error) {
            console.error('Error fetching token accounts:', error);
            continueFetching = false;
        }
    }

    if (totalTokens > 0) {
        allAccounts = allAccounts.map(account => ({
            ...account,
            percentage: ((account.amount / totalTokens) * 100).toFixed(2) + '%'
        }));
    }

    allAccounts.sort((a, b) => b.amount - a.amount);
    return allAccounts;
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', async (req, res) => {
    mint = req.query.mint;
    wallets = req.query.wallets.split('\n').map(wallet => wallet.trim()).filter(wallet => wallet !== '');
    const data = await findHolders(mint, wallets);
    res.json(data); // Send data as JSON
});

// Scheduling the task every 5 seconds to refresh the data for the default mint
cron.schedule('*/5 * * * * *', async () => {
    const data = await findHolders(mint, wallets);
    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(data, null, 2));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultMint = "6ftUfgx5U5GLwygn36nyBbPAayRzDTNze65drJWwtNpx";
const url = `https://mainnet.helius-rpc.com/?api-key=e05277ba-444e-4bd0-86aa-b7993cf14ad6`;
app.use(express.static('public'));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

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

async function findHolders(mint) {
    const excludedWallets = await readExcludedWallets();
    let page = 1;
    let allAccounts = [];
    let continueFetching = true;
    let totalTokens = 0;

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
    const mint = req.query.mint || defaultMint;
    const data = await findHolders(mint);
    res.json(data); // Send data as JSON
});

// Scheduling the task every 5 seconds to refresh the data for the default mint
cron.schedule('*/5 * * * * *', async () => {
    const data = await findHolders(defaultMint);
    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(data, null, 2));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

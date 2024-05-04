// index.js
import fs from 'fs';
import fetch from 'node-fetch';  // Import fetch as an ES Module

const url = `https://mainnet.helius-rpc.com/?api-key=e05277ba-444e-4bd0-86aa-b7993cf14ad6`;

async function findHolders() {
  let page = 1;
  let allAccounts = [];
  let continueFetching = true;

  while (continueFetching) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccounts",
        id: "helius-test",
        params: {
          page: page,
          limit: 1000, // adjust based on how many you want to fetch at once
          displayOptions: {},
          mint: "6ftUfgx5U5GLwygn36nyBbPAayRzDTNze65drJWwtNpx",
        },
      }),
    });

    const data = await response.json();
    if (!data.result || data.result.token_accounts.length === 0) {
      console.log(`No more results. Total pages processed: ${page - 1}`);
      continueFetching = false;
    } else {
      data.result.token_accounts.forEach(account => {
        allAccounts.push({
          address: account.address,
          owner: account.owner,
          amount: account.amount,
          frozen: account.frozen
        });
      });
      page++;
    }
  }

  allAccounts.sort((a, b) => b.amount - a.amount);
  fs.writeFileSync("output.json", JSON.stringify(allAccounts, null, 2));
  console.log('All data has been processed and saved.');
}

findHolders();

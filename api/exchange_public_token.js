const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req, res) {
  const { public_token } = req.body;

  try {
    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const access_token = tokenResponse.data.access_token;

    // Fetch investment holdings
    const holdingsResponse = await plaidClient.investmentsHoldingsGet({
      access_token,
    });

    const holdings = holdingsResponse.data.holdings;
    const total = holdings.reduce((sum, h) => sum + (h.market_value || 0), 0);

    res.status(200).json({
      access_token,
      total: Math.round(total),
      holdings: holdings.slice(0, 5), // Top 5 for demo
    });
  } catch (error) {
    console.error('Plaid Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}

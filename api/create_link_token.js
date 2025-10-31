const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Change to 'development' later
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req, res) {
  const { user_id = 'demo_user' } = req.body;

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user_id },
      client_name: 'Growyo 401k',
      products: ['investments'],
      country_codes: ['US'],
      language: 'en',
    });

    res.status(200).json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
}

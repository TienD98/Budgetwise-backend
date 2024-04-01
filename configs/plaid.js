// configuration for the plaid API request
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const plaidConfiguration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.CLIENT_ID,
            'PLAID-SECRET': process.env.SECRET,
        },
    },
});

const plaidClient = new PlaidApi(plaidConfiguration);

module.exports = plaidClient
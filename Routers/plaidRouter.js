const express = require('express');
const plaidClient = require('../configs/plaid');
const plaidRouter = express.Router();

/**
 * @swagger
 * /plaid/create_link_token:
 *  post:
 *      summary: Upload the transformed transactions to database. 
 *      tags: [Plaid]        
 *      description: Creates a Link token for the Plaid API to initialize Link and fetch transactions.
 *      responses:
 *          200:
 *              description:  Link Token created successfully
 *          500:
 *              description: Internal server error, failed to create Link Token
 */
plaidRouter.post('/create_link_token', async function (request, response) {
    const plaidRequest = {
        user: {
            client_user_id: 'user',
        },
        client_name: 'Plaid Test App',
        products: ['transactions'],
        transactions: {
            days_requested: 365,
        },
        language: 'en',
        redirect_uri: 'http://localhost:5173/',
        country_codes: ['US'],
        account_filters: {
            credit: {
                account_subtypes: ['credit card']
            }
        }
    };
    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error) {
        // handle error
        response.status(500).send(error);

    }
});

/**
 * @swagger
 * /plaid/exchange_public_token:
 *  post:
 *      summary: Exchanges a public token for an access token from the Plaid API.. 
 *      tags: [Plaid]        
 *      description: Creates a Link token for the Plaid API to initialize Link and fetch transactions.
 *      requestBody:
 *          required: true
 *      responses:
 *          200:
 *              description:  Access Token retrieved successfully
 *          500:
 *              description: Internal server error, failed to retrieve access token
 */
plaidRouter.post('/exchange_public_token', async function (request, res, next,) {
    const publicToken = request.body.public_token;
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = response.data.access_token;
        // const itemID = response.data.item_id;
        res.status(200).send(accessToken);
    } catch (error) {
        // handle error
        res.status(500).send(error);
    }
});

module.exports = plaidRouter;
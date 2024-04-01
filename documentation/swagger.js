const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Budgetwise Backend API',
            version: '1.0.0',
            description: 'API documentation for Budgetwise backend',
        },
        servers: [{
            url: 'https://us-central1-budgetwise-challenge-fdc3f.cloudfunctions.net/budgetwiseAPI/'
        }]
    },
    apis: ['./Routers/transactionRouter.js', './Routers/plaidRouter.js'],
};

const swaggerSpecs = swaggerJsdoc(options);

module.exports = swaggerSpecs;
// import required modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const plaidRouter = require('./Routers/plaidRouter');
const transactionRouter = require('./Routers/transactionRouter.js');
const swaggerSpecs = require("./documentation/swagger.js");
const swaggerUi = require('swagger-ui-express');
const app = express(); // Initialize express application

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get('/', (request, response) => { response.status(200).send("Hello World!") });
app.use('/plaid', plaidRouter);
app.use('/transaction', transactionRouter);

module.exports = app;
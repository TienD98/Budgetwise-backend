// import required modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express(); //intialize express application
require('dotenv').config();

// middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

module.exports = app
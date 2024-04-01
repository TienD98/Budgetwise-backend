const express = require('express');
const plaidClient = require('../configs/plaid');
const tranRouter = express.Router();
const db = require("../database/db")

/**
 * @swagger
 * /transaction/:
 *  post:
 *      summary: Retrieve the credit card transactions  
 *      tags: [Transaction]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  example:
 *                      access_token: "access-sandbox-78610122-597e-42c2-ae3f-236011c35a74"
 *      description: "Retrieve all the credit card transactions from the past 12 month from the current up to the 12th month. \
 *                  Request body of access_token is required in order to gather the transactions from Plaid API. \
 *                  Once access_token retrieved then send along with request to Plaid API transactionsSync to get raw transactions. \
 *                  The helper function then called to transform raw transactions to transactions with specific fields."
 *      responses:
 *          200:
 *              description:  Success send a response of array of transaction objects  
 *          500:
 *              description: Failed to get the request
 */
tranRouter.post('/', async (req, res) => {
    const accessToken = req.body.access_token;
    const request = { access_token: accessToken };
    try {
        let response = await plaidClient.transactionsSync(request);
        await new Promise(resolve => setTimeout(resolve, 5000));
        response = await plaidClient.transactionsSync(request);

        const transactions = response.data.added;
        let filteredTrans = transactions.map(obj => {
            return {
                transaction_id: obj.transaction_id,
                name: obj.name,
                date: obj.date,
                amount: obj.amount,
                category: obj.personal_finance_category.primary
            }
        });
        res.status(200).send(filteredTrans);
    } catch (err) {
        // handle error
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /transaction/uploadDB:
 *  post:
 *      summary: Upload the transformed transactions to database. 
 *      tags: [Transaction]
 *      requestBody:
 *          required: true            
 *      description: "Uploads a list of transactions to the database. Each transaction object \
 *                  should contain the necessary information such as transaction ID, amount, \
 *                  date, and any other relevant details."
 *      responses:
 *          200:
 *              description:  Success upload the transactions to database.
 *          500:
 *              description: Failed to get the request
 */
tranRouter.post('/uploadDB', async (req, res) => {
    // Get a list of cities from your database
    try {
        const transactions = req.body.transactions;

        // Get a new write batch
        const batch = db.batch();

        transactions.forEach(obj => {
            const docRef = db.collection("transactions").doc();
            batch.set(docRef, obj);
        });

        batch.commit().then(() => {
            console.log("Batch write completed");
            res.status(200).send("Transaction added to DB");
        }).catch(err => { console.error(err.message); res.status(500).send(err.message) });
    } catch (error) {
        console.error(error.message);
    }
});

/**
 * @swagger
 * /transaction/calculate-budget:
 *  get:
 *      summary: Calculate Monthly Budget Amount
 *      tags: [Transaction]
 *      description: Calculate the average monthly budget for each category based on the user's transactions.
 *      responses:
 *          200:
 *              description:  Success send a response of object with category's amount spend monthly plus the total average spend monthly
 *          500:
 *              description: Failed to get the request
 *          404: 
 *              description: The database is empty
 */
tranRouter.get('/calculate-budget', async (req, res) => {
    try {
        // fetch for the snapshot of the collection stored in DB
        const snapShot = await db.collection('transactions').get();
        if (snapShot.empty) {
            console.log('No documents found in collection.');
            res.status(404).send('Not Found');
        } else { // if not empty then map all docs to an array and 
            const documents = []
            snapShot.forEach(doc => {
                documents.push(doc.data());
            });
            // call monthlyAverageCalculate func for monthly budget calculation
            const result = monthlyAverageCalculate(documents);

            res.status(200).send(result);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// monthlyAverageCalculate func take an array of transactions and 
// return a object of categories with amount then calculate for average
function monthlyAverageCalculate(trans) {

    // mapping the categories with the corresponding amounts
    const amountByCategory = trans.reduce((transMap, obj) => {
        // if the category is already listed in the Map then update the amount
        if (transMap.has(obj.category)) {
            transMap.set(obj.category, transMap.get(obj.category) + obj.amount);
        } else { // if not then add to the Map
            transMap.set(obj.category, obj.amount);
        }
        return transMap;
    }, new Map());

    // after mapping all the category amount then calculate for average
    let total = 0;
    amountByCategory.forEach((totalAmount, category) => {
        const average = totalAmount / 12;
        amountByCategory.set(category, average);
        total += average;
    });

    // mapping the average total spend monthly 
    amountByCategory.set("total", total);

    // Convert Map to Object
    const objectType = Object.fromEntries(amountByCategory);
    // Convert Object to Json
    const jsonType = JSON.stringify(objectType);

    return jsonType;
}

module.exports = tranRouter;
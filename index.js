const app = require('./app');
const PORT_LOCAL = process.env.PORT_LOCAL
const functions = require("firebase-functions");

// Start the Express server and listen on the specified port
app.listen(PORT_LOCAL, () => {
    console.log(`App is running on port ${PORT_LOCAL}`);
    // console.log(process.env.SECRET);
});
exports.budgetwiseAPI = functions.https.onRequest(app);
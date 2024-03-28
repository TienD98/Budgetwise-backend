const app = require('./app');
const PORT = process.env.PORT

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

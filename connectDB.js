const mongoose = require('mongoose');

module.exports = async () => {
    try {
        const url = process.env.MONGO_URI;
        const connection = await mongoose.connect(url, { dbName: 'messageBoard' });
        console.log('Connected to DB.')
        return connection;
    } catch (error) {
        console.log(error);
    }
}
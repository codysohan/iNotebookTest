const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://root:root@cluster0.ygqfchd.mongodb.net/iNotebook?retryWrites=true&w=majority";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB has been successfully connected!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectToMongo;

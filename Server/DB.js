// This is where the database starts and a connection is established
require("dotenv").config();
// Import all required modules
const mongoose = require("mongoose");
//set the strictQuery option to true so unwanted data doesn't get stored in the database.
mongoose.set("strictQuery", true);

//Function: initiates the Database
const ConnectDB = async () => {
  // Flag to keep track of Database connection
  try {
    //
    await mongoose.connect(process.env.DB_STRING);
    console.log("DB CONNECTED");
    // Return true if database connected
    return true;
  } catch (error) {
    // Return false if database not connected
    console.log(error);
    console.log(process.env.DB_STRING);
    return false;
  }
};

// Exports the Function to other modules to access
module.exports = ConnectDB;

// 0yQvpIdVxmijZJR0

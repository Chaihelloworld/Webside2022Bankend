var mysql = require('mysql');
require('dotenv').config()


var conn = mysql.createConnection({
  // host: process.env.IP, // Replace with your host name
  // user: process.env.USERNAME,      // Replace with your database username
  // password: process.env.PASSWORD,      // Replace with your database password
  // database: process.env.DB // // Replace with your database Name
  host:'127.0.0.1', // Replace with your host name
  user: 'root',      // Replace with your database username
  password: 'cdc2030.Password',      // Replace with your database password
  database: 'web_p' // // Replace with your database Name
  // database: 'resource_information' // // Replace with your database Name
}); 
 
 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;
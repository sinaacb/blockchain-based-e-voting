var express = require('express');
var router = express.Router();
var db=require('../database');

// another routes also appear here
// this script to fetch data from MySQL databse table
console.log("Fetching data from MySQL DB table registered_users");
router.get('/table_view', function(req, res, next) {
  var sql = 'SELECT * FROM registered_users';

  db.query(sql, (err, data, fields) => {
      if (err) {
          console.error("Error fetching data:", err);
          return res.status(500).send("Database query failed.");
      }

      console.log("Fetched Data from MySQL:", JSON.stringify(data, null, 2)); // Debugging

      if (!data.length) {
          console.log("No data found in registered_users table.");
      } else {
          console.log("User Data:", data); // Print actual fetched data
      }

      res.render('adminVoterReg', { 
          title: 'Registered Users List', 
          userData: data 
      });
  });
});



module.exports = router;
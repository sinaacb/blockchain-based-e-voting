var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: 'Sinaaaan',      
  database: 'main_project' 
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;
// get the client
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "Youtube",
  dateStrings: true,
});
// simple query
// connection.query("SELECT * FROM `users`", function (err, results, fields) {
//   if (err) {
//     console.error("Error executing query:", err);
//     return;
//   }
//   console.log(fields);
//   // results로부터 데이터 추출
//   let { id, email, name, created_at } = results[2];
//   console.log(id);
//   console.log(email);
//   console.log(name);
//   console.log(created_at);
// });

module.exports = connection; // 오타 수정

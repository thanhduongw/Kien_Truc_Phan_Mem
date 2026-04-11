const express = require('express');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'mysql',
  user: 'user',
  password: 'password',
  database: 'mydb'
});

app.get('/', (req, res) => {
  db.query('SELECT NOW() as time', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Connected to MySQL!', time: results[0].time });
  });
});

app.listen(3000, () => console.log('Server on port 3000'));
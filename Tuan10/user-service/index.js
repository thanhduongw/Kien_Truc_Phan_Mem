import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_NAME = 'user_service_db';

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sapassword',
  port: Number(process.env.DB_PORT || '3306')
};

let pool;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (res, error, status = 500, fallbackMessage) => {
  const message = fallbackMessage || error.message;
  return res.status(status).json({ message });
};

async function ensureDatabase() {
  const conn = await mariadb.createConnection(dbConfig);
  await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`ALTER DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

async function seedUsers() {
  const rows = await pool.query('SELECT * FROM users WHERE username = "admin"');
  if (rows.length === 0) {
    await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin', 'ADMIN']);
    await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', 'user', 'USER']);
  }
}

async function initDB(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await ensureDatabase();
      pool = mariadb.createPool({ ...dbConfig, database: DB_NAME, connectionLimit: 5 });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('USER', 'ADMIN') DEFAULT 'USER'
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      await seedUsers();
      console.log(`User Service Database initialized on ${dbConfig.host}`);
      return;
    } catch (error) {
      console.error(`User DB Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) await sleep(delay);
    }
  }

  console.error('User Service: Failed to connect to DB after all retries. Exiting.');
  process.exit(1);
}

app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'USER']);
    const rows = await pool.query('SELECT id, username, role FROM users WHERE username = ?', [username]);
    res.status(201).json(rows[0]);
  } catch (error) {
    fail(res, error, 400, 'User already exists or registration failed');
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const rows = await pool.query('SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return fail(res, error);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const rows = await pool.query('SELECT id, username, role FROM users');
    res.json(rows);
  } catch (error) {
    fail(res, error);
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
});

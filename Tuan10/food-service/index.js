import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';

const app = express();
const PORT = Number(process.env.PORT || 3002);
const DB_NAME = 'food_service_db';

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sapassword',
  port: Number(process.env.DB_PORT || '3306')
};

const seedFoods = [
  { name: 'Phở Bò', price: 50000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80', description: 'Phở bò truyền thống' },
  { name: 'Bánh Mì Thịt', price: 25000, image: 'https://images.unsplash.com/photo-1601050638917-3f0483810ef8?w=500&q=80', description: 'Bánh mì thịt nướng đặc biệt' },
  { name: 'Cà Phê Sữa Đá', price: 20000, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80', description: 'Cà phê rang xay nguyên chất' },
  { name: 'Bún Chả', price: 45000, image: 'https://images.unsplash.com/photo-1562967914-6c8ef81da6a5?w=500&q=80', description: 'Bún chả Hà Nội nướng than hồng' }
];

let pool;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (res, error, status = 500) => res.status(status).json({ message: error.message });

async function ensureDatabase() {
  const conn = await mariadb.createConnection(dbConfig);
  await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`ALTER DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

async function initDB(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await ensureDatabase();
      pool = mariadb.createPool({ ...dbConfig, database: DB_NAME, connectionLimit: 5 });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS foods (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price INT NOT NULL,
          image TEXT,
          description TEXT
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      await pool.query('ALTER TABLE foods CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

      const rows = await pool.query('SELECT * FROM foods');
      if (rows.length === 0) {
        for (const food of seedFoods) {
          await pool.query(
            'INSERT INTO foods (name, price, image, description) VALUES (?, ?, ?, ?)',
            [food.name, food.price, food.image, food.description]
          );
        }
      }

      console.log(`Food Service Database initialized on ${dbConfig.host}`);
      return;
    } catch (error) {
      console.error(`Food DB Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) await sleep(delay);
    }
  }

  console.error('Food Service: Failed to connect to DB after all retries. Exiting.');
  process.exit(1);
}

app.get('/api/foods', async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM foods');
    res.json(rows);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/foods', async (req, res) => {
  const { name, price, image, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO foods (name, price, image, description) VALUES (?, ?, ?, ?)',
      [name, price, image, description]
    );
    res.status(201).json({ id: Number(result.insertId), name, price, image, description });
  } catch (error) {
    fail(res, error);
  }
});

app.put('/api/foods/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image, description } = req.body;
  try {
    await pool.query('UPDATE foods SET name=?, price=?, image=?, description=? WHERE id=?', [name, price, image, description, id]);
    res.json({ id, name, price, image, description });
  } catch (error) {
    fail(res, error);
  }
});

app.delete('/api/foods/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM foods WHERE id=?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    fail(res, error);
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Food Service running on port ${PORT}`);
  });
});

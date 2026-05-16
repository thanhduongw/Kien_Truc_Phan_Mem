import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mariadb from 'mariadb';

const app = express();
const PORT = Number(process.env.PORT || 3004);
const DB_NAME = 'payment_service_db';

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sapassword',
  port: Number(process.env.DB_PORT || '3306')
};

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

let pool;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderId INT NOT NULL,
          method VARCHAR(50),
          status VARCHAR(50) DEFAULT 'Success',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      console.log(`Payment Service Database initialized on ${dbConfig.host}`);
      return;
    } catch (error) {
      console.error(`Payment DB Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) await sleep(delay);
    }
  }

  console.error('Payment Service: Failed to connect to DB after all retries. Exiting.');
  process.exit(1);
}

async function markOrderAsPaid(orderId) {
  const response = await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
    status: 'Paid'
  });

  return response.data;
}

app.post('/api/payments', async (req, res) => {
  const { orderId, method } = req.body;

  try {
    await pool.query('INSERT INTO payments (orderId, method) VALUES (?, ?)', [orderId, method]);
    const order = await markOrderAsPaid(orderId);

    console.log('--- NOTIFICATION ---');
    console.log(`User ${order.username} đã đặt đơn #${order.id} thành công`);
    console.log('--------------------');

    res.json({
      message: 'Payment processed and notification sent',
      order
    });
  } catch (error) {
    console.error('Payment error:', error.message);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
  });
});

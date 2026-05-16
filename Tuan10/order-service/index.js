import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mariadb from 'mariadb';
import rateLimit from 'express-rate-limit';
import {
  handleAll,
  retry,
  circuitBreaker,
  ExponentialBackoff,
  ConsecutiveBreaker,
  wrap,
  timeout,
  TimeoutStrategy
} from 'cockatiel';

const app = express();
const PORT = Number(process.env.PORT || 3003);
const DB_NAME = 'order_service_db';

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '[RateLimiter] Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimiter] Limit exceeded for IP ${req.ip}`);
    res.status(429).json(options.message);
  }
});
app.use('/api/orders', limiter);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sapassword',
  port: Number(process.env.DB_PORT || '3306')
};

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const FOOD_SERVICE_URL = process.env.FOOD_SERVICE_URL || 'http://localhost:3002';

const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({ initialDelay: 200, maxDelay: 2000 })
});
retryPolicy.onRetry(({ attempt }) => console.log(`[Retry] Attempt #${attempt}...`));

const cbPolicy = circuitBreaker(handleAll, {
  halfOpenAfter: 15000,
  breaker: new ConsecutiveBreaker(3)
});
cbPolicy.onBreak(() => console.warn('[CircuitBreaker] State: OPEN - downstream unavailable'));
cbPolicy.onReset(() => console.info('[CircuitBreaker] State: CLOSED - recovered'));
cbPolicy.onHalfOpen(() => console.info('[CircuitBreaker] State: HALF-OPEN - testing...'));

const timeoutPolicy = timeout(5000, TimeoutStrategy.Aggressive);
timeoutPolicy.onTimeout(() => console.warn('[TimeLimiter] Request timed out after 5s'));

const resilience = wrap(cbPolicy, retryPolicy, timeoutPolicy);

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
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          username VARCHAR(255) NOT NULL,
          total INT NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderId INT NOT NULL,
          foodId INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          price INT NOT NULL,
          FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      await pool.query('ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      await pool.query('ALTER TABLE order_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

      console.log(`Order Service Database initialized on ${dbConfig.host}`);
      return;
    } catch (error) {
      console.error(`Order DB Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) await sleep(delay);
    }
  }

  console.error('Order Service: Failed to connect to DB after all retries. Exiting.');
  process.exit(1);
}

async function fetchUserById(userId) {
  const userRes = await resilience.execute(() => axios.get(`${USER_SERVICE_URL}/api/users`));
  return userRes.data.find((u) => u.id === Number(userId));
}

async function fetchFoods() {
  const foodRes = await resilience.execute(() => axios.get(`${FOOD_SERVICE_URL}/api/foods`));
  return foodRes.data;
}

app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body;

  try {
    const user = await fetchUserById(userId);
    if (!user) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    const allFoods = await fetchFoods();
    let total = 0;

    const itemsToProcess = items.map((item) => {
      const food = allFoods.find((f) => f.id === Number(item.foodId));
      if (!food) {
        throw new Error(`Food item ${item.foodId} not found`);
      }

      total += food.price * item.quantity;
      return {
        foodId: food.id,
        name: food.name,
        quantity: item.quantity,
        price: food.price
      };
    });

    const orderResult = await pool.query(
      'INSERT INTO orders (userId, username, total) VALUES (?, ?, ?)',
      [userId, user.username, total]
    );

    const orderId = Number(orderResult.insertId);

    for (const item of itemsToProcess) {
      await pool.query(
        'INSERT INTO order_items (orderId, foodId, name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.foodId, item.name, item.quantity, item.price]
      );
    }

    return res.status(201).json({
      id: orderId,
      userId,
      username: user.username,
      total,
      status: 'Pending',
      items: itemsToProcess
    });
  } catch (error) {
    if (error.name === 'BrokenCircuitError') {
      return res.status(503).json({
        message: 'User or Food service is currently unavailable (Circuit Breaker active)'
      });
    }

    return fail(res, error);
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM orders');

    const enrichedOrders = [];
    for (const order of orders) {
      const items = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [order.id]);
      enrichedOrders.push({
        ...order,
        id: Number(order.id),
        items: items.map((item) => ({ ...item, id: Number(item.id), orderId: Number(item.orderId) }))
      });
    }

    res.json(enrichedOrders);
  } catch (error) {
    fail(res, error);
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query('UPDATE orders SET status=? WHERE id=?', [status, id]);
    const rows = await pool.query('SELECT * FROM orders WHERE id=?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(404).json({ message: 'Order not found' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
  });
});

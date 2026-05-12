import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 8084;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/payments', (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || typeof amount !== 'number') {
    return res.status(400).json({ message: 'bookingId and amount are required' });
  }

  const isSuccess = Math.random() >= 0.2;

  setTimeout(() => {
    if (isSuccess) {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: `TXN-${randomUUID()}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment rejected by bank'
      });
    }
  }, 400);
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const bookings = [];

// Create Booking
app.post('/bookings', async (req, res) => {
  try {
    const { userId, tourId, totalPrice } = req.body;
    if (!userId || !tourId || typeof totalPrice !== 'number') {
      return res.status(400).json({ message: 'userId, tourId, totalPrice are required' });
    }

    const booking = {
      id: randomUUID(),
      userId,
      tourId,
      totalPrice,
      status: 'PENDING',
      bookingDate: new Date().toISOString()
    };

    bookings.push(booking);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Booking Status
app.patch('/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = bookings.find((entry) => entry.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status || booking.status;
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Bookings
app.get('/bookings/user/:userId', async (req, res) => {
  try {
    const results = bookings.filter((entry) => entry.userId === req.params.userId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});

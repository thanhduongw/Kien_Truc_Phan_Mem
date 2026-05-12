import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Service URLs - Can be overridden by environment variables for LAN deployment
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8081';
const TOUR_SERVICE_URL = process.env.TOUR_SERVICE_URL || 'http://localhost:8082';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:8083';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8084';

// Proxy Login
app.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
  }
});

// Proxy Get Tours
app.get('/tours', async (req, res) => {
  try {
    const response = await axios.get(`${TOUR_SERVICE_URL}/tours`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
  }
});

// Proxy Get Tour Detail
app.get('/tours/:id', async (req, res) => {
  try {
    const response = await axios.get(`${TOUR_SERVICE_URL}/tours/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
  }
});

// Main Orchestration Flow: Book Tour
app.post('/book-tour', async (req, res) => {
  const { userId, tourId } = req.body;
  let bookingId = null;

  try {
    if (!userId || !tourId) {
      return res.status(400).json({
        success: false,
        message: 'userId and tourId are required'
      });
    }

    // 1. Validate User
    const userRes = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    const user = userRes.data;

    // 2. Get Tour Details
    const tourRes = await axios.get(`${TOUR_SERVICE_URL}/tours/${tourId}`);
    const tour = tourRes.data;

    // 3. Create Booking (Pending)
    const bookingRes = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, {
      userId,
      tourId,
      totalPrice: tour.price
    });
    const booking = bookingRes.data;
    bookingId = booking.id;

    // 4. Call Payment Service
    try {
      const paymentRes = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
        bookingId: booking.id,
        amount: tour.price
      });

      // 5. Payment Success -> Confirm Booking
      await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${bookingId}`, { status: 'CONFIRMED' });

      res.json({
        success: true,
        message: 'Booking completed successfully!',
        confirmationMessage: `Booking confirmed for ${user.name}`,
        data: {
          bookingId: bookingId,
          tourName: tour.name,
          amount: tour.price,
          transactionId: paymentRes.data.transactionId,
          status: 'CONFIRMED'
        }
      });

    } catch (paymentError) {
      // 5. Payment Failed -> Rollback Booking
      await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${bookingId}`, { status: 'CANCELLED' });

      res.status(400).json({
        success: false,
        message: 'Payment failed. Booking has been cancelled.',
        error: paymentError.response?.data?.message || 'Payment error'
      });
    }

  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'An error occurred during the booking process'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Orchestrator Service running on port ${PORT}`);
});

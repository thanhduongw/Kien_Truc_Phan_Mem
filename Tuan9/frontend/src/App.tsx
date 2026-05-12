import { useEffect, useState } from 'react';
import { bookTour, getTourDetail, getTours, login } from './services/api';
import './App.css';

type User = {
  id: string;
  name: string;
  email: string;
};

type Tour = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
};

type Status = {
  type: 'success' | 'error' | 'info';
  message: string;
};

type BookingResult = {
  success: boolean;
  message: string;
  confirmationMessage?: string;
  data?: {
    bookingId: string;
    tourName: string;
    amount: number;
    transactionId?: string;
    status?: string;
  };
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [loadingTours, setLoadingTours] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      setLoadingTours(true);
      try {
        const data = await getTours();
        setTours(data);
      } catch (error: any) {
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Unable to load tours'
        });
      } finally {
        setLoadingTours(false);
      }
    };

    fetchTours();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setStatus(null);

    try {
      const data = await login(email, password);
      setUser(data);
      setStatus({ type: 'success', message: `Welcome ${data.name}` });
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Login failed'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStatus({ type: 'info', message: 'Signed out' });
  };

  const handleSelectTour = async (tourId: string) => {
    setSelectedTour(null);
    setBookingResult(null);
    setStatus(null);

    try {
      const detail = await getTourDetail(tourId);
      setSelectedTour(detail);
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to load tour detail'
      });
    }
  };

  const handleBookTour = async () => {
    if (!user || !selectedTour) {
      setStatus({
        type: 'error',
        message: 'Please sign in and select a tour before booking'
      });
      return;
    }

    setBookingLoading(true);
    setBookingResult(null);
    setStatus(null);

    try {
      const result = await bookTour(user.id, selectedTour.id);
      setBookingResult(result);
      setStatus({
        type: result.success ? 'success' : 'error',
        message: result.message
      });
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Booking failed'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="logo">Travel Booking</div>
          <div className="sub">Orchestration-driven SOA demo</div>
        </div>
        <div className="user-chip">
          {user ? (
            <div className="user-info">
              <span>Signed in as {user.name}</span>
              <button className="link" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </header>

      {status && <div className={`status ${status.type}`}>{status.message}</div>}

      <div className="grid">
        <section className="card">
          <h2>Login</h2>
          <p className="muted">Use a demo account to access booking.</p>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="duong@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="123456"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button className="button" onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="hint">Demo: duong@example.com / 123456</div>
        </section>

        <section className="card">
          <h2>Tours</h2>
          {loadingTours ? (
            <div className="muted">Loading tours...</div>
          ) : (
            <div className="tour-list">
              {tours.map((tour) => (
                <button
                  key={tour.id}
                  className={`tour-item ${selectedTour?.id === tour.id ? 'active' : ''}`}
                  onClick={() => handleSelectTour(tour.id)}
                >
                  <div className="tour-name">{tour.name}</div>
                  <div className="tour-meta">
                    <span>{tour.duration}</span>
                    <span className="price">{formatMoney(tour.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card detail">
        <h2>Tour Detail</h2>
        {selectedTour ? (
          <div className="detail-grid">
            <div>
              <div className="detail-title">{selectedTour.name}</div>
              <p className="muted">{selectedTour.description}</p>
            </div>
            <div className="detail-meta">
              <div>
                <span className="pill">Location</span>
                {selectedTour.location}
              </div>
              <div>
                <span className="pill">Duration</span>
                {selectedTour.duration}
              </div>
              <div>
                <span className="pill">Price</span>
                {formatMoney(selectedTour.price)}
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">Select a tour to see details.</p>
        )}
      </section>

      <section className="card">
        <h2>Booking</h2>
        <div className="booking-actions">
          <div className="muted">
            {user ? `Booking as ${user.name}` : 'Sign in to book a tour.'}
          </div>
          <button
            className="button"
            onClick={handleBookTour}
            disabled={bookingLoading || !selectedTour}
          >
            {bookingLoading ? 'Processing...' : 'Book selected tour'}
          </button>
        </div>
        {bookingResult?.data && (
          <div className="result">
            <div><strong>Booking:</strong> {bookingResult.data.bookingId}</div>
            <div><strong>Tour:</strong> {bookingResult.data.tourName}</div>
            <div><strong>Status:</strong> {bookingResult.data.status}</div>
            <div><strong>Amount:</strong> {formatMoney(bookingResult.data.amount)}</div>
            {bookingResult.data.transactionId && (
              <div><strong>Transaction:</strong> {bookingResult.data.transactionId}</div>
            )}
            {bookingResult.confirmationMessage && (
              <div><strong>Confirmation:</strong> {bookingResult.confirmationMessage}</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;

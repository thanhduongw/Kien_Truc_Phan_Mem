import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const users = [
  { id: '1', name: 'Le Vu Thanh Duong', email: 'duong@example.com', password: '123456' },
  { id: '2', name: 'Nguyen Van Huy', email: 'huy@example.com', password: '123456' },
  { id: '3', name: 'Mai Duc Truong', email: 'truong@example.com', password: '123456' }
];

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = users.find((entry) => entry.email === email && entry.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json(toPublicUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = users.find((entry) => entry.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(toPublicUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

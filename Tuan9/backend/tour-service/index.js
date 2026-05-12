import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const tours = [
  {
    id: '1',
    name: 'Ha Long Bay Discovery',
    description: 'Explore the limestone karsts and emerald waters of Ha Long Bay.',
    price: 150,
    duration: '2 Days 1 Night',
    location: 'Quang Ninh, Vietnam'
  },
  {
    id: '2',
    name: 'Sapa Trekking Adventure',
    description: 'Experience the rice terraces and ethnic culture of Sapa.',
    price: 120,
    duration: '3 Days 2 Nights',
    location: 'Lao Cai, Vietnam'
  },
  {
    id: '3',
    name: 'Phu Quoc Sunset Tour',
    description: 'Relax on white sand beaches and enjoy sunset on Phu Quoc island.',
    price: 200,
    duration: '4 Days 3 Nights',
    location: 'Kien Giang, Vietnam'
  },
  {
    id: '4',
    name: 'Da Lat Pine Forest Retreat',
    description: 'Enjoy the cool breeze and pine forests of the city of eternal spring.',
    price: 100,
    duration: '3 Days 2 Nights',
    location: 'Lam Dong, Vietnam'
  }
];

app.get('/tours', async (req, res) => {
  try {
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/tours/:id', async (req, res) => {
  try {
    const tour = tours.find((entry) => entry.id === req.params.id);

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Tour Service running on port ${PORT}`);
});

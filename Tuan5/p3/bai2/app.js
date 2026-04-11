const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://admin:password@mongodb:27017/myapp?authSource=admin')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const Item = mongoose.model('Item', new mongoose.Schema({ name: String }));

app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/items', async (req, res) => {
  const item = await Item.create({ name: req.body.name });
  res.json(item);
});

app.listen(3000, () => console.log('Running on port 3000'));
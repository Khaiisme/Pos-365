const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Order = require('./Order');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://kn579309:15bKMj4AZPuYR3up@cluster0.yfswvlm.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// POST /api/orders - save all table orders
app.post('/api/orders', async (req, res) => {
  try {
    const tables = req.body;

    // Optional: Clear old data first
    await Order.deleteMany({});

    // Save new orders
    const savedOrders = await Order.insertMany(tables);
    res.status(200).json(savedOrders);
  } catch (error) {
    console.error("Error saving orders:", error);
    res.status(500).json({ error: 'Failed to save orders' });
  }
});

// GET /api/orders - fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const allOrders = await Order.find();
    res.status(200).json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
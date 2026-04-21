const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly define the path so the environment variables load no matter where the command is run from
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/predict', require('./routes/predictRoutes'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.warn('Failed to connect to MongoDB (Please update MONGO_URI in .env):', err.message);
  });

// Start server independently of DB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

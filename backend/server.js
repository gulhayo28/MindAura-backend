const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/umidnoma', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
const psychologistsRouter = require('./routes/psychologists');
const chatRouter = require('./routes/chat');

app.use('/api/psychologists', psychologistsRouter);
app.use('/api/chat', chatRouter);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Umidnoma API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
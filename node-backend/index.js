require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./authMiddleware');
const { createOrder } = require('./orderController');

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'Node.js Backend Running' });
});

// Order routes
app.post('/api/orders/create/', authMiddleware, createOrder);
app.post('/api/orders/create', authMiddleware, createOrder); // Handle with or without trailing slash

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Node backend running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
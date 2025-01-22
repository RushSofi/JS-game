const express = require('express');
const cors = require('cors');
const playersRoutes = require('./routes/players');
const assetsRoutes = require('./routes/assets');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', playersRoutes);
app.use('/assets', assetsRoutes);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

module.exports = app;

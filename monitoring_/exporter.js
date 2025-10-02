const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();

const fightsCounter = new client.Counter({
  name: 'fights_total',
  help: 'Total number of fights',
  registers: [register]
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(4000, () => {
  console.log('Exporter running on port 4000');
});

module.exports = { fightsCounter };
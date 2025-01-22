const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Сервер запущен на http://localhost:${PORT}`);
});

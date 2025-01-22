const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/:path(*)', (req, res) => {
  console.log(`Запрос на изображение: ${req.method} ${req.originalUrl}`);
  const filePath = path.join(__dirname, '../../public/assets', req.params.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Ошибка загрузки изображения:', req.params.path);
      res.status(404).send('Изображение не найдено');
    }
  });
});

module.exports = router;

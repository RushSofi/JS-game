const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const getRandomPlayer = (players) => {
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
};

const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

router.get('/players', (req, res) => {
  console.log(`Получен запрос на список игроков: ${req.method} ${req.originalUrl}`);
  const filePath = path.join(__dirname, '../../data/characters.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка загрузки данных игроков:', err);
      return res.status(500).json({ error: 'Ошибка загрузки данных игроков' });
    }
    res.json(JSON.parse(data));
  });
});

router.get('/player', (req, res) => {
  console.log(`Получен запрос на случайного игрока: ${req.method} ${req.originalUrl}`);
  const filePath = path.join(__dirname, '../../data/characters.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка загрузки данных игроков:', err);
      return res.status(500).json({ error: 'Ошибка загрузки данных игроков' });
    }
    const players = JSON.parse(data);
    const filteredPlayers = players.filter(player => player.id !== 11);
    const randomPlayer = getRandomPlayer(filteredPlayers);
    res.json(randomPlayer);
  });
});

router.post('/player/fight', (req, res) => {
  console.log(`Запрос на бой: ${req.method} ${req.originalUrl}, данные:`, req.body);

  const { hit, defence } = req.body;
  if (!hit || !defence) {
    console.warn('Некорректные входные данные для боя:', req.body);
    return res.status(400).json({ error: 'Необходимо указать hit и defence' });
  }

  const player1 = {
    value: getRandomValue(5, 20),
    hit,
    defence,
  };

  const player2 = {
    value: getRandomValue(5, 20),
    hit: ['head', 'body', 'foot'][Math.floor(Math.random() * 3)],
    defence: ['head', 'body', 'foot'][Math.floor(Math.random() * 3)],
  };

  console.log('Результат боя:', { player1, player2 });

  res.json({ player1, player2 });
});


const playersFilePath = path.join(__dirname, '../../data/characters.json');

router.get('/player/:id', (req, res) => {
  const playerId = parseInt(req.params.id, 10);

  fs.readFile(playersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    try {
      const players = JSON.parse(data);
      const player = players.find(p => p.id === playerId);

      if (!player) {
        return res.status(404).json({ error: 'Игрок не найден' });
      }

      res.json(player);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      res.status(500).json({ error: 'Ошибка обработки данных' });
    }
  });
});

module.exports = router;

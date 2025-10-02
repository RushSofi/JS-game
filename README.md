# Mortal Kombat-style Fighting Game 

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Jest](https://img.shields.io/badge/Testing-Jest-C21325?logo=jest)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)](https://docker.com/)
[![Kubernetes](https://img.shields.io/badge/Platform-Kubernetes-326CE5?logo=kubernetes)](https://kubernetes.io/)

Полнофункциональное браузерное приложение — файтинг с полным циклом разработки: от frontend/backend до тестирования и развертывания в Kubernetes с мониторингом.

## Основные возможности

*   **Динамический бой**: логика пошагового боя с выбором ударов (head/body/foot) и защит
*   **RESTful API**: сервер на Node.js/Express с эндпоинтами для игроков и симуляции боя
*   **Полное тестирование**: 31 модульный тест (Jest) с покрытием >88%, E2E тесты на Puppeteer
*   **DevOps пайплайн**: CI/CD через GitHub Actions, контейнеризация Docker, развертывание в Kubernetes
*   **Мониторинг**: Prometheus + Grafana + Node Exporter для сбора метрик и визуализации
*   **Анализ качества**: статический анализ (ESLint, SonarQube), формальная инспекция кода

## Технологический стек

**Frontend:**
*   Vanilla JavaScript (ES6+)
*   HTML5 + CSS3 (Flexbox/Grid, адаптивная верстка)
*   DOM Manipulation, обработка событий
*   Local Storage для сохранения прогресса

**Backend:**
*   Node.js + Express.js
*   REST API (`/api/players`, `/api/player`, `/api/fight`)
*   Статические файлы (`/assets/`)

**DevOps & Infrastructure:**
*   **Контейнеризация**: Docker, Docker Compose
*   **Оркестрация**: Kubernetes (Minikube), YAML манифесты
*   **CI/CD**: GitHub Actions с автоматическим тестированием
*   **Мониторинг**: Prometheus, Grafana, Node Exporter

**Инструменты качества:**
*   **Тестирование**: Jest (модульные тесты), Puppeteer (E2E тесты)
*   **Анализ кода**: ESLint, SonarQube
*   **Верификация**: Формальная инспекция по методу Фагана

## Структура проекта

```
js-game/
├── .devops/                 # Docker конфигурации
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend
├── .github/workflows/       # GitHub Actions CI
│   └── ci.yml
├── .k8s/                   # Kubernetes манифесты
├── src/                    # Исходный код
│   ├── game/              # Игровая логика (Game.js, attack.js)
│   ├── entities/          # Игровые сущности (Player.js)
│   └── server/            # Express сервер
├── __tests__/             # Тесты (Jest + Puppeteer)
│   ├── game.test.js
│   ├── player.test.js
│   └── memory-load.js
├── public/                 # Статические файлы
│   └── assets/            # Изображения персонажей
└── monitoring_/           # Конфигурации мониторинга
```

## Качество и тестирование

**Модульное тестирование (Jest):**
* 31 тест с покрытием 88.76%
* Обнаружено и исправлено 19 логических ошибок
* Тестирование игровой логики, работы с DOM, механизмов сохранения

**Статический анализ:**
* ESLint + SonarQube: 589+ исправленных замечаний
* Нулевой уровень остаточных ошибок после исправлений

**Динамический анализ:**
* Профилирование памяти через Puppeteer
* Стресс-тестирование, поиск утечек памяти
* Проверка стабильности при множественных боях

**Формальная верификация:**
* Инспекция кода по методу Фагана
* Выявление потенциальных уязвимостей (XSS) и логических противоречий

## Запуск проекта

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Запуск сервера разработки
npm start
```

### Docker окружение
```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Frontend: http://localhost:5500
# Backend API: http://localhost:3001
```

### Kubernetes развертывание
```bash
# Запуск Minikube кластера
minikube start

# Сборка образов
docker build -f .devops/Dockerfile.frontend -t devops-frontend .
docker build -f .devops/Dockerfile.backend -t devops-backend .

# Развертывание в Kubernetes
kubectl apply -f .k8s/

# Доступ к приложению
minikube service frontend-service
```

### Мониторинг
```bash
# Запуск стека мониторинга
docker-compose -f docker-compose.monitoring.yml up

# Grafana дашборды: http://localhost:3000
# Prometheus: http://localhost:9090
```

## Детали реализации

**Игровая логика:**
* Система здоровья с визуальными шкалами
* Рандомизация урона (1-20 HP за удар)
* Механика выбора ударов и защиты
* Определение победителя/проигравшего
* Система достижений и наград

**API эндпоинты:**
* `GET /api/players` - список всех игроков
* `GET /api/player` - случайный игрок
* `POST /api/fight` - логика боя с расчетом результатов
* `GET /assets/{path}` - статические файлы

**DevOps пайплайн:**
* Автоматическая сборка и тестирование при каждом коммите
* Мультиконтейнерное развертывание
* Declarative конфигурация Kubernetes
* Мониторинг системных и прикладных метрик

Проект демонстрирует полный цикл разработки современного веб-приложения от реализации игровой логики на чистом JavaScript до развертывания и мониторинга в продакшн-подобном окружении.
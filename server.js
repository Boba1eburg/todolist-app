const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// Для работы со статическими файлами и JSON
app.use(express.static('.'));
app.use(express.json());

// Путь к файлу с данными
const dataFile = './data/tasks.json';

// Проверяем, существует ли файл с данными
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Создаем файл с начальными данными, если его нет
if (!fs.existsSync(dataFile)) {
  const initialData = {
    categories: [
      {
        id: 1,
        name: "Ежедневные задачи",
        tasks: []
      }
    ]
  };
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// Функция для чтения данных
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    return { categories: [] };
  }
}

// Функция для записи данных
function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка записи файла:', error);
    return false;
  }
}

// API Routes

// GET - получить все категории
app.get('/api/categories', (req, res) => {
  const data = readData();
  res.json(data.categories);
});

// POST - добавить новую категорию
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Название категории обязательно' });
  }
  
  const data = readData();
  
  // Генерируем новый ID
  const newId = data.categories.length > 0 
    ? Math.max(...data.categories.map(cat => cat.id)) + 1 
    : 1;
  
  const newCategory = {
    id: newId,
    name: name.trim(),
    tasks: []
  };
  
  data.categories.push(newCategory);
  
  if (writeData(data)) {
    res.json(newCategory);
  } else {
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});

// PUT - переименовать категорию
app.put('/api/categories/:id', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Название категории обязательно' });
  }
  
  const data = readData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }
  
  data.categories[categoryIndex].name = name.trim();
  
  if (writeData(data)) {
    res.json(data.categories[categoryIndex]);
  } else {
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});

// DELETE - удалить категорию
app.delete('/api/categories/:id', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const data = readData();
  
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }
  
  data.categories.splice(categoryIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Категория удалена' });
  } else {
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
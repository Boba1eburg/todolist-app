// Массив для хранения категорий
let categories = [];

async function addCategory() {
  const input = document.getElementById('categoryInput');
  const categoryName = input.value.trim();

  if (!categoryName) return;

  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName })
    });

    if (response.ok) {
      loadCategories();
      input.value = '';
    }
  } catch (error) {
    console.error('Ошибка добавления категории:', error);
  }
}


// Загрузка категорий при старте
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();

  // Привязываем кнопку добавления категории
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  addCategoryBtn.addEventListener('click', addCategory);
});

// Функция загрузки категорий с сервера
async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    categories = await response.json();
    renderCategories();
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
  }
}

// Функция отрисовки категорий
function renderCategories() {
  const container = document.querySelector('.container');
  
  // Удаляем все существующие категории
  const existingCategories = container.querySelectorAll('.category');
  existingCategories.forEach(cat => cat.remove());
  
  // Добавляем каждую категорию перед блоком добавления
  const addCategoryBlock = container.querySelector('.add-category');
  
  categories.forEach(category => {
    const categoryElement = createCategoryElement(category);
    container.insertBefore(categoryElement, addCategoryBlock);
  });
}

// Функция создания элемента категории
function createCategoryElement(category) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'category';
  categoryDiv.dataset.categoryId = category.id;
  
  categoryDiv.innerHTML = `
    <div class="box-category" data-category-id="${category.id}">
      <span class="category-name">${category.name}</span>
      <input type="text" class="category-input" value="${category.name}" style="display: none;">
    </div>
    <button class="addBtn" onclick="addTask(${category.id})">Add</button>
    <button class="addBtn" onclick="startRename(${category.id})">Rename</button>
    <button class="delBtn" onclick="deleteCategory(${category.id})">Del</button>
  `;
  
  return categoryDiv;
}

// Функция начала переименования
function startRename(categoryId) {
  const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
  const nameSpan = categoryElement.querySelector('.category-name');
  const nameInput = categoryElement.querySelector('.category-input');
  
  // Показываем поле ввода, скрываем текст
  nameSpan.style.display = 'none';
  nameInput.style.display = 'block';
  nameInput.focus();
  nameInput.select();
  
  // Обработчики для сохранения
  nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveRename(categoryId, nameInput.value);
    }
  });
  
  nameInput.addEventListener('blur', function() {
    saveRename(categoryId, nameInput.value);
  });
}

// Функция сохранения переименования
async function saveRename(categoryId, newName) {
  if (!newName || newName.trim() === '') {
    // Если название пустое, отменяем редактирование
    cancelRename(categoryId);
    return;
  }
  
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName.trim() })
    });
    
    if (response.ok) {
      // Обновляем локальный массив
      const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex !== -1) {
        categories[categoryIndex].name = newName.trim();
      }
      
      // Обновляем интерфейс
      finishRename(categoryId, newName.trim());
    } else {
      console.error('Ошибка переименования категории');
      cancelRename(categoryId);
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    cancelRename(categoryId);
  }
}

// Функция завершения переименования
function finishRename(categoryId, newName) {
  const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
  const nameSpan = categoryElement.querySelector('.category-name');
  const nameInput = categoryElement.querySelector('.category-input');
  
  // Обновляем текст и показываем span
  nameSpan.textContent = newName;
  nameSpan.style.display = 'block';
  nameInput.style.display = 'none';
}

// Функция отмены переименования
function cancelRename(categoryId) {
  const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
  const nameSpan = categoryElement.querySelector('.category-name');
  const nameInput = categoryElement.querySelector('.category-input');
  
  // Возвращаем исходное значение
  const originalName = categories.find(cat => cat.id === categoryId)?.name || '';
  nameInput.value = originalName;
  
  // Показываем span, скрываем input
  nameSpan.style.display = 'block';
  nameInput.style.display = 'none';
}

// Заглушка для функции добавления задач
function addTask(categoryId) {
  console.log('Добавление задачи для категории:', categoryId);
  // Пока что просто выводим в консоль
}


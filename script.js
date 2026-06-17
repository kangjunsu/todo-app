const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');

let todos = [];

function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">할 일이 없습니다. 새로운 할 일을 추가해보세요!</li>';
        return;
    }

    // 우선순위별로 정렬 (높음 -> 중간 -> 낮음)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedTodos = todos.map((todo, index) => ({ ...todo, originalIndex: index }))
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    sortedTodos.forEach((todo, displayIndex) => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('draggable', 'true');
        li.setAttribute('data-index', todo.originalIndex);
        li.setAttribute('data-priority', todo.priority);

        li.innerHTML = `
            <span class="drag-handle">⋮⋮</span>
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.originalIndex})">
            <select class="priority-select-item" onchange="changePriority(${todo.originalIndex}, this.value)">
                <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>높음</option>
                <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>중간</option>
                <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>낮음</option>
            </select>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.originalIndex})">삭제</button>
        `;

        // 드래그 이벤트 추가
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragenter', handleDragEnter);
        li.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('dragend', handleDragEnd);

        todoList.appendChild(li);
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    const priority = prioritySelect.value;

    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    todos.push({
        text: text,
        priority: priority,
        completed: false,
        order: todos.length
    });

    todoInput.value = '';
    prioritySelect.value = 'medium';
    saveTodos();
    renderTodos();
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function changePriority(index, newPriority) {
    todos[index].priority = newPriority;
    saveTodos();
    renderTodos();
}

let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.getAttribute('data-index'));
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    const draggedPriority = draggedElement.getAttribute('data-priority');
    const targetPriority = this.getAttribute('data-priority');

    // 같은 우선순위끼리만 드래그 허용
    if (draggedPriority === targetPriority) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const targetIndex = parseInt(this.getAttribute('data-index'));
    const draggedPriority = draggedElement.getAttribute('data-priority');
    const targetPriority = this.getAttribute('data-priority');

    // 같은 우선순위끼리만 위치 변경
    if (draggedPriority === targetPriority && draggedIndex !== targetIndex) {
        // 두 항목의 order 값을 교환
        if (!todos[draggedIndex].order) {
            todos.forEach((todo, idx) => {
                todo.order = idx;
            });
        }

        const draggedOrder = todos[draggedIndex].order;
        todos[draggedIndex].order = todos[targetIndex].order;
        todos[targetIndex].order = draggedOrder;

        // order 값으로 정렬
        todos.sort((a, b) => (a.order || 0) - (b.order || 0));

        saveTodos();
        renderTodos();
    }

    this.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

loadTodos();

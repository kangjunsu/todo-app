const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');

// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://gakynwqgyqnljcipchrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3lud3FneXFubGpjaXBjaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjcyMjYsImV4cCI6MjA5NzI0MzIyNn0.5n96o1YYVwDcV5eOe9EDAKD1KUA0QMORrR3oClVsAEc';

if (!window.supabase) {
    alert('Supabase 라이브러리 로드 실패. 페이지를 새로고침해주세요.');
    throw new Error('Supabase not loaded');
}

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let todos = [];
let currentUser = null;

// 인증 체크
async function checkAuth() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return false;
    }
    currentUser = session.user;
    return true;
}

// 사용자 정보 표시
async function renderUserInfo() {
    const { data: { user } } = await db.auth.getUser();
    if (user) {
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = user.email;
        }
    }
}

// 로그아웃
async function handleLogout() {
    try {
        await db.auth.signOut();
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('로그아웃에 실패했습니다.');
    }
}

async function loadTodos() {
    try {
        // 현재 사용자 확인
        const { data: { user } } = await db.auth.getUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        // 사용자별 TODO 로드
        const { data, error } = await db
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('order', { ascending: true });

        if (error) throw error;

        todos = data || [];
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
        alert('할 일 목록을 불러오는데 실패했습니다.');
    }
}

async function saveTodos() {
    // Supabase에서는 개별 작업마다 저장되므로 이 함수는 더 이상 필요 없음
    // 하위 호환성을 위해 빈 함수로 유지
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
        li.setAttribute('data-id', todo.id);
        li.setAttribute('data-index', todo.originalIndex);
        li.setAttribute('data-priority', todo.priority);

        li.innerHTML = `
            <span class="drag-handle">⋮⋮</span>
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${todo.id}')">
            <select class="priority-select-item" onchange="changePriority('${todo.id}', this.value)">
                <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>높음</option>
                <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>중간</option>
                <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>낮음</option>
            </select>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">삭제</button>
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

async function addTodo() {
    const text = todoInput.value.trim();
    const priority = prioritySelect.value;

    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    try {
        // 현재 사용자 확인
        const { data: { user } } = await db.auth.getUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order || 0)) : -1;

        const { data, error } = await db
            .from('todos')
            .insert([{
                text: text,
                priority: priority,
                completed: false,
                order: maxOrder + 1,
                user_id: user.id
            }])
            .select();

        if (error) {
            console.error('Supabase error details:', error);
            throw error;
        }

        console.log('Successfully added todo:', data);
        todoInput.value = '';
        prioritySelect.value = 'medium';
        await loadTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('할 일 추가에 실패했습니다.\n에러: ' + (error.message || JSON.stringify(error)));
    }
}

async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const { error } = await db
            .from('todos')
            .update({ completed: !todo.completed })
            .eq('id', id);

        if (error) throw error;

        await loadTodos();
    } catch (error) {
        console.error('Error toggling todo:', error);
        alert('할 일 상태 변경에 실패했습니다.');
    }
}

async function deleteTodo(id) {
    try {
        const { error } = await db
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('할 일 삭제에 실패했습니다.');
    }
}

async function changePriority(id, newPriority) {
    try {
        const { error } = await db
            .from('todos')
            .update({ priority: newPriority })
            .eq('id', id);

        if (error) throw error;

        await loadTodos();
    } catch (error) {
        console.error('Error changing priority:', error);
        alert('우선순위 변경에 실패했습니다.');
    }
}

let draggedElement = null;
let draggedId = null;

function handleDragStart(e) {
    draggedElement = this;
    draggedId = this.getAttribute('data-id');
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

async function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const targetId = this.getAttribute('data-id');
    const draggedPriority = draggedElement.getAttribute('data-priority');
    const targetPriority = this.getAttribute('data-priority');

    // 같은 우선순위끼리만 위치 변경
    if (draggedPriority === targetPriority && draggedId !== targetId) {
        try {
            const draggedTodo = todos.find(t => t.id === draggedId);
            const targetTodo = todos.find(t => t.id === targetId);

            if (draggedTodo && targetTodo) {
                const draggedOrder = draggedTodo.order;
                const targetOrder = targetTodo.order;

                // 두 항목의 order 값을 교환
                await db
                    .from('todos')
                    .update({ order: targetOrder })
                    .eq('id', draggedId);

                await db
                    .from('todos')
                    .update({ order: draggedOrder })
                    .eq('id', targetId);

                await loadTodos();
            }
        } catch (error) {
            console.error('Error reordering todos:', error);
            alert('순서 변경에 실패했습니다.');
        }
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

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 로그아웃 버튼
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

// 앱 초기화
(async function initApp() {
    // 인증 체크
    const isAuth = await checkAuth();
    if (!isAuth) return;

    // 인증 상태 변경 리스너
    db.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'auth.html';
        }
    });

    // 사용자 정보 표시
    await renderUserInfo();

    // TODO 로드
    await loadTodos();
})();

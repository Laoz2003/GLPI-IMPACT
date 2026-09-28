// DOM Elements
const navLinks = document.querySelectorAll('.sidebar nav a');
const views = document.querySelectorAll('.view');
const kanbanBoard = document.getElementById('kanban-board');
const modal = document.getElementById('task-modal');
const createTaskBtn = document.getElementById('create-task-btn');
const closeBtn = document.querySelector('.close-btn');
const createTaskForm = document.getElementById('create-task-form');

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all links and views
        navLinks.forEach(l => l.classList.remove('active'));
        views.forEach(v => v.classList.remove('active', 'hidden'));
        views.forEach(v => v.classList.add('hidden'));

        // Add active class to clicked link
        e.target.classList.add('active');

        // Show corresponding view
        const targetViewId = `view-${e.target.dataset.view}`;
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
        }
    });
});

// Kanban Board Data Structure
window.kanbanData = {
    todo: [],
    inProgress: [],
    done: []
};

// Fetch Tasks from API
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();

        // Reset local data
        window.kanbanData = { todo: [], inProgress: [], done: [] };

        tasks.forEach(task => {
            if (window.kanbanData[task.status]) {
                window.kanbanData[task.status].push(task);
            }
        });

        renderKanban();
        renderProgress(); // Update progress stats
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Render Kanban Board
function renderKanban() {
    kanbanBoard.innerHTML = '';

    const columns = [
        { id: 'todo', title: 'To Do' },
        { id: 'inProgress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ];

    columns.forEach(col => {
        const colEl = document.createElement('div');
        colEl.className = 'kanban-column';
        colEl.innerHTML = `<h3>${col.title}</h3><div class="kanban-cards" id="${col.id}-cards" data-status="${col.id}"></div>`;

        const cardsContainer = colEl.querySelector('.kanban-cards');

        window.kanbanData[col.id].forEach(task => {
            const cardEl = document.createElement('div');
            cardEl.className = 'kanban-card';
            cardEl.draggable = true;
            cardEl.id = task.id;

            const titleEl = document.createElement('h4');
            titleEl.textContent = task.title;
            const descEl = document.createElement('p');
            descEl.textContent = task.description || '';

            cardEl.appendChild(titleEl);
            cardEl.appendChild(descEl);

            // Basic drag events
            cardEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.target.classList.add('dragging');
            });

            cardEl.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            cardsContainer.appendChild(cardEl);
        });

        // Drop zone events
        cardsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            cardsContainer.classList.add('drag-over');
        });

        cardsContainer.addEventListener('dragleave', (e) => {
             cardsContainer.classList.remove('drag-over');
        });

        cardsContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            cardsContainer.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedEl = document.getElementById(draggedId);

            if(draggedEl && draggedEl.parentElement !== cardsContainer) {
                cardsContainer.appendChild(draggedEl);
                const newStatus = cardsContainer.dataset.status;

                // Update backend
                try {
                    await fetch(`/api/tasks/${draggedId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    // Refresh data
                    fetchTasks();
                } catch (error) {
                    console.error('Error updating task status:', error);
                }
            }
        });

        kanbanBoard.appendChild(colEl);
    });
}

// Modal Logic
createTaskBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Create Task Submission
createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newTask = {
        id: 't' + Date.now(),
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        status: document.getElementById('task-status').value
    };

    try {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        createTaskForm.reset();
        modal.classList.add('hidden');
        fetchTasks();
    } catch (error) {
        console.error('Error creating task:', error);
    }
});

// Render Calendar (Static Mockup)
function renderCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    if(!calendarContainer) return;

    calendarContainer.innerHTML = `
        <div class="calendar-header">
            <button>&lt;</button>
            <h3>September 2024</h3>
            <button>&gt;</button>
        </div>
        <div class="calendar-grid">
            <div class="day-name">Sun</div><div class="day-name">Mon</div><div class="day-name">Tue</div><div class="day-name">Wed</div><div class="day-name">Thu</div><div class="day-name">Fri</div><div class="day-name">Sat</div>
            <div class="calendar-day empty"></div>
            ${Array.from({length: 30}, (_, i) => {
                const dayNum = i + 1;
                const eventHtml = dayNum === 15 ? '<div class="calendar-event">Zoho Sync Deadline</div>' : '';
                return `<div class="calendar-day"><span class="day-num">${dayNum}</span>${eventHtml}</div>`;
            }).join('')}
        </div>
    `;
}

// Render Progress
function renderProgress() {
    const progressContainer = document.getElementById('progress-container');
    if(!progressContainer) return;

    const todoCount = window.kanbanData.todo.length;
    const inProgressCount = window.kanbanData.inProgress.length;
    const doneCount = window.kanbanData.done.length;
    const total = todoCount + inProgressCount + doneCount;
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    progressContainer.innerHTML = `
        <div class="progress-card">
            <h3>Overall Project Completion</h3>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <p>${percent}% Completed - ${todoCount + inProgressCount} Tasks Remaining</p>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <h4>Tasks Done</h4>
                <p class="stat-number">${doneCount}</p>
            </div>
             <div class="stat-box">
                <h4>In Progress</h4>
                <p class="stat-number">${inProgressCount}</p>
            </div>
             <div class="stat-box">
                <h4>To Do</h4>
                <p class="stat-number">${todoCount}</p>
            </div>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    renderCalendar();
});

// Integrations Logic
const googleBtn = document.getElementById('connect-google-btn');
const zohoBtn = document.getElementById('connect-zoho-btn');
const googleStatus = document.getElementById('google-status');
const zohoStatus = document.getElementById('zoho-status');

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        googleBtn.textContent = 'Connecting...';
        try {
            const res = await fetch('/api/auth/google');
            const data = await res.json();
            googleStatus.textContent = `Connected as: ${data.email}`;
            googleBtn.textContent = 'Connected';
            googleBtn.style.backgroundColor = '#10b981'; // Green
        } catch (err) {
            googleStatus.textContent = 'Connection failed.';
            googleBtn.disabled = false;
            googleBtn.textContent = 'Connect Google Drive';
        }
    });
}

if (zohoBtn) {
    zohoBtn.addEventListener('click', async () => {
        zohoBtn.disabled = true;
        zohoBtn.textContent = 'Syncing...';
        try {
            const res = await fetch('/api/zoho/sync');
            const data = await res.json();
            zohoStatus.textContent = `Last sync: ${new Date(data.last_sync).toLocaleString()}`;
            zohoBtn.textContent = 'Sync Successful';
            setTimeout(() => {
                zohoBtn.disabled = false;
                zohoBtn.textContent = 'Sync with Zoho';
            }, 3000);
        } catch (err) {
            zohoStatus.textContent = 'Sync failed.';
            zohoBtn.disabled = false;
            zohoBtn.textContent = 'Sync with Zoho';
        }
    });
}

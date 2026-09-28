// DOM Elements
const navLinks = document.querySelectorAll('.sidebar nav a');
const views = document.querySelectorAll('.view');
const kanbanBoard = document.getElementById('kanban-board');

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

// Kanban Board Data (Mock)
window.kanbanData = {
    todo: [
        { id: 't1', title: 'Design Database Schema', desc: 'Create tables for Zoho sync' },
        { id: 't2', title: 'Setup Google Drive Auth', desc: 'OAuth2 integration for docs' }
    ],
    inProgress: [
        { id: 't3', title: 'Build Kanban UI', desc: 'Drag and drop interface' }
    ],
    done: [
        { id: 't4', title: 'Project Scaffold', desc: 'HTML/CSS/JS init' }
    ]
};

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
        colEl.innerHTML = `<h3>${col.title}</h3><div class="kanban-cards" id="${col.id}-cards"></div>`;

        const cardsContainer = colEl.querySelector('.kanban-cards');

        window.kanbanData[col.id].forEach(task => {
            const cardEl = document.createElement('div');
            cardEl.className = 'kanban-card';
            cardEl.draggable = true;
            cardEl.id = task.id;
            cardEl.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.desc}</p>
            `;

            // Basic drag events (stubbed for future complete implementation)
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
            e.preventDefault(); // Necessary to allow dropping
            cardsContainer.classList.add('drag-over');
        });

        cardsContainer.addEventListener('dragleave', (e) => {
             cardsContainer.classList.remove('drag-over');
        });

        cardsContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            cardsContainer.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedEl = document.getElementById(draggedId);
            if(draggedEl) {
                cardsContainer.appendChild(draggedEl);
                // Note: Updating the underlying data object would go here in a real app
            }
        });

        kanbanBoard.appendChild(colEl);
    });
}

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
            <!-- Empty days for start of month -->
            <div class="calendar-day empty"></div>
            <!-- Simulated days -->
            ${Array.from({length: 30}, (_, i) => {
                const dayNum = i + 1;
                // Add a mock event on the 15th
                const eventHtml = dayNum === 15 ? '<div class="calendar-event">Zoho Sync Deadline</div>' : '';
                return `<div class="calendar-day"><span class="day-num">${dayNum}</span>${eventHtml}</div>`;
            }).join('')}
        </div>
    `;
}

// Render Progress (Static Mockup)
function renderProgress() {
    const progressContainer = document.getElementById('progress-container');
    if(!progressContainer) return;

    progressContainer.innerHTML = `
        <div class="progress-card">
            <h3>Overall Project Completion</h3>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: 35%;"></div>
            </div>
            <p>35% Completed - 3 Tasks Remaining</p>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <h4>Tasks Done</h4>
                <p class="stat-number">1</p>
            </div>
             <div class="stat-box">
                <h4>In Progress</h4>
                <p class="stat-number">1</p>
            </div>
             <div class="stat-box">
                <h4>To Do</h4>
                <p class="stat-number">2</p>
            </div>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderKanban();
    renderCalendar();
    renderProgress();
});
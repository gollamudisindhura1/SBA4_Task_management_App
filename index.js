// DOM Elements
const taskForm       = document.getElementById("taskForm");
const taskName       = document.getElementById("taskName");
const taskCategory   = document.getElementById("taskCategory");
const taskDeadline   = document.getElementById("taskDeadline");
const taskStatus     = document.getElementById("taskStatus");
const filterStatus   = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const applyFilter    = document.getElementById("applyFilter");
const removeTaskBtn  = document.getElementById("removeTask");
const taskList       = document.getElementById("taskList");
const taskCount      = document.getElementById("taskCount");

// Data
let tasks = [];
let selectedTaskId = null; //Keeps track of which task is currently clicked so we can delete it.

// Load from localStorage
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) tasks = JSON.parse(saved);
  render();
}
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks)); //Saves the current tasks array to localStorage as a string using JSON.stringify().
}

// Check overdue
function checkOverdue() {
  const today = new Date().toISOString().split("T")[0];
  tasks.forEach(t => {
    if (t.status !== "Completed" && t.deadline < today) {
      t.status = "Overdue";
    }
  });
}

// Add Task
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = taskName.value.trim();
  const category = taskCategory.value.trim();
  const deadline = taskDeadline.value;

  if (!name || !category || !deadline) {
    alert("Please fill all fields!");
    return;
  }

  const task = {
    id: Date.now(),
    name, category, deadline,
    status: taskStatus.value
  };

  tasks.push(task);
  saveTasks();
  taskForm.reset();
  render();
});

// Update Status
function updateStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks();
    render();
  }
}

// Select Task for Removal
function selectTask(id) {
  selectedTaskId = id;
  render(); // Re-render to highlight
  removeTaskBtn.disabled = false;
}

// Remove Selected Task
removeTaskBtn.addEventListener("click", () => {
  if (!selectedTaskId) return;
  if (confirm("Remove this task?")) {
    tasks = tasks.filter(t => t.id !== selectedTaskId);
    selectedTaskId = null;
    saveTasks();
    render();
  }
});

// Render Tasks
function render(filter = {}) {
  checkOverdue();
  let filtered = tasks;

  if (filter.status && filter.status !== "All") {
    filtered = filtered.filter(t => t.status === filter.status);
  }
  if (filter.category) {
    filtered = filtered.filter(t =>
      t.category.toLowerCase().includes(filter.category.toLowerCase())
    );
  }

  taskList.innerHTML = "";
  taskCount.textContent = `${filtered.length} Task${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    taskList.innerHTML = `<div class="text-center text-muted p-4">No tasks found.</div>`;
    removeTaskBtn.disabled = true;
    return;
  }

  filtered.forEach(task => {
    const div = document.createElement("div");
    div.className = `task-item p-3 status-${task.status.toLowerCase().replace(" ", "-")} ${task.id === selectedTaskId ? 'selected' : ''}`;
    div.onclick = () => selectTask(task.id);

    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <strong>${task.name}</strong>
          <span class="badge bg-secondary ms-2">${task.category}</span>
          <br>
          <small>Due: ${task.deadline} | <strong>${task.status}</strong></small>
        </div>
        <select class="form-select form-select-sm w-auto" onchange="updateStatus(${task.id}, this.value)" ${task.id === selectedTaskId ? '' : 'disabled'}>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed"   ${task.status === 'Completed'   ? 'selected' : ''}>Completed</option>
          <option value="Overdue"     ${task.status === 'Overdue'     ? 'selected disabled' : ''}>Overdue</option>
        </select>
      </div>
    `;
    taskList.appendChild(div);
  });
}

// Apply Filter
applyFilter.addEventListener("click", () => {
  render({
    status: filterStatus.value,
    category: filterCategory.value.trim()
  });
});

// Init
loadTasks();
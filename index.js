// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const taskCategory = document.getElementById("taskCategory");
const taskDeadline = document.getElementById("taskDeadline");
const taskStatus = document.getElementById("taskStatus");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const applyFilter = document.getElementById("applyFilter");
const removeTaskBtn = document.getElementById("removeTask");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

// Safe lowercase
const lower = (s) => (s || '').toString().toLowerCase();

let tasks = [];
let selectedTaskId = null;

// LOAD TASKS — FIX: Add id if missing
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved).map(t => ({
      id: t.id || Date.now(),  // ← CRITICAL: Prevent undefined id
      name: t.name || "Untitled",
      category: t.category,
      deadline: t.deadline || "",
      status: t.status || "In Progress"
    }));
  }
  render();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Check Overdue
function checkOverdue() {
  const today = new Date().toISOString().split("T")[0];
  tasks.forEach(t => {
    if (t.status === "Completed") return;
    if (t.deadline < today && t.status !== "Overdue") {
      t.status = "Overdue";
    } else if (t.deadline >= today && t.status === "Overdue") {
      t.status = "In Progress";
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
    name,
    category,
    deadline,
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

// Select Task
function selectTask(id) {
  selectedTaskId = id;
  render();
  removeTaskBtn.disabled = false;
}

// Delete Task
removeTaskBtn.addEventListener("click", () => {
  if (!selectedTaskId) return;
  if (confirm("Remove this task?")) {
    tasks = tasks.filter(t => t.id !== selectedTaskId);
    selectedTaskId = null;
    saveTasks();
    render();
  }
});

// RENDER — FIX: Use addEventListener instead of onchange=""
function render(filter = {}) {
  checkOverdue();
  let filtered = tasks;

  if (filter.status && filter.status !== "All") {
    filtered = filtered.filter(t => t.status === filter.status);
  }

  if (filter.category) {
    const search = lower(filter.category);
    filtered = filtered.filter(t => {
      if (t.category === undefined) {
        return search === "undefined" || search === "uncategorized";
      }
      return lower(t.category).includes(search);
    });
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
    div.className = `task-item p-3 border rounded status-${task.status.toLowerCase().replace(" ", "-")} ${task.id === selectedTaskId ? "selected bg-light" : ""}`;
    div.onclick = () => selectTask(task.id);

    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <strong>${task.name}</strong>
          <span class="badge bg-secondary ms-2">
            ${task.category === undefined ? "Uncategorized" : (task.category || "Uncategorized")}
          </span>
          <br>
          <small>Due: ${task.deadline} | <strong>${task.status}</strong></small>
        </div>
      </div>
    `;

    // CREATE SELECT SAFELY
    const select = document.createElement("select");
    select.className = "form-select form-select-sm w-auto";
    select.innerHTML = `
      <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
      <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
      <option value="Overdue" ${task.status === "Overdue" ? "selected" : ""} disabled>Overdue</option>
    `;
    select.addEventListener("change", () => updateStatus(task.id, select.value));

    div.querySelector(".d-flex").appendChild(select);
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

// Start
loadTasks();
console.log("Task Planner loaded — SAFE & FIXED!");
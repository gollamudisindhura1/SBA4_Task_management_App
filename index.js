
// Get Elements from the DOM

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskCategory = document.querySelector("#taskCategory");
const taskDeadline = document.querySelector("#taskDeadline");
const taskStatus = document.querySelector("#taskStatus");
const filterTask = document.querySelector("#filterTask");
const filterCategory = document.querySelector("#filterCategory");
const applyFilter = document.querySelector("#applyFilter");
const taskList = document.querySelector("#taskList");

// Array to store tasks

let tasks = [];

// Load tasks from Local Storage

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}


// Save tasks to Local Storage

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

-
// Check for overdue tasks

// This checks if the task deadline is earlier than today’s date.
function checkOverdue() {
  const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD
  tasks.forEach((task) => {
    if (task.status !== "Completed" && task.deadline < today) {
      task.status = "Overdue";
    }
  });
}

// Add Task

taskForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing

  // Trim input values (remove spaces)
  const name = taskName.value.trim();
  const category = taskCategory.value.trim();
  const deadline = taskDeadline.value;
  const status = taskStatus.value;

  // Validation: check if any field is empty
  if (!name || !category || !deadline) {
    alert("Please fill in all fields before adding a task!");
    return;
  }

  // Create a new task object
  const task = {
    id: Date.now(), // Unique ID for each task
    name: name,
    category: category,
    deadline: deadline,
    status: status
  };

  // Add task to array and save it
  tasks.push(task);
  saveTasks();

  // Reset form and re-render task list
  taskForm.reset();
  render();
});


// Update Task Status

function updateStatus(id, newStatus) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks();
    render();
  }
}


// Render Tasks on the Page

function render(filter = {}) {
  checkOverdue(); // Always check if any task became overdue
  taskList.innerHTML = ""; // Clear old list

  // Filter tasks based on user input
  let filtered = tasks;

  if (filter.status && filter.status !== "All") {
    filtered = filtered.filter((t) => t.status === filter.status);
  }

  if (filter.category) {
    filtered = filtered.filter((t) =>
      t.category.toLowerCase().includes(filter.category.toLowerCase())
    );
  }

  // If no tasks found
  if (filtered.length === 0) {
    taskList.innerHTML =
      "<li class='list-group-item text-center text-muted'>No tasks found.</li>";
    return;
  }

  // Loop through filtered tasks and create list items
  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <div>
        <strong>${task.name}</strong>
        <span class="badge bg-secondary ms-2">${task.category}</span><br>
        <small>Due: ${task.deadline} | Status: <strong>${task.status}</strong></small>
      </div>
      <select class="form-select form-select-sm w-auto"
        onchange="updateStatus(${task.id}, this.value)">
        <option value="In Progress" ${
          task.status === "In Progress" ? "selected" : ""
        }>In Progress</option>
        <option value="Completed" ${
          task.status === "Completed" ? "selected" : ""
        }>Completed</option>
        <option value="Overdue" ${
          task.status === "Overdue" ? "selected" : ""
        } ${task.status === "Overdue" ? "disabled" : ""}>Overdue</option>
      </select>
    `;
    taskList.appendChild(li);
  });
}


// Apply Filters

applyFilter.addEventListener("click", () => {
  render({
    status: filterTask.value,
    category: filterCategory.value.trim()
  });
});


// Initial Load

loadTasks();
render();

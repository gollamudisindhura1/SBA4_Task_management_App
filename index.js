// Get Elements from the DOM

const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskCategory = document.querySelector("#taskCategory")
const taskDeadline = document.querySelector("#taskDeadline")
const taskStatus = document.querySelector("#taskStatus")
const filterTask = document.querySelector("#filterTask")
const filterCategory = document.querySelector("#filterCategory")
const applyFilter = document.querySelector("#applyFilter")
const taskList = document.querySelector("#taskList")


// Array to store tasks. 
let tasks = []

// Using JSON to load data to the LocalStorage
//https://www.freecodecamp.org/news/use-local-storage-in-modern-applications/
function loadTasks() {
    const saved = localStorage.getItem("tasks")
    if (saved) tasks = JSON.parse(saved)

}

// Save to the local Storage using JSON.stingify()

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

// Check overdue

// The toISOString() method of Date instances returns a string representing this date in the date time string format, a simplified format based on ISO 8601

function checkOverdue() {
    const today = new Date().toISOString().split("T")[0];
    tasks.forEach(task => {

        if (task.status !== "Completed" && task.deadline < today) {
            task.status = "Overdue"
        }

    });
}

// Add Task

taskForm.addEventListener("submit", e => {
    e.preventDefault()
    const task = {
        id: Date.now(),
        name: taskName.value.trim(),
        category: taskCategory.value.trim(),
        deadline: taskDeadline.value,
        status: taskStatus.value
    }
    tasks.push(task)
    saveTasks()
    render()
    taskForm.reset()
})
// Update Status
function updateStatus(id, newStatus){
    const task = tasks.find(t => t.id === id);
    if (task){
        task.status=newStatus
        saveTasks()
        render()
    }
}
// Render Task

function render(filter={}) {
    checkOverdue()
    taskList.innerHTML = ""
    let filtered = tasks
    if (filter.status && filter.status !== "All") {
        filtered = filtered.filter(t => t.status === filter.status)
    }
    if (filter.category) {
        filtered = filtered.filter(t => t.category.toLowerCase().includes(filter.category.toLowerCase())

        );
    }
    if (filtered.length === 0) {
        taskList.innerHTML = "<li>No tasks Found</li>";
        return;
    }
    filtered.forEach(task => {
        const li = document.createElement("li")
        li.className = `${ task.status.toLowerCase().replace(' ', '-') }`;
        li.innerHTML = `
      <div>
        <strong>${task.name}</strong> 
        <span class="badge bg-secondary ms-2">${task.category}</span><br>
        <small>Due: ${task.deadline} | Status: <strong>${task.status}</strong></small>
      </div>
      <select class="form-select form-select-sm w-auto" onchange="updateStatus(${task.id}, this.value)">
        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="Overdue" ${task.status === 'Overdue' ? 'selected' : ''} ${task.status === 'Overdue' ? 'disabled' : ''}>Overdue</option>
      </select>
    `;
        taskList.appendChild(li);
    });
}

// Apply filter

applyFilter.addEventListener("click", ()=>{
    render({
        status : filterTask.value,
        category: filterCategory.value.trim()
    })
})

loadTasks()
render()


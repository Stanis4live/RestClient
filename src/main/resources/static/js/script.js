const AUTH_API_URL = "http://localhost:8080";
const BASE_URL = "http://localhost:8899";

document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.querySelector(".logout-btn");
    const homeButton = document.querySelector(".btn-home");

    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            removeToken();
            window.location.href = `login`;
        })
    };

    if (homeButton) {
        homeButton.addEventListener("click", function() {
            localStorage.removeItem("editEventId");
            window.location.href = `home`;

        })
    };
})


function saveToken(token){
    localStorage.setItem("jwtToken", token);
}

function getToken(){
    return localStorage.getItem("jwtToken");
}

function removeToken(){
    localStorage.removeItem("jwtToken");
}

async function registerUser(email, password, confirmPassword, errorMessageElement) {
    if (password != confirmPassword) {
        errorMessage.textContent = "Password do not match"
        return
    }

    const requestData = {email, password}

    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestData)
        });

        if (!response.ok){
            throw new Error(await response.text());
        }

        window.location.href = `${BASE_URL}/login`
        console.log(response)

    } catch (error) {
        errorMessageElement.textContent = "Error " + error.message;
    }    
}

async function loginUser(email, password, errorMessageElement){
    const requestData = {email, password}

    try{
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body:JSON.stringify(requestData)
        });

        if (!response.ok){
            throw new Error("Server error");
        }

        const data = await response.json();
        saveToken(data.token);
        window.location.href = `${BASE_URL}/home`
    } catch (error) {
        errorMessageElement.textContent = "Error " + error.message;
    }
}

// ----------------------------------------------------- EVENTS -------------------------------------------------

async function getUserEvents() {
    const token = getToken();

    try{
        const response = await fetch(`${AUTH_API_URL}/events`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });


        if (response.status === 401 || response.status === 403){
            window.location.href = `login`
            return
        }


        const events = await response.json();
        localStorage.setItem("userEvents", JSON.stringify(events));
        window.location.href = `${BASE_URL}/events`

    } catch (error){
        console.log(error)
    }
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function displayEvents(events) {
    const eventsList = document.getElementById("events-list");
    eventsList.innerHTML = "";

    if (events.length === 0){
        eventsList.innerHTML = "<p>No events found</p>"
        return;
    }

    events.forEach(event => {
        const eventContainer = document.createElement("div");
        eventContainer.classList.add("event-card");
        const title = document.createElement("h3");
        title.textContent = event.title;
        const description = document.createElement("p");
        description.textContent = event.description;
        const dateTime = document.createElement("p");
        dateTime.textContent = formatDateTime(event.dateTime);
        const editButton = document.createElement("button");
        editButton.classList.add("edit-btn");
        editButton.addEventListener("click", () => editEvent(event.id));
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", () => deleteEvent(event.id));

        eventContainer.appendChild(title);
        eventContainer.appendChild(description);
        eventContainer.appendChild(dateTime);
        eventContainer.appendChild(editButton);
        eventContainer.appendChild(deleteButton);

        eventsList.appendChild(eventContainer);
        
    })
}

async function saveEvent(event) {
    event.preventDefault()

    const token = getToken();
    const eventId = localStorage.getItem("editEventId");

    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const dateTime = document.getElementById("event-datetime").value;

    const requestData = {
        title: title,
        description: description,
        dateTime: dateTime
    };
    const method = eventId ? "PUT" : "POST";
    const url = eventId ? `${AUTH_API_URL}/events/${eventId}` : `${AUTH_API_URL}/events`

    try{
        const response = await fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (response.status === 401){
            window.location.href = `login`
            return
        } else if (response.status === 403){
            console.error("Error 403")
            return
        }

        localStorage.removeItem("editEventId");
        getUserEvents();

    } catch (error){
        console.log(error)
    }
}


function editEvent(eventId) {
    localStorage.setItem("editEventId", eventId);
    window.location.href = `${BASE_URL}/one-event`;
}

async function loadEventData() {
    const eventId = localStorage.getItem("editEventId");
    if (!eventId){
        return;
    }

    const token = getToken();

    try{
        const response = await fetch(`${AUTH_API_URL}/events/${eventId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
    });

    if (response.status === 401){
        window.location.href = `login`
        return
    } else if (response.status === 403){
        console.error("Error 403")
        return
    }

    const event = await response.json();
    document.getElementById("event-title").value = event.title;
    document.getElementById("event-description").value = event.description;
    document.getElementById("event-datetime").value = event.dateTime;


    } catch (error){
        console.error("Error loading event:", error)
    }
}

async function deleteEvent(eventId) {
    const token = getToken();

    try{
        const response = await fetch(`${AUTH_API_URL}/events/${eventId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
    });

    if (response.status === 401){
        window.location.href = `login`
        return
    } else if (response.status === 403){
        console.error("Error 403")
        return
    }

    getUserEvents();

    } catch (error){
        console.error("Error deleting event:", error)
    }
}

// ----------------------------------------------------- TASKS -------------------------------------------------
//
//async function getUserTasks() {
//    const token = getToken();
//
//    try{
//        const response = await fetch(`${AUTH_API_URL}/tasks`, {
//            method: "GET",
//            headers: {
//                "Authorization": `Bearer ${token}`,
//                "Content-Type": "application/json"
//            }
//        });
//
//
//        if (response.status === 401 || response.status === 403){
//            window.location.href = `login`
//            return
//        }
//
//
//        const tasks = await response.json();
//        localStorage.setItem("userTasks", JSON.stringify(tasks));
//        window.location.href = `${BASE_URL}/tasks`
//
//    } catch (error){
//        console.log(error)
//    }
//}
//
//function displayTasks(tasks) {
//    const tasksList = document.getElementById("tasks-list");
//    tasksList.innerHTML = "";
//
//    if (tasks.length === 0){
//        tasksList.innerHTML = "<p>No tasks found</p>"
//        return;
//    }
//
//    tasks.forEach(task => {
//        const taskContainer = document.createElement("div");
//        taskContainer.classList.add("event-card");
//        const title = document.createElement("h3");
//        title.textContent = task.title;
//        const description = document.createElement("p");
//        description.textContent = task.description;
//        const dateTime = document.createElement("p");
//        dateTime.textContent = formatDateTime(task.dateTime);
//        const editButton = document.createElement("button");
//        editButton.classList.add("edit-btn");
//        editButton.addEventListener("click", () => editEvent(task.id));
//        const deleteButton = document.createElement("button");
//        deleteButton.classList.add("delete-btn");
//        deleteButton.addEventListener("click", () => deleteEvent(task.id));
//
//        taskContainer.appendChild(title);
//        taskContainer.appendChild(description);
//        taskContainer.appendChild(dateTime);
//        taskContainer.appendChild(editButton);
//        taskContainer.appendChild(deleteButton);
//
//        tasksList.appendChild(taskContainer);
//
//    })
//}
//
//async function saveTask(task) {
//    task.preventDefault()
//    const token = getToken();
//    const taskId = localStorage.getItem("editTasktId");
//
//    const title = document.getElementById("task-title").value;
//
//    const requestData = {
//        title: title,
//    };
//    const method = taskId ? "PUT" : "POST";
//    const url = taskId ? `${AUTH_API_URL}/events/${taskId}` : `${AUTH_API_URL}/tasks/`
//
//    try{
//        const response = await fetch(url, {
//            method: method,
//            headers: {
//                "Authorization": `Bearer ${token}`,
//                "Content-Type": "application/json"
//            },
//            body: JSON.stringify(requestData)
//        });
//
//        if (response.status === 401){
//            window.location.href = `login`
//            return
//        } else if (response.status === 403){
//            console.error("Error 403")
//            return
//        }
//
//        localStorage.removeItem("editTaskId");
//        getUserTasks();
//
//    } catch (error){
//        console.log(error)
//    }
//}
//
//function editTask(taskId) {
//    localStorage.setItem("editTaskId", taskId);
//    window.location.href = `${BASE_URL}/one-task`;
//}
//
//async function loadTaskData() {
//    const taskId = localStorage.getItem("editTaskId");
//    if (!taskId){
//        return;
//    }
//
//    const token = getToken();
//
//    try{
//        const response = await fetch(`${AUTH_API_URL}/events/${taskId}`, {
//            method: "GET",
//            headers: {
//                "Authorization": `Bearer ${token}`,
//                "Content-Type": "application/json"
//            }
//    });
//
//    if (response.status === 401){
//        window.location.href = `login`
//        return
//    } else if (response.status === 403){
//        console.error("Error 403")
//        return
//    }
//
//    const task = await response.json();
//    document.getElementById("task-title").value = task.title;
//
//    } catch (error){
//        console.error("Error loading task:", error)
//    }
//}
//
//async function deleteTask(taskId) {
//    const token = getToken();
//
//    try{
//        const response = await fetch(`${AUTH_API_URL}/tasks/${eventId}`, {
//            method: "DELETE",
//            headers: {
//                "Authorization": `Bearer ${token}`,
//                "Content-Type": "application/json"
//            }
//    });
//
//    if (response.status === 401){
//        window.location.href = `login`
//        return
//    } else if (response.status === 403){
//        console.error("Error 403")
//        return
//    }
//
//    getUserTasks();
//
//    } catch (error){
//        console.error("Error deleting taskt:", error)
//    }
//}
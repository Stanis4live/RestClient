const AUTH_API_URL = "http://localhost:8080";
const BASE_URL = "http://localhost:8899";

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
    const url = eventId ? `${AUTH_API_URL}/events/${eventId}` : `${AUTH_API_URL}/events/`

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
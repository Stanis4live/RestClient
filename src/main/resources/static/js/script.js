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

async function addEvent(event) {
    event.preventDefault()
    const token = getToken();

    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const dateTime = document.getElementById("event-datetime").value;

    const requestData = {
        title: title,
        description: description,
        dateTime: dateTime
    };

    try{
        const response = await fetch(`${AUTH_API_URL}/events`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (response.status === 401 || response.status === 403){
            window.location.href = `login`
            return
        }

        getUserEvents();

    } catch (error){
        console.log(error)
    }
}
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

        const responseText = await response.text();

        if (!response.ok){
            console.error("Server error", responseText)
            throw new Error(await response.text());
        }
        const data = await response.json();
        saveToken(data.token);
        window.location.href = `${BASE_URL}/home`
    } catch (error) {
        errorMessageElement.textContent = "Error " + error.message;
    }
}
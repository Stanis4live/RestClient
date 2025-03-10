const registerFormSubmit = (event) => {
    event.preventDefault();

    let email = document.querySelector("input[type='email']").value;
    let password = document.querySelector("#register-password").value;
    let confirmPassword = document.querySelector("#confirm-password").value;
    let errorMessage = document.querySelector(".error-message");

    errorMessage.textContent = ""

    console.log(email)
    console.log(password)

    if (password != confirmPassword) {
        errorMessage.textContent = "Password do not match"
        errorMessage.style.color = "red"
        return
    }

    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("/register/submit", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
}

const registerBtn = document.querySelector(".register-btn");
if (registerBtn) {
    registerBtn.addEventListener("click", registerFormSubmit);
}

const showPassCheckBox = document.querySelector(".show-pass-checkbox");
console.log(showPassCheckBox)
if (showPassCheckBox) {
    showPassCheckBox.addEventListener("change", function () {
        let passwordFields = document.querySelectorAll("input[type='password]");
        passwordFields.forEach(field => {
            field.type = showPassCheckBox.checked ? "text" : "password";
        });
    });
}


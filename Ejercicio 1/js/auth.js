function login(event) {
    event.preventDefault();

    let form = event.target;

    if(!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const users = [
        { username: "admin", password: "1234", role: "admin"},
        { username: "registrador", password: "1234", role: "registrador"},
        { username: "ver", password: "1234", role: "ver"}
    ]

    let errorMsg = document.getElementById("errorMsg");
    errorMsg.classList.add('d-none');

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        localStorage.removeItem("loginError");
        localStorage.setItem("auth", "true");
        localStorage.setItem("userRole", user.role);

        if(user.role === "admin") {
            window.location.href = "index.html";
        } else if (user.role === "registrador") {
            window.location.href = "registroTiempo.html";
        }else if (user.role === "ver") {
            window.location.href = "index.html";
        }

    } else {
        localStorage.setItem("loginError", "true");
        window.location.reload();
    }
}

window.onload = function() {
    if (localStorage.getItem("loginError") === "true") {
        let errorMsg = document.getElementById("errorMsg");
        errorMsg.classList.remove('d-none');
        localStorage.removeItem("loginError");
    }
};

function logout() {
        localStorage.removeItem("auth");
        localStorage.removeItem("userRole");
        window.location.href = "login.html";
}


function verificarAutenticacion() {
    if (localStorage.getItem("auth") !== "true") {
        window.location.href = "login.html"; // Redirigir si no está autenticado
    }
}
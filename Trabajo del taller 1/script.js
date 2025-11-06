document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('register');
    const loginButton = document.getElementById('login');
    const container = document.getElementById('container');

    // Efecto de transición entre login y registro
    registerButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    loginButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    // Manejo del formulario de login
    const loginForm = document.querySelector('.login-container form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = document.querySelector('.login-container input[type="text"]').value.trim();
            const pass = document.querySelector('.login-container input[type="password"]').value.trim();

            if (user !== "" && pass !== "") {
                console.log("✅ Login correcto, redirigiendo...");
                window.location.href = 'menu.html/menu.html';
            } else {
                alert("Por favor ingresa tu matrícula y contraseña.");
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const themeButton = document.getElementById('toggle-theme');
    const dataButton = document.getElementById('get-data');
    const dataDiv = document.getElementById('data');

    // Проверка наличия формы авторизации
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        const loginBtn = authForm.querySelector('button[type="submit"][formaction="/login"]');
        const registerBtn = authForm.querySelector('button[type="submit"][formaction="/register"]');

        // Обработка формы входа/регистрации
        loginBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            await submitAuthForm('/login');
        });

        registerBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            await submitAuthForm('/register');
        });
    }

    // Theme Switching
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(currentTheme);

    themeButton?.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Get Data
    dataButton?.addEventListener('click', async () => {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            dataDiv.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            dataDiv.textContent = 'Ошибка при получении данных.';
        }
    });

    async function submitAuthForm(url) {
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Успешно!');
                if (result.redirect) {
                    window.location.href = result.redirect;
                }
            } else {
                alert(result.error || 'Произошла ошибка');
            }

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const themeButton = document.getElementById('toggle-theme');
    const dataButton = document.getElementById('get-data');
    const dataDiv = document.getElementById('data');

    // Theme Switching
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(currentTheme);

    themeButton.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Get Data
    dataButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            dataDiv.textContent = JSON.stringify(data, null, 2); // Pretty print
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            dataDiv.textContent = 'Ошибка при получении данных.';
        }
    });

});
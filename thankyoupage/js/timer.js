function formatTime(hours, minutes, seconds) {
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
}

// Функція для оновлення таймера
function updateTimer() {
    // Отримуємо всі елементи таймера за допомогою селекторів
    let timers = document.querySelectorAll('.timer');

    timers.forEach(timer => {
        // Отримуємо значення годин, хвилин та секунд для кожного таймера
        let hours = parseInt(timer.querySelector('.hours').textContent);
        let minutes = parseInt(timer.querySelector('.minutes').textContent);
        let seconds = parseInt(timer.querySelector('.seconds').textContent);

        // Зменшуємо час на одну секунду
        if (seconds > 0) {
            seconds--;
        } else {
            if (minutes > 0) {
                minutes--;
                seconds = 59;
            } else {
                if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    // Таймер завершено
                    clearInterval(timerIntervalTimer);
                    // alert('Час вийшов!');
                    return;
                }
            }
        }

        // Форматуємо та оновлюємо вміст таймера
        const formattedTime = formatTime(hours, minutes, seconds);
        timer.querySelector('.hours').textContent = formattedTime.hours;
        timer.querySelector('.minutes').textContent = formattedTime.minutes;
        timer.querySelector('.seconds').textContent = formattedTime.seconds;
    });
}

// Оновлюємо таймер кожну секунду
let timerIntervalTimer = setInterval(updateTimer, 1000);
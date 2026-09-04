function initTimer() {
    const duration = 30 * 60 * 1000; // 30 хвилин у мілісекундах
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateTimer() {
        let now = Date.now();
        let endTime = localStorage.getItem('timer_end_time');

        // Якщо кешу немає або час вийшов — створюємо новий "кінець"
        if (!endTime || now > endTime) {
            endTime = now + duration;
            localStorage.setItem('timer_end_time', endTime);
        }

        let diff = endTime - now;

        // Розрахунок часу
        let h = Math.floor(diff / (1000 * 60 * 60));
        let m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((diff % (1000 * 60)) / 1000);

        // Форматування (додаємо 0 попереду)
        hoursEl.innerText = h < 10 ? '0' + h : h;
        minutesEl.innerText = m < 10 ? '0' + m : m;
        secondsEl.innerText = s < 10 ? '0' + s : s;

        // Візуальний ефект: якщо годин 0 — робимо їх сірими
        if (h === 0) {
            document.getElementById('hours-block').classList.add('inactive');
        } else {
            document.getElementById('hours-block').classList.remove('inactive');
        }
    }

    // Запускаємо кожну секунду
    updateTimer(); 
    setInterval(updateTimer, 1000);
}

document.addEventListener('DOMContentLoaded', initTimer);
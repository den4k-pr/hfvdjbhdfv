document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".asksContainer-item");
  
  items.forEach((item) => {
    const top = item.querySelector(".asksContainer-item-top");
    const bottom = item.querySelector(".asksContainer-item-bottom");
    const arrow = item.querySelector(".q-arrow");
    // Знаходимо параграф з текстом питання всередині top-блоку
    const qText = top ? top.querySelector(".mainText") : null; 

    // Базові стилі безпечніше задати в CSS, але лишаємо і в JS для закриття
    if (bottom) {
      bottom.style.maxHeight = "0";
      bottom.style.overflow = "hidden";
      bottom.style.transition = "max-height 0.4s ease";
    }

    if (!top) return; // Якщо раптом структура неповна — пропускаємо

    top.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Скидаємо стан УСІХ елементів (закриваємо інші вкладки)
      items.forEach((el) => {
        el.classList.remove("active");
        
        const elBottom = el.querySelector(".asksContainer-item-bottom");
        const elArrow = el.querySelector(".q-arrow");
        const elTop = el.querySelector(".asksContainer-item-top");
        const elQText = elTop ? elTop.querySelector(".mainText") : null;

        if (elBottom) elBottom.style.maxHeight = "0";
        if (elArrow) elArrow.style.transform = "rotate(180deg)";
      });

      // Якщо елемент не був активним — відкриваємо його
      if (!isActive) {
        item.classList.add("active");
        if (bottom) bottom.style.maxHeight = bottom.scrollHeight + "px";
        if (arrow) arrow.style.transform = "rotate(0deg)";
      }
    });
  });
});
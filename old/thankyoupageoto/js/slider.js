// script.js
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1.1, // показує частину наступного слайда як на картинці
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});
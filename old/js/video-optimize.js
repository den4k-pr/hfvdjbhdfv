document.addEventListener('DOMContentLoaded', () => {

    // ==============================================================
    // 1. МИТТЄВИЙ АВТОПЛЕЙ ДЛЯ .s7 ТА .s11 (БЕЗ СКРОЛУ І ЗАТРИМОК)
    // ==============================================================
    const initInstantAutoplay = () => {
        document.querySelectorAll('.s7 video, .s11 video').forEach(video => {
            video.muted = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('loop', '');
            video.setAttribute('autoplay', '');
            video.style.backgroundColor = '#000'; 
            video.preload = 'auto';

            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
            }

            video.load();
            
            const startPlay = () => {
                video.play().catch(err => {
                    console.warn('[Autoplay] Очікування взаємодії з мобільним екраном...', err.message);
                    setTimeout(() => {
                        video.muted = true;
                        video.play().catch(() => {});
                    }, 150);
                });
            };

            if (video.readyState >= 2) {
                startPlay();
            } else {
                video.addEventListener('canplay', startPlay, { once: true });
            }
        });
    };

    initInstantAutoplay();

    // ==============================================================
    // 2. КАСТОМНИЙ ПЛЕЄР ДЛЯ СЛАЙДЕРА (З нативними контролерами при запуску)
    // ==============================================================
    document.querySelectorAll('.first-slider .swiper-slide').forEach(slide => {
        const video = slide.querySelector('video');
        if (!video) return;

        // Спочатку ховаємо нативні контролери
        video.controls = false;
        video.removeAttribute('controls');

        // Створюємо оверлей лише з кнопкою Play (Pause нам не потрібна, бо будуть нативні контролери)
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.innerHTML = `
            <div class="video-play-btn" aria-label="Play">
                <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
                    <polygon class="icon-play" points="32,24 58,40 32,56" fill="white"/>
                </svg>
            </div>
            <div class="video-loading-spinner" style="display:none"></div>
        `;

        slide.style.position = 'relative';
        slide.appendChild(overlay);

        const iconPlay = overlay.querySelector('.icon-play');
        const spinner = overlay.querySelector('.video-loading-spinner');
        const playBtnContainer = overlay.querySelector('.video-play-btn');

        let isHandling = false;
        let isLoading = false;

        // Керування станами: перемикаємо нативні контролери та доступність оверлею
        const setVisualState = (state) => {
            if (state === 'loading') {
                playBtnContainer.style.opacity = '0';
                spinner.style.display = 'block';
                overlay.classList.remove('is-playing');
                overlay.style.pointerEvents = 'auto'; // Дозволяємо кліки
                
                video.controls = false;
                video.removeAttribute('controls');
            } else if (state === 'playing') {
                playBtnContainer.style.opacity = '0';
                spinner.style.display = 'none';
                overlay.classList.add('is-playing');
                overlay.style.pointerEvents = 'none'; // Пропускаємо кліки крізь оверлей на нативні кнопки відео
                
                // ВКЛЮЧАЄМО КОНТРОЛЕР
                video.controls = true;
                video.setAttribute('controls', '');
            } else { // paused / ended
                playBtnContainer.style.opacity = '1';
                if (iconPlay) iconPlay.style.display = '';
                spinner.style.display = 'none';
                overlay.classList.remove('is-playing');
                overlay.style.pointerEvents = 'auto'; // Повертаємо клікабельність оверлею
                
                // ВИКЛЮЧАЄМО КОНТРОЛЕР
                video.controls = false;
                video.removeAttribute('controls');
            }
        };

        const stopAllOthers = () => {
            document.querySelectorAll('.swiper-slide video').forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                }
            });
        };

        const togglePlay = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isLoading || isHandling) return;

            isHandling = true;
            setTimeout(() => { isHandling = false; }, 300);

            if (!video.paused) {
                video.pause();
                setVisualState('paused');
                return;
            }

            isLoading = true;
            setVisualState('loading');

            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.preload = 'auto';
                video.load();
            }

            video.muted = false;
            stopAllOthers();

            const executePlay = () => {
                video.play()
                    .then(() => {
                        isLoading = false;
                        setVisualState('playing');
                    })
                    .catch(err => {
                        console.error('[Player] Помилка відтворення:', err);
                        isLoading = false;
                        setVisualState('paused');
                    });
            };

            if (video.readyState >= 2) {
                executePlay();
            } else {
                video.addEventListener('canplay', executePlay, { once: true });
            }
        };

        overlay.addEventListener('click', togglePlay, true);

        // Синхронізація подій нативного плеєра (якщо користувач зупинив відео нативною кнопкою)
        video.addEventListener('play', () => {
            if (!isLoading) setVisualState('playing');
        });
        video.addEventListener('pause', () => {
            if (!isLoading) setVisualState('paused');
        });
        video.addEventListener('ended', () => {
            isLoading = false;
            setVisualState('paused');
        });
    });

    // Стилі для Оверлею та Спінера
    const style = document.createElement('style');
    style.textContent = `
        .video-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.2s ease;
        }
        .video-overlay.is-playing {
            opacity: 0;
        }
        .video-play-btn {
            width: 20%;
            transition: transform 0.15s ease, opacity 0.2s ease;
            pointer-events: none;
        }
        .video-overlay:active .video-play-btn {
            transform: scale(0.9);
            opacity: 0.8;
        }
        .video-loading-spinner {
            position: absolute;
            width: 45px;
            height: 45px;
            border: 4px solid rgba(255, 255, 255, 0.25);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: video-loader-spin 0.8s linear infinite;
            z-index: 11;
            pointer-events: none;
        }
        @keyframes video-loader-spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // ==============================================================
    // 3. ЗУПИНКА ВІДЕО ПРИ СВАЙПІ СЛАЙДЕРА
    // ==============================================================
    const initSwiperListeners = () => {
        document.querySelectorAll('.swiper').forEach(sliderElement => {
            if (sliderElement.swiper && !sliderElement._videoHandlerAttached) {
                sliderElement._videoHandlerAttached = true;
                sliderElement.swiper.on('slideChangeTransitionStart', () => {
                    document.querySelectorAll('.swiper-slide video').forEach(v => {
                        if (!v.paused) v.pause();
                    });
                });
            }
        });
    };

    initSwiperListeners();
    setTimeout(initSwiperListeners, 500);
    setTimeout(initSwiperListeners, 1500);
});

// document.addEventListener('DOMContentLoaded', () => {

//     // ==============================================================
//     // 1. МИТТЄВИЙ АВТОПЛЕЙ ДЛЯ .s7 ТА .s11 (БЕЗ СКРОЛУ І ЗАТРИМОК)
//     // ==============================================================
//     const initInstantAutoplay = () => {
//         document.querySelectorAll('.s7 video, .s11 video').forEach(video => {
//             video.muted = true;
//             video.setAttribute('muted', '');
//             video.setAttribute('playsinline', '');
//             video.setAttribute('loop', '');
//             video.setAttribute('autoplay', '');
//             video.style.backgroundColor = '#000'; 
//             video.preload = 'auto';

//             if (!video.src && video.dataset.src) {
//                 video.src = video.dataset.src;
//             }

//             video.load();
            
//             const startPlay = () => {
//                 video.play().catch(err => {
//                     console.warn('[Autoplay] Очікування взаємодії з мобільним екраном...', err.message);
//                     setTimeout(() => {
//                         video.muted = true;
//                         video.play().catch(() => {});
//                     }, 150);
//                 });
//             };

//             if (video.readyState >= 2) {
//                 startPlay();
//             } else {
//                 video.addEventListener('canplay', startPlay, { once: true });
//             }
//         });
//     };

//     initInstantAutoplay();

//     // ==============================================================
//     // 2. КАСТОМНИЙ ПЛЕЄР ДЛЯ СЛАЙДЕРА (Swiper — з контролем прогрузки)
//     // ==============================================================
//     document.querySelectorAll('.swiper-slide').forEach(slide => {
//         const video = slide.querySelector('video');
//         if (!video) return;

//         video.controls = false;
//         video.removeAttribute('controls');

//         // Додаємо структуру з урахуванням проміжного етапу лоадера
//         const overlay = document.createElement('div');
//         overlay.className = 'video-overlay';
//         overlay.innerHTML = `
//             <div class="video-play-btn" aria-label="Play">
//                 <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
//                     <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
//                     <polygon class="icon-play" points="32,24 58,40 32,56" fill="white"/>
//                     <g class="icon-pause" style="display:none">
//                         <rect x="26" y="24" width="10" height="32" rx="2" fill="white"/>
//                         <rect x="44" y="24" width="10" height="32" rx="2" fill="white"/>
//                     </g>
//                 </svg>
//             </div>
//             <div class="video-loading-spinner" style="display:none"></div>
//         `;

//         slide.style.position = 'relative';
//         slide.appendChild(overlay);

//         const iconPlay = overlay.querySelector('.icon-play');
//         const iconPause = overlay.querySelector('.icon-pause');
//         const spinner = overlay.querySelector('.video-loading-spinner');
//         const playBtnContainer = overlay.querySelector('.video-play-btn');

//         // Логічні прапори для захисту від подвійного кліку та асинхронних черг
//         let isHandling = false;
//         let isLoading = false;

//         // Контроль трьох станів інтерфейсу: відтворення, пауза, завантаження
//         const setVisualState = (state) => {
//             if (state === 'loading') {
//                 playBtnContainer.style.opacity = '0';
//                 spinner.style.display = 'block';
//                 overlay.classList.remove('is-playing');
//             } else if (state === 'playing') {
//                 playBtnContainer.style.opacity = '1';
//                 iconPlay.style.display = 'none';
//                 iconPause.style.display = '';
//                 spinner.style.display = 'none';
//                 overlay.classList.add('is-playing');
//             } else { // paused
//                 playBtnContainer.style.opacity = '1';
//                 iconPlay.style.display = '';
//                 iconPause.style.display = 'none';
//                 spinner.style.display = 'none';
//                 overlay.classList.remove('is-playing');
//             }
//         };

//         const stopAllOthers = () => {
//             document.querySelectorAll('.swiper-slide video').forEach(v => {
//                 if (v !== video && !v.paused) {
//                     v.pause();
//                 }
//             });
//         };

//         const togglePlay = (e) => {
//             e.preventDefault();
//             e.stopPropagation();

//             // КРИТИЧНИЙ ЗАХИСТ: якщо відео вже завантажується, ігноруємо будь-які повторні натискання
//             if (isLoading || isHandling) return;

//             isHandling = true;
//             setTimeout(() => { isHandling = false; }, 300);

//             // Якщо відео вже грає — ставимо на паузу (тут затримок немає)
//             if (!video.paused) {
//                 video.pause();
//                 setVisualState('paused');
//                 return;
//             }

//             // Якщо відео зупинене — вмикаємо режим прогрузки
//             isLoading = true;
//             setVisualState('loading');

//             if (!video.src && video.dataset.src) {
//                 video.src = video.dataset.src;
//                 video.preload = 'auto';
//                 video.load();
//             }

//             video.muted = false;
//             stopAllOthers();

//             const executePlay = () => {
//                 video.play()
//                     .then(() => {
//                         isLoading = false; // Знімаємо замок тільки після успішного старту
//                         setVisualState('playing');
//                     })
//                     .catch(err => {
//                         console.error('[Player] Помилка відтворення потоку:', err);
//                         isLoading = false;
//                         setVisualState('paused');
//                     });
//             };

//             // Перевіряємо готовність буфера перед виконанням команди
//             if (video.readyState >= 2) {
//                 executePlay();
//             } else {
//                 video.addEventListener('canplay', executePlay, { once: true });
//             }
//         };

//         overlay.addEventListener('click', togglePlay, true);
        
//         overlay.addEventListener('touchstart', () => {
//             if (overlay.classList.contains('is-playing')) {
//                 overlay.classList.add('touched');
//                 setTimeout(() => overlay.classList.remove('touched'), 800);
//             }
//         }, { passive: true });

//         // Синхронізація станів на випадок стороннього втручання (наприклад, свайпу слайдера)
//         video.addEventListener('play', () => {
//             if (!isLoading) setVisualState('playing');
//         });
//         video.addEventListener('pause', () => {
//             if (!isLoading) setVisualState('paused');
//         });
//         video.addEventListener('ended', () => {
//             isLoading = false;
//             setVisualState('paused');
//         });
//     });

//     // Стилі для Overlay та індикатора прогрузки (Spinner)
//     const style = document.createElement('style');
//     style.textContent = `
//         .video-overlay {
//             position: absolute;
//             inset: 0;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             cursor: pointer;
//             z-index: 10;
//             -webkit-tap-highlight-color: transparent;
//             transition: opacity 0.2s ease;
//         }
//         .video-overlay.is-playing {
//             opacity: 0;
//         }
//         .video-overlay.is-playing:active,
//         .video-overlay.is-playing.touched {
//             opacity: 1;
//         }
//         .video-play-btn {
//             width: 20%;
//             transition: transform 0.15s ease, opacity 0.2s ease;
//             pointer-events: none;
//         }
//         .video-overlay:active .video-play-btn {
//             transform: scale(0.9);
//             opacity: 0.8;
//         }
//         /* Стилі індикатора прогрузки */
//         .video-loading-spinner {
//             position: absolute;
//             width: 45px;
//             height: 45px;
//             border: 4px solid rgba(255, 255, 255, 0.25);
//             border-top-color: #ffffff;
//             border-radius: 50%;
//             animation: video-loader-spin 0.8s linear infinite;
//             z-index: 11;
//             pointer-events: none;
//         }
//         @keyframes video-loader-spin {
//             to { transform: rotate(360deg); }
//         }
//     `;
//     document.head.appendChild(style);

//     // ==============================================================
//     // 3. ЗУПИНКА ВІДЕО ПРИ СВАЙПІ СЛАЙДЕРА
//     // ==============================================================
//     const initSwiperListeners = () => {
//         document.querySelectorAll('.swiper').forEach(sliderElement => {
//             if (sliderElement.swiper && !sliderElement._videoHandlerAttached) {
//                 sliderElement._videoHandlerAttached = true;
//                 sliderElement.swiper.on('slideChangeTransitionStart', () => {
//                     document.querySelectorAll('.swiper-slide video').forEach(v => {
//                         if (!v.paused) v.pause();
//                     });
//                 });
//             }
//         });
//     };

//     initSwiperListeners();
//     setTimeout(initSwiperListeners, 500);
//     setTimeout(initSwiperListeners, 1500);
// });
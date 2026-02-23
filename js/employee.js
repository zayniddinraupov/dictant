// Проверка роли
            if (localStorage.getItem("role") !== "employee") { alert("Доступ запрещён"); window.location = "index.html"; }

            // Данные сотрудника
            let employee = localStorage.getItem("employeeName");
            document.getElementById("employee").innerText = "Сотрудник: " + employee;

            // Выбор языка
            let currentLang = localStorage.getItem("dictationLang") || "ru";

            // Статус прохождения диктантов
            let completedDiktats = {
                ru: false,
                uz: false
            };

            // Аудио плееры
            const audioRu = document.getElementById("audio-ru-player");
            const audioUz = document.getElementById("audio-uz-player");

            // Тексты диктантов
            const dictations = {
                ru: "Сегодня хорошая погода и светит солнце",
                uz: "Бугунги кун об-ҳаво яхши ва куёш чиқади"
            };

            let currentDictations = {
                ru: dictations.ru,
                uz: dictations.uz
            };

            let currentDictation = dictations.ru;
            localStorage.setItem("currentDictation", currentDictation);

            // Сохранённые тексты пользователя
            let savedTexts = {
                ru: "",
                uz: ""
            };

            // Установить язык
            function setLanguage(lang) {
                currentLang = lang;
                localStorage.setItem("dictationLang", lang);

                // Сохранить текущий текст перед переключением
                savedTexts[currentLang] = document.getElementById("text-" + currentLang).value;

                // Остановить текущее аудио и таймер
                audioRu.pause();
                audioUz.pause();
                stopTimer("ru");
                stopTimer("uz");

                // Блокировать/разблокировать кнопки языка
                updateLanguageButtons();

                // Сбросить время только если диктант ещё не пройден
                if (!completedDiktats[lang]) {
                    timers[lang].timeLeft = 480;
                    document.getElementById("time-" + lang).innerText = "480";
                    document.getElementById("time-" + lang).style.color = "";
                }

                // Обновить UI кнопок
                document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
                document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add("active");

                // Показать/скрыть аудио блоки с текстовыми полями
                document.getElementById("audio-ru").classList.toggle("active", lang === "ru");
                document.getElementById("audio-uz").classList.toggle("active", lang === "uz");

                // Восстановить сохранённый текст
                document.getElementById("text-ru").value = savedTexts.ru || "";
                document.getElementById("text-uz").value = savedTexts.uz || "";

                // Включить/выключить поля в зависимости от статуса
                document.getElementById("text-ru").disabled = completedDiktats.ru;
                document.getElementById("text-uz").disabled = completedDiktats.uz;

                // Установить текст диктанта
                currentDictation = dictations[lang];
                localStorage.setItem("currentDictation", currentDictation);

                // Если диктант ещё не пройден - воспроизвести аудио и запустить таймер
                if (!completedDiktats[lang]) {
                    if (lang === "ru") {
                        audioRu.currentTime = 0;
                        audioRu.play();
                        document.getElementById("playBtn-ru").classList.add("playing");
                        startTimer("ru");
                    } else {
                        audioUz.currentTime = 0;
                        audioUz.play();
                        document.getElementById("playBtn-uz").classList.add("playing");
                        startTimer("uz");
                    }
                }
            }

            // Обновить доступность кнопок языка
            function updateLanguageButtons() {
                let otherLang = currentLang === "ru" ? "uz" : "ru";
                let isTimerActive = timers[currentLang].active || (timers[currentLang].timeLeft > 0 && !completedDiktats[currentLang]);
                
                // Блокируем кнопку другого языка, если таймер активен
                document.querySelectorAll(".lang-btn").forEach(btn => {
                    let lang = btn.getAttribute("data-lang");
                    if (lang !== currentLang && isTimerActive && !completedDiktats[lang]) {
                        btn.style.opacity = "0.5";
                        btn.style.pointerEvents = "none";
                    } else {
                        btn.style.opacity = "1";
                        btn.style.pointerEvents = "auto";
                    }
                });
            }

            // Инициализация при загрузке
            document.addEventListener("DOMContentLoaded", () => {
                // Показать правильный блок в зависимости от языка
                document.getElementById("audio-ru").classList.toggle("active", currentLang === "ru");
                document.getElementById("audio-uz").classList.toggle("active", currentLang === "uz");
                
                // Обновить кнопки выбора языка
                document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
                document.querySelector(`.lang-btn[data-lang="${currentLang}"]`).classList.add("active");

                // Обработчики для Русского
                document.getElementById("playBtn-ru").addEventListener("click", () => {
                    if (audioRu.paused) {
                        audioRu.play();
                        document.getElementById("playBtn-ru").classList.add("playing");
                    } else {
                        audioRu.pause();
                        document.getElementById("playBtn-ru").classList.remove("playing");
                    }
                });

                document.getElementById("pauseBtn-ru").addEventListener("click", () => {
                    audioRu.pause();
                    document.getElementById("playBtn-ru").classList.remove("playing");
                });

                document.getElementById("restartBtn-ru").addEventListener("click", () => {
                    audioRu.currentTime = 0;
                    audioRu.play();
                    document.getElementById("playBtn-ru").classList.add("playing");
                });

                // Обработчики для Узбекского
                document.getElementById("playBtn-uz").addEventListener("click", () => {
                    if (audioUz.paused) {
                        audioUz.play();
                        document.getElementById("playBtn-uz").classList.add("playing");
                    } else {
                        audioUz.pause();
                        document.getElementById("playBtn-uz").classList.remove("playing");
                    }
                });

                document.getElementById("pauseBtn-uz").addEventListener("click", () => {
                    audioUz.pause();
                    document.getElementById("playBtn-uz").classList.remove("playing");
                });

                document.getElementById("restartBtn-uz").addEventListener("click", () => {
                    audioUz.currentTime = 0;
                    audioUz.play();
                    document.getElementById("playBtn-uz").classList.add("playing");
                });

                // Обновление слайдера и времени для Русского
                audioRu.addEventListener("loadedmetadata", () => {
                    document.getElementById("audioSlider-ru").max = Math.floor(audioRu.duration);
                    updateAudioTimeRu();
                });

                audioRu.addEventListener("timeupdate", () => {
                    document.getElementById("audioSlider-ru").value = Math.floor(audioRu.currentTime);
                    updateAudioTimeRu();
                });

                audioRu.addEventListener("ended", () => {
                    document.getElementById("playBtn-ru").classList.remove("playing");
                });

                document.getElementById("audioSlider-ru").addEventListener("input", () => {
                    audioRu.currentTime = document.getElementById("audioSlider-ru").value;
                });

                // Обновление слайдера и времени для Узбекского
                audioUz.addEventListener("loadedmetadata", () => {
                    document.getElementById("audioSlider-uz").max = Math.floor(audioUz.duration);
                    updateAudioTimeUz();
                });

                audioUz.addEventListener("timeupdate", () => {
                    document.getElementById("audioSlider-uz").value = Math.floor(audioUz.currentTime);
                    updateAudioTimeUz();
                });

                audioUz.addEventListener("ended", () => {
                    document.getElementById("playBtn-uz").classList.remove("playing");
                });

                document.getElementById("audioSlider-uz").addEventListener("input", () => {
                    audioUz.currentTime = document.getElementById("audioSlider-uz").value;
                });
            });

            function updateAudioTimeRu() {
                let cur = Math.floor(audioRu.currentTime);
                let dur = Math.floor(audioRu.duration) || 0;
                document.getElementById("audioTime-ru").innerText = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')} / ${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`;
            }

            function updateAudioTimeUz() {
                let cur = Math.floor(audioUz.currentTime);
                let dur = Math.floor(audioUz.duration) || 0;
                document.getElementById("audioTime-uz").innerText = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')} / ${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`;
            }

            // Перемотка
            function skip(seconds, lang) {
                if (lang === "ru") {
                    audioRu.currentTime = Math.max(0, Math.min(audioRu.duration, audioRu.currentTime + seconds));
                } else {
                    audioUz.currentTime = Math.max(0, Math.min(audioUz.duration, audioUz.currentTime + seconds));
                }
            }

            // Для совместимости
            const playBtn = document.getElementById("playBtn-ru");
            const pauseBtn = document.getElementById("pauseBtn-ru");
            const restartBtn = document.getElementById("restartBtn-ru");
            const slider = document.getElementById("audioSlider-ru");
            const audioTime = document.getElementById("audioTime-ru");

            // Таймеры для каждого языка (8 минут = 480 секунд)
            let timers = {
                ru: { timeLeft: 480, startTime: null, interval: null, active: false },
                uz: { timeLeft: 480, startTime: null, interval: null, active: false }
            };

            // Запустить таймер для языка
            function startTimer(lang) {
                if (timers[lang].active) return;
                if (timers[lang].interval) clearInterval(timers[lang].interval);

                timers[lang].timeLeft = 480;
                timers[lang].startTime = Date.now();
                timers[lang].active = true;

                document.getElementById(`time-${lang}`).innerText = timers[lang].timeLeft;

                // Блокируем другой язык пока идёт таймер
                updateLanguageButtons();

                timers[lang].interval = setInterval(() => {
                    timers[lang].timeLeft--;
                    document.getElementById(`time-${lang}`).innerText = timers[lang].timeLeft;

                    // Предупреждение за 1 минуту
                    if (timers[lang].timeLeft === 60) {
                        document.getElementById(`time-${lang}`).style.color = "#dc3545";
                        document.querySelector(`#timer-${lang}-block .timer`).classList.add("warning");
                    }

                    // Окончание времени
                    if (timers[lang].timeLeft <= 0) {
                        clearInterval(timers[lang].interval);
                        timers[lang].active = false;
                        document.getElementById("text-" + lang).disabled = true;
                        completedDiktats[lang] = true;
                        audioRu.pause();
                        audioUz.pause();
                        document.getElementById("playBtn-ru").classList.remove("playing");
                        document.getElementById("playBtn-uz").classList.remove("playing");

                        alert("Время вышло! Нажмите 'Отправить' для завершения диктанта.");
                    }
                }, 1000);
            }

            // Остановить таймер
            function stopTimer(lang) {
                if (timers[lang].interval) {
                    clearInterval(timers[lang].interval);
                    timers[lang].active = false;
                }
                // Обновить доступность кнопок
                updateLanguageButtons();
            }

            // Общий таймер (для совместимости)
            let timeLeft = 480;
            let startTime = Date.now();
            let timer = null;

            // Подсветка ошибок для отображения
            function highlightErrorsForEmployee(original, written) {
                let oWords = original.split(/\s+/);
                let wWords = written.split(/\s+/);
                let errors = 0;
                let correctCount = 0;
                let result = [];

                for (let i = 0; i < oWords.length; i++) {
                    let word = wWords[i] || "";
                    let cleanOriginal = oWords[i].replace(/[.,!?]/g, '').toLowerCase();
                    let cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();

                    if (cleanWord !== cleanOriginal) {
                        result.push(`<span style="background:#ffcccc;text-decoration:underline red;font-weight:bold;padding:2px 4px;border-radius:3px;">${word || "[Пусто]"}</span>`);
                        errors++;
                    } else {
                        result.push(`<span style="background:#ccffcc;padding:2px 4px;border-radius:3px;">${word}</span>`);
                        correctCount++;
                    }
                }
                return { html: result.join(" "), errors: errors, correctCount: correctCount };
            }

            // Отправка диктанта
            function submitDictation(lang) {
                try {
                    stopTimer(lang);

                    // Заблокировать поле после отправки
                    document.getElementById("text-" + lang).disabled = true;
                    completedDiktats[lang] = true;

                    let textField = document.getElementById("text-" + lang);
                    let written = textField.value;
                    let originalText = dictations[lang];

                    if (!written.trim()) {
                        alert("Пожалуйста, введите текст диктанта");
                        document.getElementById("text-" + lang).disabled = false;
                        completedDiktats[lang] = false;
                        return;
                    }

                    if (!originalText) {
                        alert("Ошибка: текст диктанта не найден.");
                        return;
                    }

                    let duration = 480 - timers[lang].timeLeft;
                    let h = highlightErrorsForEmployee(originalText, written);
                    let totalWords = originalText.split(/\s+/).length;

                    // Сохраняем результат
                    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
                    submissions.push({
                        employee: employee,
                        dictation: originalText,
                        original: originalText,
                        written: written,
                        timeSpent: duration,
                        date: new Date().toLocaleString(),
                        language: lang
                    });
                    localStorage.setItem("submissions", JSON.stringify(submissions));

                    // Показать результат
                    let resultHtml = `
<h3 style="color:#2c5364;text-align:center;">📊 Результат диктанта (${lang === 'ru' ? '🇷🇺 Русский' : '🇺🇿 Узбекский'})</h3>
<div style="display:flex;gap:20px;margin:15px 0;padding:15px;background:#e9ecef;border-radius:8px;justify-content:center;">
<div style="text-align:center;padding:10px 20px;"><div style="font-size:28px;font-weight:bold;color:#28a745;">${h.correctCount}</div><div style="font-size:12px;color:#666;">Правильно</div></div>
<div style="text-align:center;padding:10px 20px;"><div style="font-size:28px;font-weight:bold;color:#dc3545;">${h.errors}</div><div style="font-size:12px;color:#666;">Ошибок</div></div>
<div style="text-align:center;padding:10px 20px;"><div style="font-size:28px;font-weight:bold;color:#2c5364;">${Math.floor(h.correctCount / totalWords * 100)}%</div><div style="font-size:12px;color:#666;">Правильность</div></div>
</div>
<div style="background:#f8d7da;padding:15px;border-radius:10px;margin:10px 0;border-left:4px solid #dc3545;">
<h4 style="margin:0 0 10px 0;color:#721c24;">✍️ Ваш текст (с ошибками):</h4>
<p style="margin:0;font-size:16px;line-height:1.8;">${h.html}</p>
</div>
<div style="text-align:center;margin-top:20px;">
<button id="continueBtn" style="padding:15px 40px;font-size:18px;background:#11998e;">Продолжить</button>
</div>
`;

                    let container = document.querySelector(".container");
                    container.innerHTML = resultHtml;

                    // Добавить обработчик кнопки
                    document.getElementById("continueBtn").addEventListener("click", function() {
                        continueToNext(lang);
                    });

                    audioRu.pause();
                    audioUz.pause();

                } catch (e) {
                    console.error("Ошибка при отправке:", e);
                    alert("Произошла ошибка: " + e.message);
                }
            }

            // Продолжить на следующий диктант
            function continueToNext(completedLang) {
                if (completedLang === "ru") {
                    // Перезагрузить страницу с узбекским языком
                    localStorage.setItem("dictationLang", "uz");
                    window.location.reload();
                } else if (completedLang === "uz") {
                    // После узбекского - завершаем
                    finishAndExit();
                }
            }

            // Завершить и выйти
            function finishAndExit() {
                localStorage.removeItem("currentDictation");
                window.location = "index.html";
            }

            // Выход
            function logout() {
                if (confirm("Вы уверены, что хотите выйти?")) {
                    localStorage.removeItem("role");
                    localStorage.removeItem("employeeName");
                    localStorage.removeItem("currentDictation");
                    window.location = "index.html";
                }
            }
            
// Проверка роли
if(localStorage.getItem("role")!=="director"){alert("Доступ запрещён");window.location="index.html";}

// Тексты диктантов по умолчанию
const defaultDictations = {
ru: "Сегодня хорошая погода и светит солнце",
uz: "Бугунги кун об-ҳаво яхши ва куёш чиқади"
};

// Загрузить тексты диктантов
function loadDictations(){
let saved = localStorage.getItem("dictationTexts");
if(saved){
return JSON.parse(saved);
}
return defaultDictations;
}

// Сохранить тексты диктантов
function saveDictations(){
let ru = document.getElementById("editRu").value.trim();
let uz = document.getElementById("editUz").value.trim();

if(!ru || !uz){
alert("Пожалуйста, заполните оба текста");
return;
}

let texts = {ru: ru, uz: uz};
localStorage.setItem("dictationTexts", JSON.stringify(texts));
alert("Тексты диктантов сохранены!");
}

// Показать панель админа (для директора)
function showAdminPanel(){
document.getElementById("adminPanel").style.display = "block";
// Загрузить текущие тексты
let texts = loadDictations();
document.getElementById("editRu").value = texts.ru;
document.getElementById("editUz").value = texts.uz;
}

// Показать панель админа при загрузке
showAdminPanel();

let lastSubmissions=JSON.stringify([]);
let sortKey=null;
let sortOrder="asc";

// Исправленная функция подсветки ошибок
function highlightErrors(original, written) {
    let oWords = original.split(/\s+/);
    let wWords = written.split(/\s+/);
    let errors = 0;
    let result = [];
    for (let i = 0; i < oWords.length; i++) {
        let word = wWords[i] || "";
        let cleanOriginal = oWords[i].replace(/[.,!?]/g, '').toLowerCase();
        let cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
        if (cleanWord !== cleanOriginal) {
            result.push(`<span class="wrong">${word || "[Пусто]"}</span>`);
            errors++;
        } else {
            result.push(`<span class="correct">${word}</span>`);
        }
    }
    return { html: result.join(" "), errors: errors, correctCount: oWords.length - errors };
}

// Статус
function getStatus(errors, total){
    let perc = (total-errors)/total;
    if(perc>=0.9) return "Отлично";
    else if(perc>=0.7) return "Хорошо";
    else return "Плохо";
}

// Отобразить таблицу
function displayTable(data){
    const tbody=document.querySelector("#dictationTable tbody");
    tbody.innerHTML="";
    data.forEach(item=>{
        let h=highlightErrors(item.original,item.written);
        let totalWords = item.original.split(/\s+/).length;
        let status=getStatus(h.errors,totalWords);
        let perc=Math.floor(h.correctCount/totalWords*100);
        let row=document.createElement("tr");
        row.dataset.progress=perc;
        row.dataset.errors=h.errors;
        row.dataset.timeSpent=item.timeSpent;
        row.dataset.date=item.date;
        row.dataset.employee=item.employee;
        row.dataset.status=status;
        row.innerHTML=`<td>${item.employee}</td>
        <td>${item.language === 'uz' ? '🇺🇿' : '🇷🇺'}</td>
        <td>${item.original}</td>
        <td>${h.html}</td>
        <td>${item.date}</td>
        <td>${item.timeSpent}</td>
        <td>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${perc}%;background:linear-gradient(to right,green ${perc}%,red 0%);"></div>
            </div>
        </td>
        <td><button onclick='viewDictation(${JSON.stringify(item)})'>Посмотреть</button></td>`;
        tbody.appendChild(row);
    });
    applySort();
}

// Фильтр по языку
function filterByLanguage(){
    let lang=document.getElementById("filterLanguage").value;
    let submissions=JSON.parse(localStorage.getItem("submissions"))||[];
    if(!lang){displayTable(submissions);return;}
    let filtered=submissions.filter(item=>item.language===lang);
    displayTable(filtered);
}

// Фильтр по сотруднику
function filterByEmployee(){
    let name=document.getElementById("searchEmployee").value.trim().toLowerCase();
    let submissions=JSON.parse(localStorage.getItem("submissions"))||[];
    if(!name){displayTable(submissions);return;}
    let filtered=submissions.filter(item=>item.employee.toLowerCase().includes(name));
    displayTable(filtered);
}

// Очистить фильтр сотрудника
function clearEmployeeFilter(){
    document.getElementById("searchEmployee").value = "";
    displayTable(JSON.parse(localStorage.getItem("submissions"))||[]);
}

// Сортировка
const headers=document.querySelectorAll("#dictationTable th[data-sort]");
headers.forEach(th=>{
    th.addEventListener("click",()=>{
        const key=th.dataset.sort;
        sortOrder=th.classList.contains("sort-asc")?"desc":"asc";
        sortKey=key;
        headers.forEach(h=>h.classList.remove("sort-asc","sort-desc"));
        th.classList.add(sortOrder==="asc"?"sort-asc":"sort-desc");
        applySort();
    });
});
function applySort(){
    if(!sortKey) return;
    let rows=Array.from(document.querySelectorAll("#dictationTable tbody tr"));
    rows.sort((a,b)=>{
        let valA=a.dataset[sortKey], valB=b.dataset[sortKey];
        if(sortKey==="errors"||sortKey==="timeSpent"||sortKey==="progress") {valA=parseInt(valA); valB=parseInt(valB);}
        if(valA<valB) return sortOrder==="asc"?-1:1;
        if(valA>valB) return sortOrder==="asc"?1:-1;
        return 0;
    });
    const tbody=document.querySelector("#dictationTable tbody");
    rows.forEach(r=>tbody.appendChild(r));
}

// Функция подсветки ошибок для модального окна
function highlightErrorsDetailed(original, written) {
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
            result.push(`<span class="error-word">${word || "[Пусто]"}</span>`);
            errors++;
        } else {
            result.push(`<span class="correct-word">${word}</span>`);
            correctCount++;
        }
    }
    return { html: result.join(" "), errors: errors, correctCount: correctCount };
}

// Открыть модальное окно - показать все диктанты сотрудника
function viewDictation(item) {
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    let employeeName = item.employee;
    
    // Получить все диктанты этого сотрудника
    let employeeDiktats = submissions.filter(s => s.employee === employeeName);
    
    document.getElementById("modalEmployee").innerText = employeeName;
    
    let container = document.getElementById("allDiktatsContainer");
    container.innerHTML = "";
    
    employeeDiktats.forEach((dik, index) => {
        let h = highlightErrorsDetailed(dik.original, dik.written);
        let totalWords = dik.original.split(/\s+/).length;
        let lang = dik.language === 'uz' ? '🇺🇿 Узбекский' : '🇷🇺 Русский';
        
        let diktatHtml = `
        <div class="dictation-detail" style="background:#f8f9fa;padding:15px;border-radius:10px;margin-bottom:15px;border-left:4px solid ${dik.language === 'uz' ? '#e8cbc0' : '#636fa4'};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h4 style="margin:0;">${lang}</h4>
                <span style="background:#e9ecef;padding:5px 10px;border-radius:5px;font-size:12px;">${dik.date}</span>
            </div>
            <div style="display:flex;gap:15px;margin-bottom:10px;">
                <div style="text-align:center;padding:8px 15px;background:white;border-radius:8px;">
                    <div style="font-size:20px;font-weight:bold;color:#28a745;">${h.correctCount}</div>
                    <div style="font-size:11px;color:#666;">Правильно</div>
                </div>
                <div style="text-align:center;padding:8px 15px;background:white;border-radius:8px;">
                    <div style="font-size:20px;font-weight:bold;color:#dc3545;">${h.errors}</div>
                    <div style="font-size:11px;color:#666;">Ошибок</div>
                </div>
                <div style="text-align:center;padding:8px 15px;background:white;border-radius:8px;">
                    <div style="font-size:20px;font-weight:bold;color:#2c5364;">${Math.floor(h.correctCount/totalWords*100)}%</div>
                    <div style="font-size:11px;color:#666;">Правильность</div>
                </div>
                <div style="text-align:center;padding:8px 15px;background:white;border-radius:8px;">
                    <div style="font-size:20px;font-weight:bold;color:#666;">${dik.timeSpent}</div>
                    <div style="font-size:11px;color:#666;">Секунд</div>
                </div>
            </div>
            <div style="background:white;padding:10px;border-radius:8px;margin-top:10px;">
                <div style="font-size:12px;color:#28a745;font-weight:bold;margin-bottom:5px;">📝 Оригинал:</div>
                <div style="margin-bottom:10px;">${dik.original}</div>
                <div style="font-size:12px;color:#dc3545;font-weight:bold;margin-bottom:5px;">✍️ Написано:</div>
                <div>${h.html}</div>
            </div>
        </div>
        `;
        container.innerHTML += diktatHtml;
    });
    
    document.getElementById("dictationModal").style.display = "block";
}

// Закрыть модальное окно
function closeModal() {
    document.getElementById("dictationModal").style.display = "none";
}

// Закрыть по клику вне окна
window.onclick = function(event) {
    let modal = document.getElementById("dictationModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Очистить все данные
function clearAll(){
    if(confirm("Вы уверены, что хотите удалить все диктанты? Это действие нельзя отменить.")){
        localStorage.removeItem("submissions");
        displayTable([]);
        alert("Все данные очищены");
    }
}

// Экспорт в Excel
function exportExcel(){
    let table=document.getElementById("dictationTable");
    let csv=[];
    for(let row of table.rows){
        let rowData=[];
        for(let cell of row.cells){
            rowData.push('"' + cell.innerText.replace(/"/g,'""') + '"');
        }
        csv.push(rowData.join(","));
    }
    let blob=new Blob([csv.join("\n")],{type:'text/csv;charset=utf-8;'});
    let url=URL.createObjectURL(blob);
    let a=document.createElement('a');
    a.href=url;
    a.download="dictations.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// Выход
function logout(){
    if(confirm("Вы уверены, что хотите выйти?")){
        localStorage.removeItem("role");
        window.location="index.html";
    }
}

// Автообновление каждые 5 секунд
setInterval(()=>{
    let submissions=JSON.parse(localStorage.getItem("submissions"))||[];
    let currentSub=JSON.stringify(submissions);
    if(currentSub!==lastSubmissions){
        lastSubmissions=currentSub;
        displayTable(submissions);
    }
},5000);

// Первичная загрузка
displayTable(JSON.parse(localStorage.getItem("submissions"))||[]);
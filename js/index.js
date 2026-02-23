// Руководитель
const directorLogin="director";
const directorPass="Admin_2026";

// Сотрудники
const employees=[
{login:"Иванов Иван", password:"12345"},
{login:"Петров Петр", password:"54321"},
{login:"Сидоров Сидор", password:"11111"}
];

function login(){
let login=document.getElementById("login").value.trim();
let pass=document.getElementById("password").value.trim();
let errorBox=document.getElementById("error");

if(!login || !pass){
errorBox.innerText="Введите ФИО и пароль";
return;
}

// Руководитель
if(login===directorLogin){
if(pass===directorPass){
localStorage.setItem("role","director");
window.location="director.html";
}else{
errorBox.innerText="Неверный пароль руководителя";
return;
}
}else{
// Сотрудник
let emp=employees.find(e=>e.login===login && e.password===pass);
if(emp){
localStorage.setItem("role","employee");
localStorage.setItem("employeeName",emp.login);

// Все диктанты
const dictations = [
"Сегодня хорошая погода и светит солнце",
"Работа требует внимательности и ответственности",
"Командная работа повышает эффективность",
"Обучение сотрудников важно для компании",
"Новая технология помогает развивать бизнес",
"Каждый сотрудник должен соблюдать правила",
"Совещание состоится в конференц-зале",
"Компания достигла больших успехов",
"Система автоматизации упрощает работу",
"Руководитель ценит инициативных работников"
];

let randomIndex=Math.floor(Math.random()*dictations.length);
localStorage.setItem("currentDictation",dictations[randomIndex]);

window.location="employee.html";
}else{
errorBox.innerText="Неверный логин или пароль сотрудника";
}
}
}
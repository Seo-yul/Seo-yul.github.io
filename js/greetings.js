const greetingForm = document.getElementById('greeting-form');
const inputName = document.getElementById('username');
const logoutBtn = document.getElementById('logout-btn');
const greeting = document.getElementById('greeting');

const HIDDEN_CLASSNAME = 'hidden';

function setGreeting() {
    greetingForm.classList.add(HIDDEN_CLASSNAME);
    greeting.innerText = `${localStorage.getItem('username')}님, 안녕하세요!`;
    greeting.classList.remove(HIDDEN_CLASSNAME);
    logoutBtn.classList.remove(HIDDEN_CLASSNAME);
}

if (localStorage.getItem('username') !== null) {
    setGreeting();
}

function onLoginSubmit(event) {
  event.preventDefault();
  const username = inputName.value;
  localStorage.setItem('username', username);
  setGreeting();
}

function onLogoutSubmit(event) {
    event.preventDefault();
    localStorage.removeItem('username');
    greetingForm.classList.remove(HIDDEN_CLASSNAME);
    greeting.classList.add(HIDDEN_CLASSNAME);
    logoutBtn.classList.add(HIDDEN_CLASSNAME);
}

greetingForm.addEventListener('submit', onLoginSubmit);
logoutBtn.addEventListener('click', onLogoutSubmit);
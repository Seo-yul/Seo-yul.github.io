const HIDEN_CLASSNAME = 'hidden';
const greetingForm = document.getElementById('greeting-form');
const logoutBtn = document.getElementById('logout-btn');

const todoForm = document.getElementById('todo-form');
const todoInput = todoForm.querySelector('input');
const todoList = document.getElementById('todo-list');

const TODOS_KEY = 'toDos';

function onLogoutSubmit(event) {
    event.preventDefault();
    todoForm.classList.add(HIDEN_CLASSNAME);
    todoList.classList.add(HIDEN_CLASSNAME);
    localStorage.removeItem(TODOS_KEY);
    const lis = todoList.querySelectorAll('li');
    lis.forEach(li => li.remove());
    toDos = [];
}

logoutBtn.addEventListener('click', onLogoutSubmit);

let toDos = [];

function saveToDos() {
    localStorage.setItem(TODOS_KEY, JSON.stringify(toDos));
}

function removeHidden() {
    todoForm.classList.remove(HIDEN_CLASSNAME);
    todoList.classList.remove(HIDEN_CLASSNAME);
}

const savedUsername = localStorage.getItem('username');
if (savedUsername) {
    removeHidden();
} 

function onLoginSubmit(event) {
    event.preventDefault();
    removeHidden();
}

function deleteToDo(event) {
    const li = event.target.parentElement;
    li.remove();
    toDos = toDos.filter(toDo => toDo.id !== parseInt(li.id));
    saveToDos();    
    
    

}

function paintToDo(newTodoObj) {
    const li = document.createElement('li');
    li.id = newTodoObj.id;
    const span = document.createElement('span');
    span.innerText = newTodoObj.text;
    li.appendChild(span);

    const button = document.createElement('button');
    button.innerText = '❌';
    button.addEventListener('click', deleteToDo);
    li.appendChild(button);

    todoList.appendChild(li);
}

function handleToDoSubmit(event) {
    event.preventDefault();
    
    const newTodo = todoInput.value;
    todoInput.value = '';
    const newTodoObj = {
        id: Date.now(),
        text: newTodo,
    }
    toDos.push(newTodoObj);
    paintToDo(newTodoObj);
    saveToDos();
}

greetingForm.addEventListener('submit', onLoginSubmit);
todoForm.addEventListener('submit', handleToDoSubmit);

const savedToDos = localStorage.getItem('toDos');
if (savedToDos) {
    const parsedToDos = JSON.parse(savedToDos);
    toDos = parsedToDos;
    parsedToDos.forEach(paintToDo);
}
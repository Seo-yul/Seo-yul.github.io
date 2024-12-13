const images = ["1.jpg", "2.jpg", "3.jpg"];
const chosenImage = images[Math.floor(Math.random() * images.length)];
const body = document.body;
body.style.backgroundImage = `url('img/${chosenImage}')`;
body.style.backgroundPosition = 'center';
body.style.backgroundRepeat = 'no-repeat';
body.style.backgroundAttachment = 'fixed';
body.style.backgroundSize = 'cover';
const clockTitle = document.querySelector('.clock');

function getTime() {
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0');
  clockTitle.innerText = `${hours}:${minutes}:${seconds}`;
}
getTime();
setInterval(getTime, 1000);

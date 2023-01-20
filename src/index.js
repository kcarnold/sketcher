import { html, render } from "lit-html";

//import "./styles.css";
let app = document.getElementById("app");

let size = 224;
let saveNum = 0,
  saveName = "image";
app.innerHTML = `
<canvas width="${size}" height="${size}"></canvas>
<br>
`;

function getRelativePosition(event) {
  /* use touch or mouse position */
  //document.getElementById("debug").innerHTML += "\n" + (event.clientX != null);
  let x = event.clientX != null ? event.clientX : event.touches[0].clientX,
    y = event.clientY != null ? event.clientY : event.touches[0].clientY;
  return { x: x - event.target.offsetTop, y: y - event.target.offsetLeft };
}

let canvas = document.querySelector("canvas");
canvas.style.border = "1px solid black";
let ctx = canvas.getContext("2d");

function clear() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveNum += 1;
}
clear();

render(html``, app);
function adjSize(d) {
  canvas.width = canvas.height = size += d;
  clear();
}

/* Controls */
render(
  html`<button @click=${clear}>Clear</button>
    <button @click=${() => adjSize(10)}>+</button>
    <button @click=${() => adjSize(-10)}>-</button>
    <input
      @input=${({ target }) => {
        saveNum = 0;
        saveName = target.value;
      }}
      value="image"
      size="5"
    />`,
  app
);

let nowDrawing = false;

function down(event) {
  event.preventDefault();
  nowDrawing = true;
  event.target.focus();

  window.addEventListener("mousemove", draw);
  window.addEventListener("touchmove", draw);
  window.addEventListener("mouseup", up);
  window.addEventListener("touchend", up);

  ctx.lineCap = "round"; // https://hectorip.github.io/Eloquent-JavaScript-ES-online/chapters/19_paint.html
  ctx.beginPath();
  let { x, y } = getRelativePosition(event);
  ctx.moveTo(x, y);
}

function draw(event) {
  event.preventDefault();
  if (!nowDrawing) return;
  let { x, y } = getRelativePosition(event);

  ctx.lineTo(x, y);
  ctx.stroke();
}

function up(event) {
  ctx.closePath();
  nowDrawing = false;
  updateSaveLink();

  window.removeEventListener("mousemove", draw);
  window.removeEventListener("touchmove", draw);
  window.removeEventListener("mouseup", up);
  window.removeEventListener("touchend", up);
}

canvas.addEventListener("mousedown", down);
canvas.addEventListener("touchstart", down);

let saveLink = document.createElement("a");
saveLink.appendChild(document.createTextNode("Save"));
app.appendChild(saveLink);

let shareBtn = null;
if (navigator.canShare) {
  shareBtn = document.createElement("button");
  app.appendChild(shareBtn);
  shareBtn.innerText = "Share";
  shareBtn.addEventListener("click", () => {
    canvas.toBlob(async (blob) => {
      try {
        await navigator.share({
          files: [new File([blob], saveLink.download, { type: blob.type })],
          title: "Sketch"
        });
      } catch {
        // Ignore any errors.
      }
    });
  });
}

function updateSaveLink() {
  saveLink.href = canvas.toDataURL();
  saveLink.download = `${saveName}_${saveNum}.png`;
}

updateSaveLink();

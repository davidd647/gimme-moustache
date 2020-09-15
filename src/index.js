import $ from "jquery";

const canvas = document.querySelector("#draw");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
ctx.strokeStyle = "#000000";
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 3;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let startedDrawing = false;
let firstXCoord = 0;
let firstYCoord = 0;

function draw(e) {
  if (!isDrawing) return;

  if (tool === "spray") {
    ctx.strokeStyle = color.value;
    ctx.globalAlpha = opacity.value / 100;
  } else if (tool === "pencil") {
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = opacity.value / 100;
  } else if (tool === "eraser") {
    ctx.strokeStyle = "#FFFFFF";
    ctx.globalAlpha = 1;
  }

  if (tool === "pencil" || tool === "spray" || tool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
}

function drawBox(x1, y1, x2, y2) {
  ctx.strokeStyle = color.value;
  ctx.beginPath();
  ctx.rect(x1, y1, x2 - x1, y2 - y1);
  ctx.globalAlpha = opacity.value / 100;
  ctx.stroke();
}

function drawCircle(x1, y1, x2, y2) {
  ctx.strokeStyle = color.value;
  ctx.beginPath();
  // radius is hypoteneus of a triangle if you're given x1,y1 and x2,y2
  // from h^2 = x^2 + y^2, we can rearrange for the following equation:
  const radius = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
  ctx.globalAlpha = opacity.value / 100;
  ctx.stroke();
}

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];

  if (tool === "line" || tool === "rectangle" || tool === "circle") {
    if (!startedDrawing) {
      firstXCoord = e.offsetX;
      firstYCoord = e.offsetY;
      startedDrawing = true;
    }
  }
});
canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  console.log(tool);
  if (startedDrawing && tool === "line") {
    ctx.strokeStyle = color.value;
    ctx.beginPath();
    ctx.moveTo(firstXCoord, firstYCoord);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.globalAlpha = opacity.value / 100;
    ctx.stroke();
    startedDrawing = false;
  } else if (startedDrawing && tool === "rectangle") {
    drawBox(firstXCoord, firstYCoord, e.offsetX, e.offsetY);
    startedDrawing = false;
  } else if (startedDrawing && tool === "circle") {
    drawCircle(firstXCoord, firstYCoord, e.offsetX, e.offsetY);
    startedDrawing = false;
  }
});
canvas.addEventListener("mouseout", (e) => {
  isDrawing = false;
  if (startedDrawing && tool === "line") {
    ctx.beginPath();
    ctx.moveTo(firstXCoord, firstYCoord);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.globalAlpha = opacity.value / 100;
    ctx.stroke();
    startedDrawing = false;
  } else if (startedDrawing && tool === "rectangle") {
    drawBox(firstXCoord, firstYCoord, e.offsetX, e.offsetY);
    startedDrawing = false;
  } else if (startedDrawing && tool === "circle") {
    drawCircle(firstXCoord, firstYCoord, e.offsetX, e.offsetY);
    startedDrawing = false;
  }
});

const pencil = document.getElementById("pencil");
const line = document.getElementById("line");
const spray = document.getElementById("spray");
const eraser = document.getElementById("eraser");
const rectangle = document.getElementById("rectangle");
const circle = document.getElementById("circle");
const save = document.getElementById("save");
const savedContainer = document.getElementById("saved");

const snapshots = JSON.parse(localStorage.getItem("snapshots")) || [];

snapshots.forEach((snapshot) => {
  const div = document.createElement("img");
  div.src = snapshot;
  div.classList.add("mr-2");
  savedContainer.insertBefore(div, savedContainer.firstChild);
});

let tool = "pencil";

pencil.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;

  tool = this.id;
});
line.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;

  tool = this.id;
});
spray.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#BADA5555";
  ctx.lineWidth = 100;

  tool = this.id;
});
eraser.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 50;

  tool = this.id;
});
rectangle.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;

  tool = this.id;
});
circle.addEventListener("click", function (e) {
  document.querySelector(".icon-selected").classList.remove("icon-selected");
  this.classList.add("icon-selected");
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;

  tool = this.id;
});
save.addEventListener("click", function () {
  // convert canvas snapshot into data for a variable...
  //  (( https://stackoverflow.com/questions/16792805/how-to-take-screenshot-of-canvas ))
  var dataURL = canvas.toDataURL();

  // save image to localStorage...
  // localStorage.setItem("snapshots", dataURL);
  // JSON.stringify
  snapshots.push(dataURL);
  console.log(snapshots);
  localStorage.setItem("snapshots", JSON.stringify(snapshots));
  // localStorage.getItem
  // localStorage.removeItem

  console.log("savedContainer is:");
  console.log(savedContainer);
  // console.log(dataURL);
  // add div to .savedContainer...
  const div = document.createElement("img");
  div.src = dataURL;
  div.classList.add("mr-2");
  savedContainer.insertBefore(div, savedContainer.firstChild);
});

const color = document.getElementById("color");
const opacity = document.getElementById("opacity");

const test = document.getElementById("test");

function newImage() {
  $.ajax({
    url: "https://randomuser.me/api/",
    dataType: "json",
    success: function (data) {
      const src = data.results[0].picture.large;
      console.log(src);
      test.src = src;
      // const image = new Image();
      // image.src = data.results[0].picture.large;
      ctx.drawImage(test, 0, 0);
    },
  });
}

newImage();

const newFace = document.getElementById("newface");

newFace.addEventListener("click", function (e) {
  newImage();
  ctx.drawImage(test, 0, 0, 800, 600);
});

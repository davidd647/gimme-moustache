import Unsplash, { toJson } from "unsplash-js";

var gimmeMoustache = {
  canvas: document.querySelector("#draw"),
  ctx: null,

  isDrawing: false,
  lastX: 0,
  lastY: 0,

  startedDrawing: false,
  firstXCoord: 0,
  firstYCoord: 0,

  pencil: document.getElementById("pencil"),
  line: document.getElementById("line"),
  spray: document.getElementById("spray"),
  eraser: document.getElementById("eraser"),
  rect: document.getElementById("rectangle"),
  circle: document.getElementById("circle"),
  saveEl: document.getElementById("save"),
  savedContainer: document.getElementById("saved"),

  newface: document.querySelectorAll(".gm-newface"),

  color: document.getElementById("color"),
  opacity: document.getElementById("opacity"),

  // default tool
  currentTool: "pencil",
  isDrawing: false,
  snapshots: [],

  continuous(e) {
    if (!this.isDrawing) return;

    if (this.currentTool === "spray" || this.currentTool === "pencil") {
      this.ctx.strokeStyle = color.value;
      this.ctx.globalAlpha = opacity.value / 100;
    } else if (this.currentTool === "eraser") {
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.globalAlpha = 1;
    }

    if (this.currentTool === "spray" || this.currentTool === "eraser") {
      this.ctx.lineWidth = 30;
    } else {
      this.ctx.lineWidth = 3;
    }

    if (
      this.currentTool === "pencil" ||
      this.currentTool === "spray" ||
      this.currentTool === "eraser"
    ) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.stroke();

      [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }
  },

  drawBox(x1, y1, x2, y2) {
    this.ctx.strokeStyle = color.value;
    this.ctx.beginPath();
    this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
    this.ctx.globalAlpha = opacity.value / 100;
    this.ctx.stroke();
  },

  drawCircle(x1, y1, x2, y2) {
    this.ctx.strokeStyle = color.value;
    this.ctx.beginPath();
    // radius is hypoteneus of a triangle if you're given x1,y1 and x2,y2
    // from h^2 = x^2 + y^2, we can rearrange for the following equation:
    const radius = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    this.ctx.globalAlpha = opacity.value / 100;
    this.ctx.stroke();
  },

  handleMouseMove(plugin, e) {
    this.continuous(e);
  },

  handleMouseDown(plugin, e) {
    this.isDrawing = true;

    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

    if (
      this.currentTool === "line" ||
      this.currentTool === "rectangle" ||
      this.currentTool === "circle"
    ) {
      if (!this.startedDrawing) {
        this.firstXCoord = e.offsetX;
        this.firstYCoord = e.offsetY;
        this.startedDrawing = true;
      }
    }
  },

  handleMouseUp(plugin, e) {
    this.isDrawing = false;
    if (this.startedDrawing && this.currentTool === "line") {
      this.ctx.strokeStyle = this.color.value;
      this.ctx.beginPath();
      this.ctx.moveTo(this.firstXCoord, this.firstYCoord);
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.globalAlpha = opacity.value / 100;
      this.ctx.stroke();
      this.startedDrawing = false;
    } else if (this.startedDrawing && this.currentTool === "rectangle") {
      this.drawBox(this.firstXCoord, this.firstYCoord, e.offsetX, e.offsetY);
      this.startedDrawing = false;
    } else if (this.startedDrawing && this.currentTool === "circle") {
      this.drawCircle(this.firstXCoord, this.firstYCoord, e.offsetX, e.offsetY);
      this.startedDrawing = false;
    }
  },

  selectTool(toolSelected) {
    document.querySelector(".icon-selected").classList.remove("icon-selected");
    document.getElementById(toolSelected).classList.add("icon-selected");

    this.currentTool = toolSelected;
  },

  save() {
    // this document says you can't use toDataURL after drawImage...
    // https://stackoverflow.com/questions/23221273/why-in-canvasjs-todataurl-doesnt-work-after-drawimage
    // and it's for security reasons... but I don't know why
    // this would cause a security problem...

    console.log("save");
    // drawImage and then toDataURL
    // Uncaught DOMException:
    // Failed to execute 'toDataURL' on 'HTMLCanvasElement':
    // Tainted canvases may not be exported.
    var dataURL = this.canvas.toDataURL();

    this.snapshots.push(dataURL);
    localStorage.setItem("snapshots", JSON.stringify(this.snapshots));
    const div = document.createElement("img");
    div.src = dataURL;
    div.classList.add("mr-2");
    this.savedContainer.insertBefore(div, this.savedContainer.firstChild);
  },

  addEventListeners() {
    // desk/laptops
    this.canvas.addEventListener("mousemove", (e) =>
      this.handleMouseMove(this, e)
    );
    this.canvas.addEventListener("mousedown", (e) =>
      this.handleMouseDown(this, e)
    );
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(this, e));
    this.canvas.addEventListener("mouseout", (e) =>
      this.handleMouseUp(this, e)
    );

    // touch screens
    this.canvas.addEventListener("touchmove", (e) => {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      mousePos = getTouchPos(canvas, e);
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });
    this.canvas.addEventListener("touchend", (e) => {
      var mouseEvent = new MouseEvent("mouseup", {});
      canvas.dispatchEvent(mouseEvent);
    });

    this.pencil.addEventListener("click", (e) => this.selectTool("pencil"));
    this.line.addEventListener("click", (e) => this.selectTool("line"));
    this.spray.addEventListener("click", (e) => this.selectTool("spray"));
    this.eraser.addEventListener("click", (e) => this.selectTool("eraser"));
    this.rect.addEventListener("click", (e) => this.selectTool("rectangle"));
    this.circle.addEventListener("click", (e) => this.selectTool("circle"));
    this.saveEl.addEventListener("click", () => {
      console.log("click registered...");
      this.save();
    });

    this.newface.forEach((newface) => {
      newface.addEventListener("click", () => {
        console.log("hi");
        this.addImage();
      });
    });
    // this.newface.addEventListener("click", this.addImage);
  },

  addImage() {
    console.log("huh");
    const unsplash = new Unsplash({
      accessKey: "o0avfKVPQoV6zetDnqiHvpJFarmw5phI8DOeLPreoF0",
    });

    const plugin = this;
    console.log(this);
    unsplash.photos
      .getRandomPhoto({ query: "face" })
      .then(toJson)
      .then((json) => {
        console.log(json.urls.small);

        var image = new Image();
        image.crossOrigin = "Anonymous";

        console.log(image);

        image.onload = function () {
          plugin.ctx.globalAlpha = 100 / 100;
          plugin.ctx.drawImage(image, 0, 0, 800, 600);
        };
        image.src = json.urls.small;
      });
  },

  init() {
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.ctx = this.canvas.getContext("2d");

    // necessary?
    this.ctx.strokeStyle = "#000000";

    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";

    // necessary?
    this.ctx.lineWidth = 3;

    this.addEventListeners();

    this.snapshots = JSON.parse(localStorage.getItem("snapshots")) || [];

    this.snapshots.forEach((snapshot) => {
      const div = document.createElement("img");
      div.src = snapshot;
      div.classList.add("mr-2");
      this.savedContainer.insertBefore(div, this.savedContainer.firstChild);
    });

    this.addImage();
  },
};

gimmeMoustache.init();

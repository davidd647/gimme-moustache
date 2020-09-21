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
      const mousePos = this.getMousePositionOnCanvas(e);
      this.ctx.lineTo(mousePos.x, mousePos.y);
      this.ctx.stroke();

      // [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
      [this.lastX, this.lastY] = [mousePos.x, mousePos.y];
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

  getMousePositionOnCanvas(e) {
    console.log(e);
    const clientX = e.offsetX || e.touches[0].clientX;
    const clientY = e.offsetY || e.touches[0].clientY;
    const { offsetX, offsetY } = e;
    const canvasX = offsetX; // - offsetLeft;
    const canvasY = offsetY; // - offsetTop;

    return { x: clientX, y: clientY };
  },

  handleMouseDown(plugin, e) {
    this.isDrawing = true;

    // get mouse position on canvas...
    const mousePos = this.getMousePositionOnCanvas(e);
    console.log(mousePos);
    [this.lastX, this.lastY] = [mousePos.x, mousePos.y];
    // console.log(this.lastX, this.lastY);
    // [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

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
      this.ctx.lineTo(mousePos.x, mousePos.y);
      this.ctx.globalAlpha = opacity.value / 100;
      this.ctx.stroke();
      this.startedDrawing = false;
    } else if (this.startedDrawing && this.currentTool === "rectangle") {
      this.drawBox(this.firstXCoord, this.firstYCoord, mousePos.x, mousePos.y);
      this.startedDrawing = false;
    } else if (this.startedDrawing && this.currentTool === "circle") {
      this.drawCircle(
        this.firstXCoord,
        this.firstYCoord,
        mousePos.x,
        mousePos.y
      );
      this.startedDrawing = false;
    }
  },

  selectTool(toolSelected) {
    document.querySelector(".icon-selected").classList.remove("icon-selected");
    document.getElementById(toolSelected).classList.add("icon-selected");

    this.currentTool = toolSelected;
  },

  save() {
    var dataURL = this.canvas.toDataURL();

    this.snapshots.push(dataURL);
    var failed = false;
    try {
      localStorage.setItem("snapshots", JSON.stringify(this.snapshots));
    } catch (err) {
      this.snapshots.pop();
      alert(
        "Save failed. Please make space to save more pics by deleting old pics"
      );
      failed = true;
    }

    if (failed) return;

    this.savedContainer.innerHTML = "";
    this.populateSnapshots();
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
      e.preventDefault();
      this.handleMouseMove(this, e);
    });
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.handleMouseDown(this, e);
    });
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.handleMouseUp(this, e);
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

    this.savedContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete")) {
        console.log("deleting...");
        // identify the image in the array...
        var toDelete = e.target.parentNode.id;
        console.log(toDelete);
        // delete the HTML...
        this.savedContainer.innerHTML = "";
        // delete the image from the array...
        this.snapshots.splice(toDelete, 1);

        // re-populate the HTML
        this.populateSnapshots();
        // update localStorage...
        localStorage.setItem("snapshots", JSON.stringify(this.snapshots));
      } else if (e.target.classList.contains("download")) {
        console.log("downloading...");
        var toDownload = e.target.parentNode.id;

        var downloadLink = document.createElement("a");
        downloadLink.href = this.snapshots[toDownload];
        downloadLink.download = "gimme-moustache.png";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    });
  },

  addImage() {
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

  populateSnapshots() {
    this.snapshots.forEach((snapshot, i) => {
      const div = document.createElement("div");
      div.classList.add("mr-2");
      div.classList.add("gm-thumb");
      div.id = i;

      const img = document.createElement("img");
      img.src = snapshot;

      const del = document.createElement("div");
      del.classList.add("delete");
      del.classList.add("fas");
      del.classList.add("fa-backspace");
      del.classList.add("m-2");

      const download = document.createElement("div");
      download.classList.add("download");
      download.classList.add("fas");
      download.classList.add("fa-download");
      download.classList.add("m-2");

      div.appendChild(img);
      div.appendChild(del);
      div.appendChild(download);

      this.savedContainer.insertBefore(div, this.savedContainer.firstChild);
    });
  },

  init() {
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 3;

    this.addEventListeners();

    this.snapshots = JSON.parse(localStorage.getItem("snapshots")) || [];

    this.populateSnapshots();

    this.addImage();
  },
};

gimmeMoustache.init();

//////////////////////////////////////////
// alert user to use app on desk/laptop

function isMobileDevice() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
}

var isMobile = isMobileDevice();
if (isMobile) {
  document.getElementById("desktop-alert").classList.remove("d-none");
}

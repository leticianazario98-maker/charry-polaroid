let selectedFrame = null;
let selectedElement = null;

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");
}

function goToChoice() {
  showPage("choicePage");
}

function selectFrame(frame, element) {
  selectedFrame = frame;
  selectedElement = element;

  document.querySelectorAll(".frame-option").forEach(item => {
    item.classList.remove("active");
  });

  element.classList.add("active");
}

function goToEditor() {
  if (!selectedFrame) {
    alert("Escolha uma polaroid antes de continuar.");
    return;
  }

  showPage("editorPage");
  drawCanvas();
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const finalCanvas = document.getElementById("finalCanvas");
const finalCtx = finalCanvas.getContext("2d");

let image = null;
let zoomValue = 1;
let imgX = 0;
let imgY = 0;
let dragging = false;
let startX = 0;
let startY = 0;

const imageInput = document.getElementById("imageInput");
const zoomInput = document.getElementById("zoom");

imageInput.addEventListener("change", function (e) {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    image = new Image();

    image.onload = function () {
      imgX = 0;
      imgY = 0;
      zoomValue = 1;
      zoomInput.value = 1;
      drawCanvas();
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

zoomInput.addEventListener("input", function () {
  zoomValue = Number(this.value);
  drawCanvas();
});

function zoomIn() {
  zoomValue = Math.min(3, zoomValue + 0.1);
  zoomInput.value = zoomValue;
  drawCanvas();
}

function zoomOut() {
  zoomValue = Math.max(0.5, zoomValue - 0.1);
  zoomInput.value = zoomValue;
  drawCanvas();
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let bgColor = "#ffffff";
  let textColor = "#8b0016";

  if (selectedFrame && selectedFrame.includes("red")) {
    bgColor = "#8b0016";
    textColor = "#ffffff";
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(100, 50, 500, 700);

  let photos = [];

  if (selectedFrame && selectedFrame.includes("3")) {
    photos = [
      { x: 145, y: 95, w: 410, h: 170 },
      { x: 145, y: 295, w: 410, h: 170 },
      { x: 145, y: 495, w: 410, h: 170 }
    ];
  } else {
    photos = [
      { x: 145, y: 95, w: 410, h: 470 }
    ];
  }

  photos.forEach((box) => {
    ctx.fillStyle = "#f3eeee";
    ctx.fillRect(box.x, box.y, box.w, box.h);

    if (image) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.clip();

      const imgW = box.w * zoomValue;
      const imgH = (image.height / image.width) * imgW;

      ctx.drawImage(
        image,
        box.x + imgX,
        box.y + imgY,
        imgW,
        imgH
      );

      ctx.restore();
    }
  });

  ctx.fillStyle = textColor;
  ctx.font = "italic 34px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("the most loved edit", 350, 705);
}

canvas.addEventListener("mousedown", function (e) {
  dragging = true;
  startX = e.offsetX - imgX;
  startY = e.offsetY - imgY;
});

canvas.addEventListener("mousemove", function (e) {
  if (!dragging) return;

  imgX = e.offsetX - startX;
  imgY = e.offsetY - startY;

  drawCanvas();
});

canvas.addEventListener("mouseup", function () {
  dragging = false;
});

canvas.addEventListener("mouseleave", function () {
  dragging = false;
});

function finishEdit() {
  finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCtx.drawImage(canvas, 0, 0);

  showPage("resultPage");

  document.querySelector(".result").classList.add("active");
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "polaroid-charry.png";
  link.href = finalCanvas.toDataURL("image/png");
  link.click();
}

function printImage() {
  const imageURL = finalCanvas.toDataURL("image/png");

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir Polaroid</title>
      </head>
      <body style="margin:0; display:flex; justify-content:center; align-items:center;">
        <img src="${imageURL}" style="max-width:100%; height:auto;">
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = function () {
    printWindow.print();
  };
}

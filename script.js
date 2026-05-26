const pages = {
  cover: document.getElementById("pageCover"),
  layouts: document.getElementById("pageLayouts"),
  editor: document.getElementById("pageEditor"),
  result: document.getElementById("pageResult")
};

const editorCanvas = document.getElementById("editorCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const ectx = editorCanvas.getContext("2d");
const rctx = resultCanvas.getContext("2d");

const photoInput = document.getElementById("photoInput");
const zoomRange = document.getElementById("zoomRange");

let selectedLayout = "classic-red";
let photo = null;
let photoX = 0;
let photoY = 0;
let zoom = 1;
let dragging = false;
let lastX = 0;
let lastY = 0;

function showPage(name) {
  Object.values(pages).forEach(page => page.classList.remove("active"));
  pages[name].classList.add("active");
  if (name === "editor") drawEditor();
}

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function frameConfig() {
  if (selectedLayout === "classic-red" || selectedLayout === "classic-white") {
    return {
      canvasW: 900,
      canvasH: 1200,
      slots: [{ x: 90, y: 90, w: 720, h: 820 }],
      color: selectedLayout === "classic-red" ? "#b90013" : "#f8f8f8",
      textColor: selectedLayout === "classic-red" ? "#ffffff" : "#b90013",
      type: "classic"
    };
  }

  if (selectedLayout === "strip-red") {
    return {
      canvasW: 700,
      canvasH: 1500,
      slots: [
        { x: 70, y: 70, w: 560, h: 360 },
        { x: 70, y: 500, w: 560, h: 360 },
        { x: 70, y: 930, w: 560, h: 360 }
      ],
      color: "#b90013",
      textColor: "#ffffff",
      type: "strip"
    };
  }

  return {
    canvasW: 700,
    canvasH: 1500,
    slots: [
      { x: 100, y: 80, w: 500, h: 360 },
      { x: 100, y: 560, w: 500, h: 360 },
      { x: 100, y: 1040, w: 500, h: 360 }
    ],
    color: "#191512",
    textColor: "#ffffff",
    type: "film"
  };
}

function fitPhotoToSlot(slot) {
  if (!photo) return;

  const scale = Math.max(slot.w / photo.width, slot.h / photo.height);
  const drawW = photo.width * scale * zoom;
  const drawH = photo.height * scale * zoom;

  photoX = slot.x + (slot.w - drawW) / 2;
  photoY = slot.y + (slot.h - drawH) / 2;
}

function drawPhoto(ctx, slot) {
  if (!photo) {
    ctx.fillStyle = "#d8d3d0";
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    ctx.fillStyle = "#777";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("adicione sua foto", slot.x + slot.w / 2, slot.y + slot.h / 2);
    return;
  }

  const baseScale = Math.max(slot.w / photo.width, slot.h / photo.height);
  const drawW = photo.width * baseScale * zoom;
  const drawH = photo.height * baseScale * zoom;

  ctx.save();
  ctx.beginPath();
  ctx.rect(slot.x, slot.y, slot.w, slot.h);
  ctx.clip();
  ctx.drawImage(photo, photoX, photoY, drawW, drawH);
  ctx.restore();
}

function drawFrame(ctx) {
  const cfg = frameConfig();

  ctx.canvas.width = cfg.canvasW;
  ctx.canvas.height = cfg.canvasH;
  ctx.clearRect(0, 0, cfg.canvasW, cfg.canvasH);

  ctx.fillStyle = cfg.color;
  ctx.fillRect(0, 0, cfg.canvasW, cfg.canvasH);

  if (cfg.type === "film") {
    drawFilmHoles(ctx, cfg.canvasW, cfg.canvasH);
  }

  cfg.slots.forEach(slot => {
    drawPhoto(ctx, slot);
  });

  if (cfg.type === "classic") {
    ctx.fillStyle = cfg.textColor;
    ctx.font = "70px Arial";
    ctx.textAlign = "right";
    ctx.fillText("♥", cfg.canvasW - 70, cfg.canvasH - 70);
  }
}

function drawFilmHoles(ctx, w, h) {
  ctx.fillStyle = "#f5efec";
  for (let y = 35; y < h; y += 55) {
    ctx.fillRect(28, y, 28, 28);
    ctx.fillRect(w - 56, y, 28, 28);
  }
}

function drawEditor() {
  drawFrame(ectx);
}

function drawResult() {
  drawFrame(rctx);
}

document.getElementById("startBtn").addEventListener("click", () => showPage("layouts"));
document.getElementById("backToCover").addEventListener("click", () => showPage("cover"));
document.getElementById("backToLayouts").addEventListener("click", () => showPage("layouts"));
document.getElementById("editAgainBtn").addEventListener("click", () => showPage("editor"));

document.querySelectorAll(".layout-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedLayout = card.dataset.layout;
    const firstSlot = frameConfig().slots[0];
    fitPhotoToSlot(firstSlot);
    showPage("editor");
  });
});

photoInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    photo = new Image();
    photo.onload = () => {
      zoom = 1;
      zoomRange.value = "1";
      fitPhotoToSlot(frameConfig().slots[0]);
      drawEditor();
    };
    photo.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => {
  const oldZoom = zoom;
  zoom = Number(zoomRange.value);

  const slot = frameConfig().slots[0];
  const centerX = slot.x + slot.w / 2;
  const centerY = slot.y + slot.h / 2;

  photoX = centerX - (centerX - photoX) * (zoom / oldZoom);
  photoY = centerY - (centerY - photoY) * (zoom / oldZoom);

  drawEditor();
});

document.getElementById("zoomIn").addEventListener("click", () => {
  zoomRange.value = Math.min(3, Number(zoomRange.value) + 0.1);
  zoomRange.dispatchEvent(new Event("input"));
});

document.getElementById("zoomOut").addEventListener("click", () => {
  zoomRange.value = Math.max(1, Number(zoomRange.value) - 0.1);
  zoomRange.dispatchEvent(new Event("input"));
});

editorCanvas.addEventListener("mousedown", startDrag);
editorCanvas.addEventListener("touchstart", startDrag, { passive: false });

window.addEventListener("mousemove", drag);
window.addEventListener("touchmove", drag, { passive: false });

window.addEventListener("mouseup", endDrag);
window.addEventListener("touchend", endDrag);

function startDrag(event) {
  if (!photo) return;
  event.preventDefault();
  dragging = true;
  const p = getCanvasPoint(event, editorCanvas);
  lastX = p.x;
  lastY = p.y;
}

function drag(event) {
  if (!dragging || !photo) return;
  event.preventDefault();
  const p = getCanvasPoint(event, editorCanvas);
  photoX += p.x - lastX;
  photoY += p.y - lastY;
  lastX = p.x;
  lastY = p.y;
  drawEditor();
}

function endDrag() {
  dragging = false;
}

document.getElementById("finishBtn").addEventListener("click", () => {
  drawResult();
  showPage("result");
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  drawResult();
  const link = document.createElement("a");
  link.download = "minha-polaroid.png";
  link.href = resultCanvas.toDataURL("image/png");
  link.click();
});

document.getElementById("printBtn").addEventListener("click", () => {
  drawResult();
  window.print();
});

drawEditor();

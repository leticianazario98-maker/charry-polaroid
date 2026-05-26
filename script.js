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
const slotButtons = document.getElementById("slotButtons");
const photoInfo = document.getElementById("photoInfo");

let selectedLayout = "classic-red";
let activeSlotIndex = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;
let photos = [];

function showPage(name) {
  Object.values(pages).forEach(page => page.classList.remove("active"));
  pages[name].classList.add("active");

  if (name === "editor") {
    buildSlotButtons();
    drawEditor();
  }
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

function resetPhotosForLayout() {
  const total = frameConfig().slots.length;

  photos = Array.from({ length: total }, () => ({
    image: null,
    x: 0,
    y: 0,
    zoom: 1
  }));

  activeSlotIndex = 0;
  zoomRange.value = "1";
  photoInput.value = "";
}

function getActivePhoto() {
  return photos[activeSlotIndex];
}

function buildSlotButtons() {
  const total = frameConfig().slots.length;
  slotButtons.innerHTML = "";

  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn" + (i === activeSlotIndex ? " active" : "");
    btn.textContent = total === 1 ? "Foto" : `Foto ${i + 1}`;

    btn.addEventListener("click", () => {
      activeSlotIndex = i;
      zoomRange.value = photos[i].zoom;
      photoInput.value = "";
      buildSlotButtons();
      drawEditor();
    });

    slotButtons.appendChild(btn);
  }

  photoInfo.textContent = total === 1
    ? "Escolha a foto da sua polaroid."
    : `Escolha e ajuste a foto ${activeSlotIndex + 1} de ${total}.`;
}

function fitPhotoToSlot(slotIndex) {
  const item = photos[slotIndex];
  const slot = frameConfig().slots[slotIndex];

  if (!item || !item.image) return;

  const scale = Math.max(slot.w / item.image.width, slot.h / item.image.height);
  const drawW = item.image.width * scale * item.zoom;
  const drawH = item.image.height * scale * item.zoom;

  item.x = slot.x + (slot.w - drawW) / 2;
  item.y = slot.y + (slot.h - drawH) / 2;
}

function drawPhoto(ctx, slot, item, index) {
  if (!item || !item.image) {
    ctx.fillStyle = "#d8d3d0";
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    ctx.fillStyle = "#777";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`foto ${index + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
    return;
  }

  const scale = Math.max(slot.w / item.image.width, slot.h / item.image.height);
  const drawW = item.image.width * scale * item.zoom;
  const drawH = item.image.height * scale * item.zoom;

  ctx.save();
  ctx.beginPath();
  ctx.rect(slot.x, slot.y, slot.w, slot.h);
  ctx.clip();
  ctx.drawImage(item.image, item.x, item.y, drawW, drawH);
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

  cfg.slots.forEach((slot, index) => {
    drawPhoto(ctx, slot, photos[index], index);
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

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getSlotByPoint(point) {
  const slots = frameConfig().slots;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    if (
      point.x >= slot.x &&
      point.x <= slot.x + slot.w &&
      point.y >= slot.y &&
      point.y <= slot.y + slot.h
    ) {
      return i;
    }
  }

  return -1;
}

document.querySelectorAll(".layout-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedLayout = card.dataset.layout;
    resetPhotosForLayout();
    showPage("editor");
  });
});

photoInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      photos[activeSlotIndex] = {
        image: img,
        x: 0,
        y: 0,
        zoom: 1
      };

      zoomRange.value = "1";
      fitPhotoToSlot(activeSlotIndex);
      drawEditor();
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => {
  const item = getActivePhoto();
  if (!item || !item.image) return;

  const oldZoom = item.zoom;
  item.zoom = Number(zoomRange.value);

  const slot = frameConfig().slots[activeSlotIndex];
  const centerX = slot.x + slot.w / 2;
  const centerY = slot.y + slot.h / 2;

  item.x = centerX - (centerX - item.x) * (item.zoom / oldZoom);
  item.y = centerY - (centerY - item.y) * (item.zoom / oldZoom);

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
window.addEventListener("mousemove", drag);
window.addEventListener("mouseup", endDrag);

function startDrag(event) {
  const point = getCanvasPoint(event, editorCanvas);
  const clickedSlot = getSlotByPoint(point);

  if (clickedSlot !== -1) {
    activeSlotIndex = clickedSlot;
    zoomRange.value = photos[activeSlotIndex].zoom;
    buildSlotButtons();
  }

  const item = getActivePhoto();
  if (!item || !item.image) return;

  dragging = true;
  lastX = point.x;
  lastY = point.y;
}

function drag(event) {
  if (!dragging) return;

  const item = getActivePhoto();
  if (!item || !item.image) return;

  const point = getCanvasPoint(event, editorCanvas);

  item.x += point.x - lastX;
  item.y += point.y - lastY;

  lastX = point.x;
  lastY = point.y;

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

document.getElementById("startBtn").addEventListener("click", () => showPage("layouts"));
document.getElementById("backToCover").addEventListener("click", () => showPage("cover"));
document.getElementById("backToLayouts").addEventListener("click", () => showPage("layouts"));
document.getElementById("editAgainBtn").addEventListener("click", () => showPage("editor"));

resetPhotosForLayout();
drawEditor();

function goToChoice(){
  document.getElementById("coverPage").classList.remove("active");
  document.getElementById("choicePage").classList.add("active");
}
function downloadImage(){

  // cria fundo branco
  const jpgCanvas = document.createElement("canvas");
  jpgCanvas.width = resultCanvas.width;
  jpgCanvas.height = resultCanvas.height;

  const jpgCtx = jpgCanvas.getContext("2d");

  // fundo branco
  jpgCtx.fillStyle = "#ffffff";
  jpgCtx.fillRect(
    0,
    0,
    jpgCanvas.width,
    jpgCanvas.height
  );

  // desenha a polaroid
  jpgCtx.drawImage(resultCanvas,0,0);

  // cria download
  const link = document.createElement("a");

  link.download = "polaroid-charry.jpg";

  link.href = jpgCanvas.toDataURL(
    "image/jpeg",
    1.0
  );

  link.click();
}

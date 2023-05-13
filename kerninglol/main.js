const canvas = document.getElementById("canvas");
const font = document.getElementById("font");
const fontsize = document.getElementById("fontsize");
const radius = document.getElementById("radius");
const offset = document.getElementById("offset");
const render = document.getElementById("render");
const result = document.getElementById("result");

canvas.width = 200;
canvas.height = 100;
canvas.style = "border: 1px solid black;";

const ctx = canvas.getContext("2d");

render.onclick = function(){
  const f = font.value;
  const rad = Number(radius.value);
  const fs = Number(fontsize.value);
  const o = Number(offset.value);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `${fs}px ${f}`;
  ctx.fillStyle = "red";
  ctx.fillText("P", 50, 50 + fs / 2);

  ctx.fillStyle = "green";
  ctx.fillText("/", 50+o, 50 + fs / 2);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  ctx.globalCompositeOperation = "lighten";
  for(let x = 0; x < canvas.width; ++x){
    for(let y = 0; y < canvas.height; ++y){
      const i = (y * canvas.width * 4) + (x * 4);
      const [r, g] = [d[i], d[i + 1]];

      if(r + g > 0){
        ctx.fillStyle = `rgba(${r > 0 ? 100 : 0},${g > 0 ? 100 : 0},0,1)`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 2 * Math.PI);
        ctx.fill(); 
      }
    }
  }
  
  const res = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for(let i = 0; i < res.length; i += 4){
    if(res[i] > 0 && res[i + 1] > 0){
      result.innerText = "touching";
      return;
    }
  }
  result.innerText = "not touching";
}
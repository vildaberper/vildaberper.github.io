const canvas = document.getElementById("game")
const context = canvas.getContext("2d")

const PI = Math.PI

const white = "#ffffff"
const black = "#000000"

const width = 600
const height = 400
const ash = height / width
const asw = width / height

const paddle_height = 60
const paddle_width = 10
const paddle_offset = 20
const paddle_speed = 200

const ball_size = 10
const ball_speed = 300

const reset_delay = 1

canvas.width = width
canvas.height = height

let up = false
let down = false

let pscore = 0
let oscore = 0

let px = paddle_offset
let py = (height - paddle_height) / 2

let ox = width - paddle_offset - paddle_width
let oy = py

let bx = (width - ball_size) / 2
let by = (height - ball_size) / 2
let bvx = 0
let bvy = 0

let resetTimer = 0
let previousTime = 0
let frame = 0

addEventListener("resize", resize)

function resize(){
  let w = window.innerHeight * asw, h = window.innerHeight
  if(window.innerWidth < window.innerHeight * asw){
    w = window.innerWidth
    h = window.innerWidth * ash
  }
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

resize()

function gameLoop(time){
  tick((time - previousTime) / 1000)

  const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  scanline(imageData, 0.1, 4, time / 15)
  chromaticAberration(imageData, 1, frame / 5);
  context.putImageData(imageData, 0, 0);

  previousTime = time
  ++frame
  requestAnimationFrame(gameLoop)
}

function chromaticAberration(imageData, intensity, phase){
  for(let i = Math.floor(phase) % 4; i < imageData.data.length; i += 4){
    imageData.data[i] = 0.8 * imageData.data[i] + 0.2 * imageData.data[i + 4 * intensity]
  }
}

const scanv = [...Array(180)].map(function(_, i){
  return Math.sin(i / 360 * 2 * PI)
})
function scanline(imageData, interval, intensity, phase){
  for(let i = 0; i < imageData.data.length; ++i){
    imageData.data[i] += scanv[Math.floor((i / imageData.width + phase) / interval) % scanv.length] * intensity
  }
}

requestAnimationFrame(gameLoop)

reset()

function tick(dt){
  if(up) py -= paddle_speed * dt
  if(down) py += paddle_speed * dt

  if(bvx > 0){
    if(by < oy) oy -= paddle_speed * dt
    else if(by > oy + paddle_height - ball_size) oy += paddle_speed * dt
  }

  if(py < 0) py = 0
  else if(py > height - paddle_height) py = height - paddle_height

  if(oy < 0) oy = 0
  else if(oy > height - paddle_height) oy = height - paddle_height

  if(resetTimer > reset_delay){
    bx += bvx * dt
    by += bvy * dt
  }else{
    resetTimer += dt
  }

  if(by < 0){
    by = 0
    bvy = Math.abs(bvy)
  }else if(by > height - ball_size){
    by = height - ball_size
    bvy = Math.abs(bvy) * -1
  }

  if((bx < px + paddle_width && bx > px - ball_size) && (by > py - ball_size && by < py + paddle_height)){
    bvx = Math.abs(bvx)
    let a = Math.atan2(bvy, bvx)
    let v = clamp(((py + paddle_height / 2) - (by + ball_size / 2)) / ((paddle_height + ball_size) / 2), 1, -1) * 0.5
    if(up) v += 0.5
    if(down) v -= 0.5
    a -= v * PI / 4
    a = clamp(a, PI / 4, -PI / 4)
    bvx = Math.cos(a) * ball_speed
    bvy = Math.sin(a) * ball_speed
  }

  if((bx > ox - ball_size && bx < ox + paddle_width) && (by > oy - ball_size && by < oy + paddle_height)){
    bvx = Math.abs(bvx) * -1
  }

  if(bx < 0 - ball_size){
    ++oscore
    reset(1)
  }else if(bx > width){
    ++pscore
    reset(0)
  }

  context.fillStyle = black + "aa"
  context.fillRect(0, 0, width, height)

  ball(bx, by)

  paddle(px, py)
  paddle(ox, oy)

  score()
}

function reset(d){
  bx = (width - ball_size) / 2
  by = (height - ball_size) / 2

  let a = Math.random() * PI / 2 - PI / 4
  if((d ?? Math.random()) < 0.5) a += PI

  bvx = Math.cos(a) * ball_speed
  bvy = Math.sin(a) * ball_speed

  resetTimer = 0
}

function ball(x, y){
  box(x, y, ball_size, ball_size)
}

function paddle(x, y){
  box(x, y, paddle_width, paddle_height)
}

function box(x, y, w, h){
  context.fillStyle = white
  context.fillRect(x, y, w, h)
}

function score(){
  context.fillStyle = white
  context.font = "20px pongfont"
  context.textBaseline = "top"
  context.textAlign = "center"
  context.fillText("-", width / 2, 18)
  context.textAlign = "end"
  context.fillText(`${pscore}`, width / 2 - 12, 20)
  context.textAlign = "start"
  context.fillText(`${oscore}`, width / 2 + 12, 20)
}

function onKeyUp(e){
  if(e.key === "ArrowUp") up = false
  if(e.key === "ArrowDown") down = false
}

function onKeyDown(e){
  if(e.key === "ArrowUp") up = true
  if(e.key === "ArrowDown") down = true
}

function clamp(n, max, min){
  return Math.max(Math.min(n, max ?? 1), min ?? 0)
}

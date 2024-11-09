// 生成[min, max]范围内的数
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// 生成随机颜色值的函数
function randomColor() {
  const color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' +
      random(0, 255) + ')';
  return color;
}

// 更新HTML中的球的数量显示
function updateBallCount() {
  const p = document.querySelector('p');
  p.textContent = `当前还有${ballCurCount}个球`;  // 更新显示的球的数量
  if (ballCurCount === 0) {
    if (confirm('恶魔球已经吃掉了全部的球！点击确定退出游戏。')) {
      cancelAnimationFrame(loop);
      window.close();
    }
  }
}

function loop() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    evil.draw();
    evil.checkBounds();
    evil.collisionDetect();
    if (balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect();
    }
  }

  requestAnimationFrame(loop);
}

class Shape {
  constructor(x, y, velX, velY, exists) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.exists = exists;
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, exists, color, size) {
    super(x, y, velX, velY, exists);  // 调用父类 Shape 的构造函数
    this.color = color;
    this.size = size;
  }

  // 画小球
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
  // 小球移动
  update() {
    if (this.x + this.size >= width || this.x - this.size <= 0) {
      this.velX = -this.velX;
    }

    if (this.y + this.size >= height || this.y - this.size <= 0) {
      this.velY = -this.velY;
    }

    this.x += this.velX;
    this.y += this.velY;
  }
  // 小球碰撞
  collisionDetect() {
    for (let j = 0; j < balls.length; j++) {
      if (this != balls[j] && balls[j].exists && this.exists) {
        const dx = this.x - balls[j].x;
        const dy = this.y - balls[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + balls[j].size) {
          balls[j].color = this.color = randomColor();
        }
      }
    }
  }
}

class evilCircle extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);  // 调用父类 Shape 的构造函数
    this.color = color;
    this.size = 25;
    this.shadowBlur = 0;               // 默认无发光
    this.shadowColor = randomColor();  // 默认发光颜色
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowColor = this.shadowColor;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  checkBounds() {
    let flag = false;

    // 检查水平边界
    if (this.x + this.size >= width || this.x - this.size <= 0) {
      // 使小球弹回来（直接将其放回屏幕内）
      if (this.x + this.size >= width) {
        this.x = width - this.size;  // 防止越界，放到右边界
      } else if (this.x - this.size <= 0) {
        this.x = this.size;  // 防止越界，放到左边界
      }
      flag = true;
    }

    // 检查垂直边界
    if (this.y + this.size >= height || this.y - this.size <= 0) {
      // 使小球弹回来（直接将其放回屏幕内）
      if (this.y + this.size >= height) {
        this.y = height - this.size;  // 防止越界，放到下边界
      } else if (this.y - this.size <= 0) {
        this.y = this.size;  // 防止越界，放到上边界
      }
      flag = true;
    }

    // 如果越界了，evilCircle 发光
    if (flag) {
      this.shadowBlur = 20;
      this.shadowColor = randomColor();
    } else {
      this.shadowBlur = 0;  // 关闭发光
    }
  }


  setControls() {
    // 初始化按键状态对象
    const keyState = {a: false, d: false, w: false, s: false};

    // 监听键盘按下事件
    window.onkeydown = (e) => {
      if (e.key === 'a') keyState.a = true;
      if (e.key === 'd') keyState.d = true;
      if (e.key === 'w') keyState.w = true;
      if (e.key === 's') keyState.s = true;
    };

    // 监听键盘松开事件
    window.onkeyup = (e) => {
      if (e.key === 'a') keyState.a = false;
      if (e.key === 'd') keyState.d = false;
      if (e.key === 'w') keyState.w = false;
      if (e.key === 's') keyState.s = false;
    };

    // 处理多个键的同时按下
    setInterval(() => {
      if (keyState.a) this.x -= this.velX;
      if (keyState.d) this.x += this.velX;
      if (keyState.w) this.y -= this.velY;
      if (keyState.s) this.y += this.velY;
    }, 16);  // 每秒60帧，约每16毫秒更新一次
  }

  collisionDetect() {
    for (let j = 0; j < balls.length; j++) {
      if (balls[j].exists) {
        const dx = this.x - balls[j].x;
        const dy = this.y - balls[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + balls[j].size) {
          balls[j].exists = false;
          ballCurCount--;
          updateBallCount();
        }
      }
    }
  }
}

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let balls = [];
let ballCount = 50, evilSize = 25;
let ballCurCount = ballCount;

evil = new evilCircle(
    random(0 + evilSize, width - evilSize),
    random(0 + evilSize, height - evilSize),
    15,
    15,
    'white',
    evilSize,
)

evil.setControls();

while (balls.length < ballCount) {
  let size = random(10, 20);
  let ball = new Ball(
      random(0 + size, width - size),
      random(0 + size, height - size),
      random(-7, 7),
      random(-7, 7),
      true,  // 存在
      randomColor(),
      size,
  );
  balls.push(ball);
}


loop();
updateBallCount();
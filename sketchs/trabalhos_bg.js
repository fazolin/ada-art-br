/*
Referenced
https://www.youtube.com/watch?v=TOEi6T2mtHo
https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
*/

let walls = [];
let ray;
let particle;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  for (let i = 0; i < 5; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = random(width);
    let y2 = random(height);
    walls.push(new Wall(x1, y1, x2, y2, true));
  }
  particle = new Particle();

  walls.push(new Wall(0, 0, width, 0, false));
  walls.push(new Wall(width, 0, width, height, false));
  walls.push(new Wall(width, height, 0, height, false));
  walls.push(new Wall(0, height, 0, 0, false));
}

function draw() {
  background(0);

  walls.forEach((wall) => {
    wall.draw();
  });
  particle.look(walls);
  //particle.updatePos(mouseX, mouseY)
  particle.draw();
}

class Particle {
  constructor() {
    this.pos = createVector(0, 0);
    this.rays = [];
    for (let i = 0; i < 90; i += 0.5) {
      this.rays.push(new Ray(this.pos, radians(i)));
    }
  }

  updatePos(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = this.pos.dist(pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        strokeWeight(10);
        stroke(255, 50);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  draw() {
    fill(255);
    //circle(this.pos.x ,this.pos.y, 16)

    for (let ray of this.rays) {
      ray.draw();
    }
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  draw() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) return;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    return t > 0 && t < 1 && u > 0
      ? createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1))
      : false;
  }
}

class Wall {
  constructor(x1, y1, x2, y2, movable) {
    stroke(255);
    this.movable = movable;
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.va = createVector(random(-1, 1), random(-1, 1));
    this.vb = createVector(random(-1, 1), random(-1, 1));
  }

  draw() {
    if (this.a.x > width || this.a.x < 0) {
      this.va.x *= -1;
    }
    if (this.b.x > width || this.b.x < 0) {
      this.vb.x *= -1;
    }
    if (this.a.y > height || this.a.y < 0) {
      this.va.y *= -1;
    }
    if (this.b.y > height || this.b.y < 0) {
      this.vb.y *= -1;
    }
    if (this.movable) {
      this.a.add(this.va);
      this.b.add(this.vb);
      line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
  }
}

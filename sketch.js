// By Roni Kaufman
// Inspired by Sol LeWitt's "Squiggly Brushstrokes"

let particles = [];
let n = 250;
let colors;
let squiggliness;
let noiseFactor;
let alpha = 25;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  //colorMode(HSB, 100);
  noStroke();

  //colors = [color(0, 255, 187, alpha), color(179, 222, 147, alpha), color(1, 80, 97, alpha), color(53, 227, 241, alpha), color(115, 78, 164, alpha)];

  background(0);
  updateParticles();
  blendMode(ADD);

  squiggliness = 1 / random(100, 1000);
  noiseFactor = random(10, 50);

  setInterval(updateParticles, 2500);
}

function draw() {
  for (let p of particles) {
    p.draw();
    p.move();
  }
}

function updateParticles() {
  particles = [];
  let s_ = 1;
  for (let i = 0; i < n; i++) {
    let x_ = random(-50, width + 50);
    let y_ = random(-50, height + 50);
    let c_ = color(255, 255, 0, alpha);
    let noiseID_ = 1;
    particles.push(new Particle(x_, y_, s_, c_, noiseID_));
  }
  for (let i = 0; i < n; i++) {
    let x_ = random(-50, width + 50);
    let y_ = random(-50, height + 50);
    let c_ = color(255, 0, 255, alpha);
    let noiseID_ = 2;
    particles.push(new Particle(x_, y_, s_, c_, noiseID_));
  }
  for (let i = 0; i < n; i++) {
    let x_ = random(-50, width + 50);
    let y_ = random(-50, height + 50);
    let c_ = color(0, 255, 255, alpha);
    let noiseID_ = 3;
    particles.push(new Particle(x_, y_, s_, c_, noiseID_));
  }
}

function Particle(x_, y_, s_, c_, noiseID_) {
  this.x = x_;
  this.y = y_;
  this.size = s_;
  this.c = c_;
  this.noiseID = noiseID_;

  this.dist = 0.5;

  this.move = function () {
    let theta =
      noise(this.x * squiggliness, this.y * squiggliness, this.noiseID) *
      PI *
      noiseFactor;
    let v = p5.Vector.fromAngle(theta, this.dist);
    this.x += v.x;
    this.y += v.y;
    //this.dist *= 0.9999;
    //this.alpha *= 0.99;
  };

  this.draw = function () {
    fill(this.c);
    circle(this.x, this.y, this.size);
  };
}

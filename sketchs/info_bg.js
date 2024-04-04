function setup() {
  pixelDensity(5);
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  background(0);
}

function draw() {
  let lastX, lastY;

  translate(width / 2, height / 2);
  rotate(sin(frameCount / 20) / 50);
  rotate(frameCount / 500);
  scale(pow(1 / frameCount, 0.108) - frameCount / 10000);
  translate(-width / 2, -height / 2);
  translate(width / 2, 0);

  for (let y = 0; y < height; y += 4) {
    let ang = frameCount / 100;
    //noise(ang+y/2,1000)*5
    let r =
      noise(y / 100, ang / 10) *
      noise(y / 20, 1000) *
      noise(50, y / 1000) *
      width *
      2;
    let x = r * cos(ang);
    let panX = (random(-1, 1) * 1 * cos(ang)) / 2;
    let panY = (random(-1, 1) * 1 * sin(ang)) / 2;
    // if (frameCount>100){
    let panR = noise(ang, r) * 5;
    panX += noise(frameCount / 50, x / 50 + ang * 10, y / 20) * panR;
    panY += noise(x / 80 + ang * 10, y / 200, frameCount / 50) * panR;
    // }
    if (lastX) {
      point(x + panX, y + panY);
      // line(x,y,lastX,lastY)
      push();
      strokeWeight(0.1);
      for (let i = 0; i < 2; i++) {
        point(x + random(-5, 5), y + random(-5, 5));
      }
      pop();
    }
    stroke(255, 200);
    strokeWeight(random(0.5, 2));
    if (y % 60 == 0) {
      strokeWeight(random(1.5, 2) + 2);
    }

    // if (noise(x/10,y/10)>0.8){
    // 	y+=10
    // }
    lastX = x;
    lastY = y;
  }
}

function keyPressed() {
  if (key == " ") {
    save("240110 Shape of Mind Rev", "jpg");
  }
}

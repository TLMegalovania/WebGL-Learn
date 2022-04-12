import { initGL, bindVertex } from "./initGL";

const vertex = [0, 1, 0, 0, 0.5, 1, -1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0.5, 1];
let radian = 0;

const [gl, program] = initGL();
const raLoc = gl.getUniformLocation(program, "radian");
const buffer = bindVertex(gl, program, vertex, "pos", 3);

const interval = setInterval(drawArray, 20);

window.onload = drawArray;

window.onunload = () => {
  gl.deleteBuffer(buffer);
  clearInterval(interval);
};

function drawArray() {
  gl.uniform1f(raLoc, radian);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertex.length);
  radian += 0.1;
  return 0;
}

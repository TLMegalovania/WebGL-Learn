import { initGL, bindVertex } from "./initGL.js";
const vertex = [0, 0, 0, 0, 0, 0, 0, 0];
const [gl, program, canvas] = initGL();
const width = canvas.width,
  height = canvas.height;
const buffer = bindVertex(gl, program, vertex, "pos", 2, gl.DYNAMIC_DRAW);
let mousedown = false;
window.onload = () => gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
canvas.onmouseenter =
  canvas.onmouseout =
  canvas.onmouseup =
    () => (mousedown = false);
canvas.onmousedown = (e) => {
  vertex[0] = vertex[2] = e.offsetX / width;
  vertex[1] = vertex[5] = e.offsetY / height;
  mousedown = true;
};
canvas.onmousemove = (e) => {
  if (!mousedown) return;
  vertex[6] = vertex[4] = e.offsetX / width;
  vertex[7] = vertex[3] = e.offsetY / height;
  drawArray();
};
window.onunload = () => {
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
};
function drawArray() {
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertex));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertex.length / 2);
}

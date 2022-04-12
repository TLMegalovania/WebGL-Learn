import { mat4, vec3 } from "gl-matrix";

const light = [0, 0, 10],
  camera = [0, 0, 3];

let gl: WebGL2RenderingContext | undefined | null,
  shaderProgram: WebGLProgram | undefined | null;

async function initWebGL() {
  let canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("WebGL not supported");
    return;
  }
  const vsSource = await fetch("webgl.vert").then((r) => r.text()),
    fsSource = await fetch("webgl.frag").then((r) => r.text());
  shaderProgram = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER),
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!shaderProgram || !vertexShader || !fragmentShader) {
    throw "Create shader program failed.";
  }
  gl.shaderSource(vertexShader, vsSource);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw (
      "Unable to initialize the shader program: " +
      gl.getShaderInfoLog(vertexShader)
    );
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw (
      "Unable to initialize the shader program: " +
      gl.getShaderInfoLog(fragmentShader)
    );
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw (
      "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
    );
  }
  gl.detachShader(shaderProgram, vertexShader);
  gl.detachShader(shaderProgram, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.useProgram(shaderProgram);
}

class OBJModel {
  vertices: number[];
  indices: number[];
  normals: number[];
  constructor(vertices: number[], indices: number[], normals: number[]) {
    this.vertices = vertices;
    this.indices = indices;
    this.normals = normals;
  }
  static async fromFile(file: string) {
    const r = await fetch(file);
    const text = await r.text();
    const lines = text.split("\n");
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    let currentVertex: number[] = [];
    let currentNormal: number[] = [];
    let currentIndex: number[] = [];
    let currentLine: string;
    let currentLineType: string;
    let currentLineData: string;
    let currentLineDataArray: string[];
    for (let i = 0; i < lines.length; i++) {
      currentLine = lines[i];
      const firstSpace = currentLine.indexOf(" ");
      if (firstSpace === -1) break;
      currentLineType = currentLine.substring(0, firstSpace);
      currentLineData = currentLine.substring(firstSpace + 1);
      currentLineDataArray = currentLineData.split(" ");
      switch (currentLineType) {
        case "v":
          currentVertex = currentLineDataArray.map(parseFloat);
          vertices.push(...currentVertex);
          break;
        case "vn":
          currentNormal = currentLineDataArray.map(parseFloat);
          normals.push(...currentNormal);
          break;
        case "f":
          currentIndex = currentLineDataArray.map(
            (s) => parseInt(s.split("//")[0]) - 1
          );
          indices.push(...currentIndex);
          break;
      }
    }
    return new OBJModel(vertices, indices, normals);
  }
}

function bindBuffers(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  model: OBJModel
) {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw "Unable to create positionBuffer";
  }
  const normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    throw "Unable to create normalBuffer";
  }
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    throw "Unable to create indexBuffer";
  }
  const vao = gl.createVertexArray();
  if (!vao) {
    throw "Unable to create vao";
  }
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(model.vertices),
    gl.STATIC_DRAW
  );
  const positionAttributeLocation = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(model.normals),
    gl.STATIC_DRAW
  );
  const normalAttributeLocation = gl.getAttribLocation(program, "normal");
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(model.indices),
    gl.STATIC_DRAW
  );
  gl.bindVertexArray(null);
  return {
    position: positionBuffer,
    normal: normalBuffer,
    index: indexBuffer,
    vao: vao,
  };
}

type UniformInfo = {
  transform: WebGLUniformLocation | null;
  rotation: WebGLUniformLocation | null;
  light_position: WebGLUniformLocation | null;
  light_ambient: WebGLUniformLocation | null;
  light_diffuse: WebGLUniformLocation | null;
  light_specular: WebGLUniformLocation | null;
  ambient_factor: WebGLUniformLocation | null;
  diffuse_factor: WebGLUniformLocation | null;
  specular_factor: WebGLUniformLocation | null;
  shininess: WebGLUniformLocation | null;
  camera_position: WebGLUniformLocation | null;
};

let uniforms: UniformInfo | undefined;

function setUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  uniforms = {
    transform: gl.getUniformLocation(program, "transform"),
    rotation: gl.getUniformLocation(program, "rotation"),
    light_position: gl.getUniformLocation(program, "light_position"),
    light_ambient: gl.getUniformLocation(program, "light_ambient"),
    light_diffuse: gl.getUniformLocation(program, "light_diffuse"),
    light_specular: gl.getUniformLocation(program, "light_specular"),
    ambient_factor: gl.getUniformLocation(program, "ambient_factor"),
    diffuse_factor: gl.getUniformLocation(program, "diffuse_factor"),
    specular_factor: gl.getUniformLocation(program, "specular_factor"),
    shininess: gl.getUniformLocation(program, "shininess"),
    camera_position: gl.getUniformLocation(program, "camera_position"),
  };
}

let count: number | undefined;

function drawScene(gl: WebGL2RenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (count) gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}

const transform = mat4.create(),
  rotation = mat4.create();

function translate(x: number, y: number, z: number) {
  if (!(gl && uniforms)) return;
  mat4.translate(transform, transform, [x, y, z]);
  gl.uniformMatrix4fv(uniforms.transform, false, transform);
  drawScene(gl);
}

function rotate(angle: number, x: number, y: number, z: number) {
  if (!(gl && uniforms)) return;
  mat4.rotate(transform, transform, angle, [x, y, z]);
  gl.uniformMatrix4fv(uniforms.transform, false, transform);
  mat4.rotate(rotation, rotation, angle, [x, y, z]);
  gl.uniformMatrix4fv(uniforms.rotation, false, rotation);
  drawScene(gl);
}

function scale(x: number, y: number, z: number) {
  if (!(gl && uniforms)) return;
  mat4.scale(transform, transform, [x, y, z]);
  gl.uniformMatrix4fv(uniforms.transform, false, transform);
  drawScene(gl);
}

function worldToCamera(
  cameraPosition: vec3,
  cameraDirection: vec3,
  cameraUp: vec3
) {
  const view = mat4.create();
  mat4.lookAt(view, cameraPosition, cameraDirection, cameraUp);
  mat4.mul(transform, view, transform);
}

function perspective(fov: number, aspect: number, near: number, far: number) {
  const projection = mat4.create();
  mat4.perspective(projection, fov, aspect, near, far);
  mat4.mul(transform, projection, transform);
}

function initUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  if (!uniforms) return;
  gl.uniformMatrix4fv(uniforms.transform, false, transform);
  gl.uniformMatrix4fv(uniforms.rotation, false, rotation);
  gl.uniform3fv(uniforms.light_position, light);
  gl.uniform3fv(uniforms.light_ambient, [0.1, 0.2, 0.3]);
  gl.uniform3fv(uniforms.light_diffuse, [0.4, 0.5, 0.6]);
  gl.uniform3fv(uniforms.light_specular, [0.7, 0.8, 0.9]);
  gl.uniform1f(uniforms.ambient_factor, 0.2);
  gl.uniform1f(uniforms.diffuse_factor, 1);
  gl.uniform1f(uniforms.specular_factor, 1.2);
  gl.uniform1f(uniforms.shininess, 32);
  gl.uniform3fv(uniforms.camera_position, camera);
}

document
  .getElementById("-X")
  ?.addEventListener("click", () => translate(-0.1, 0, 0));

document
  .getElementById("+X")
  ?.addEventListener("click", () => translate(0.1, 0, 0));

document
  .getElementById("-Y")
  ?.addEventListener("click", () => translate(0, -0.1, 0));

document
  .getElementById("+Y")
  ?.addEventListener("click", () => translate(0, 0.1, 0));

document
  .getElementById("-Z")
  ?.addEventListener("click", () => translate(0, 0, -0.1));

document
  .getElementById("+Z")
  ?.addEventListener("click", () => translate(0, 0, 0.1));

document
  .getElementById("+Yaw")
  ?.addEventListener("click", () => rotate(0.1, 0, 1, 0));

document
  .getElementById("-Yaw")
  ?.addEventListener("click", () => rotate(-0.1, 0, 1, 0));

document
  .getElementById("+Pitch")
  ?.addEventListener("click", () => rotate(0.1, 1, 0, 0));

document
  .getElementById("-Pitch")
  ?.addEventListener("click", () => rotate(-0.1, 1, 0, 0));

document
  .getElementById("+Roll")
  ?.addEventListener("click", () => rotate(0.1, 0, 0, 1));

document
  .getElementById("-Roll")
  ?.addEventListener("click", () => rotate(-0.1, 0, 0, 1));

document
  .getElementById("+XScale")
  ?.addEventListener("click", () => scale(1.1, 1, 1));

document
  .getElementById("-XScale")
  ?.addEventListener("click", () => scale(0.9, 1, 1));

document
  .getElementById("+YScale")
  ?.addEventListener("click", () => scale(1, 1.1, 1));

document
  .getElementById("-YScale")
  ?.addEventListener("click", () => scale(1, 0.9, 1));

document
  .getElementById("+ZScale")
  ?.addEventListener("click", () => scale(1, 1, 1.1));

document
  .getElementById("-ZScale")
  ?.addEventListener("click", () => scale(1, 1, 0.9));

initWebGL().then(async () => {
  if (!(gl && shaderProgram)) throw new Error("WebGL not initialized");
  const obj = await OBJModel.fromFile("kitten.obj");
  count = obj.indices.length;
  console.log(obj);
  const { vao } = bindBuffers(gl, shaderProgram, obj);
  setUniforms(gl, shaderProgram);
  if (!uniforms) throw new Error("Uniforms not initialized");
  initUniforms(gl, shaderProgram);
  gl.clearColor(0.11, 0.45, 0.14, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  worldToCamera(new Float32Array(camera), [0, 0, 0], [0, 1, 0]);
  perspective(45, gl.canvas.width / gl.canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(uniforms.transform, false, transform);
  gl.bindVertexArray(vao);
  drawScene(gl);
});

const HALFY = 0.4,
  DIVS = 4;
const X = Math.sqrt(3) * HALFY;
const vertex = [
  [0, 2 * HALFY],
  [-X, -HALFY],
  [X, -HALFY],
];

window.onload = initGL;

function initGL() {
  const rotver: number[] = [];
  rotver.push(...divideTriangle(vertex, DIVS));
  console.log(rotver);

  const gl = (
      document.getElementById("glcanvas") as HTMLCanvasElement
    )?.getContext("webgl2"),
    vsSource = document.getElementById("vertex-shader")?.textContent,
    fsSource = document.getElementById("fragment-shader")?.textContent;
  if (!gl) {
    alert("Browser does not support webgl.");
    return;
  }
  if (!(vsSource && fsSource)) {
    throw "No shader found.";
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  gl.useProgram(shaderProgram);
  const programInfo = {
    pos: gl.getAttribLocation(shaderProgram, "pos"),
    // color: gl.getUniformLocation(shaderProgram, "color")
  };
  initBuffers(gl, rotver);
  gl.vertexAttribPointer(programInfo.pos, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(programInfo.pos);

  // gl.uniform3fv(programInfo.color, color);
  gl.drawArrays(gl.TRIANGLES, 0, rotver.length);
}

function divideTriangle(points: number[][], depth: number) {
  if (depth <= 0)
    return points.reduce<number[]>((res, item) => {
      res.push(...item);
      return res;
    }, []);
  const mids = new Array<number[]>(3);
  //mids.forEach((_, index) => (mids[index] = new Array(3).fill(0)));
  for (let i = 0; i < 3; i++) {
    mids[i] = [0, 0];
  }
  for (let i = 0; i < 2; i++) {
    mids[0][i] = (points[0][i] + points[1][i]) / 2;
    mids[1][i] = (points[1][i] + points[2][i]) / 2;
    mids[2][i] = (points[0][i] + points[2][i]) / 2;
  }
  const res: number[] = [];
  res.push(...divideTriangle([points[1], mids[0], mids[1]], depth - 1));
  res.push(...divideTriangle([points[0], mids[0], mids[2]], depth - 1));
  res.push(...divideTriangle([points[2], mids[1], mids[2]], depth - 1));
  res.push(...divideTriangle([mids[1], mids[0], mids[2]], depth - 1));
  return res;
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    throw "Create shader program failed.";
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw "Create shader failed.";
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
  }

  return shader;
}

function initBuffers(gl: WebGLRenderingContext, ver: number[]) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ver), gl.STATIC_DRAW);

  return positionBuffer;
}

function initGL(): [WebGL2RenderingContext, WebGLProgram, HTMLCanvasElement] {
  const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2"),
    vsSource = document.getElementById("vertex-shader")?.textContent,
    fsSource = document.getElementById("fragment-shader")?.textContent;
  if (!gl) {
    throw "Browser does not support webgl.";
  }
  if (!(vsSource && fsSource)) {
    throw "No shader found.";
  }
  gl.clearColor(0, 0, 0, 0);
  gl.clearDepth(1);
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  gl.useProgram(shaderProgram);
  //gl.enable(gl.DEPTH_TEST);

  return [gl, shaderProgram, canvas];
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
    throw (
      "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
    );
  }
  gl.detachShader(shaderProgram, vertexShader);
  gl.detachShader(shaderProgram, fragmentShader);
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
    gl.deleteShader(shader);
    throw (
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
  }

  return shader;
}

function initVAO(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw "vao null";
  }
  gl.bindVertexArray(vao);
  return vao;
}

function enableVertex(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  size_type_stride_offset: number[][],
  attribNames: string[]
) {
  attribNames.forEach((element, i) => {
    const loc = gl.getAttribLocation(program, element);
    gl.enableVertexAttribArray(loc);
    const stso = size_type_stride_offset[i];
    gl.vertexAttribPointer(loc, stso[0], stso[1], false, stso[2], stso[3]);
  });
}

function bindBuffer(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw "create buffer failed.";
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  return positionBuffer;
}

export { initGL, bindBuffer, enableVertex, initVAO };

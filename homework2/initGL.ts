function initGL(): [WebGL2RenderingContext, WebGLProgram] {
  const gl = (
      document.getElementById("glcanvas") as HTMLCanvasElement
    )?.getContext("webgl2"),
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
  gl.enable(gl.DEPTH_TEST);

  return [gl, shaderProgram];
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

function bindVertex(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  bufferArray: number[],
  attribName: string,
  dimension: number
) {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw "create buffer failed.";
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferArray), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, attribName);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, dimension, gl.FLOAT, false, 0, 0);

  return positionBuffer;
}

export { initGL, bindVertex };

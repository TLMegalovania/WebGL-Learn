import * as three from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const canvas = document.getElementById("glcanvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw "Canvas not found";
}

const render = new three.WebGLRenderer({
  canvas: canvas,
});
render.setClearColor(114514);

const scene = new three.Scene();

const camera = new three.PerspectiveCamera(50, canvas.width / canvas.height);
camera.position.set(0, 0, 3);

const material = new three.MeshPhongMaterial({
  specular: 0xffffff,
  shininess: 50,
  side: three.FrontSide,
});

const loader = new OBJLoader();
let obj: three.Group | undefined;
loader.loadAsync("./kitten.obj").then(
  (group) => {
    group.traverse((child) => {
      if (child instanceof three.Mesh) {
        child.material = material;
      }
    });
    obj = group;
    scene.add(group);
  },
  (error) => {
    throw error;
  }
);

const ambLight = new three.AmbientLight(0x114514, 0.2),
  dirLight = new three.DirectionalLight(0xffffff, 0.5);

dirLight.position.set(0, 0, 1);
scene.add(ambLight, dirLight);

render.setSize(canvas.width, canvas.height);

const animate = () => {
  requestAnimationFrame(animate);
  render.render(scene, camera);
};
animate();

function translateX(distance: number) {
  obj?.translateX(distance);
}

function translateY(distance: number) {
  obj?.translateY(distance);
}

function translateZ(distance: number) {
  obj?.translateZ(distance);
}

function yaw(angle: number) {
  obj?.rotateZ(angle);
}

function pitch(angle: number) {
  obj?.rotateY(angle);
}

function roll(angle: number) {
  obj?.rotateX(angle);
}

function scale(dx: number, dy: number, dz: number) {
  obj?.scale.add(new three.Vector3(dx, dy, dz));
}

function flatShade() {
  material.flatShading = true;
  console.log("flatShade");
}

function smoothShade() {
  material.flatShading = false;
  console.log("smoothShade");
}

const dTrans = 0.1,
  dAngle = 0.1,
  dScale = 0.1;

document
  .getElementById("+X")
  ?.addEventListener("click", () => translateX(dTrans));

document
  .getElementById("-X")
  ?.addEventListener("click", () => translateX(-dTrans));
document
  .getElementById("+Y")
  ?.addEventListener("click", () => translateY(dTrans));
document
  .getElementById("-Y")
  ?.addEventListener("click", () => translateY(-dTrans));
document
  .getElementById("+Z")
  ?.addEventListener("click", () => translateZ(dTrans));
document
  .getElementById("-Z")
  ?.addEventListener("click", () => translateZ(-dTrans));
document.getElementById("+Yaw")?.addEventListener("click", () => yaw(dAngle));
document.getElementById("-Yaw")?.addEventListener("click", () => yaw(-dAngle));
document
  .getElementById("+Pitch")
  ?.addEventListener("click", () => pitch(dAngle));
document
  .getElementById("-Pitch")
  ?.addEventListener("click", () => pitch(-dAngle));
document.getElementById("+Roll")?.addEventListener("click", () => roll(dAngle));
document
  .getElementById("-Roll")
  ?.addEventListener("click", () => roll(-dAngle));
document
  .getElementById("+XScale")
  ?.addEventListener("click", () => scale(dScale, 0, 0));
document
  .getElementById("-XScale")
  ?.addEventListener("click", () => scale(-dScale, 0, 0));
document
  .getElementById("+YScale")
  ?.addEventListener("click", () => scale(0, dScale, 0));
document
  .getElementById("-YScale")
  ?.addEventListener("click", () => scale(0, -dScale, 0));
document
  .getElementById("+ZScale")
  ?.addEventListener("click", () => scale(0, 0, dScale));
document
  .getElementById("-ZScale")
  ?.addEventListener("click", () => scale(0, 0, -dScale));
document.getElementById("flat")?.addEventListener("click", flatShade);
document.getElementById("smooth")?.addEventListener("click", smoothShade);

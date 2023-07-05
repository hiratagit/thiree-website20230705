import './style.css'
import * as THREE from "three";

//canvas
const canvas = document.querySelector("#webgl");

async function loadTex(url) {
  const texLoader = new THREE.TextureLoader();
  const texture = await texLoader.loadAsync(url);
  return texture;
}

//シーン
const scene = new THREE.Scene();
const bgTexture = await loadTex("image/scene-bg.JPG");
scene.background = bgTexture;

//サイズ
const sizes = {
  width: innerWidth,
  height: innerHeight,
};

//レンダラー
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

// オブジェクト作成
const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10);
const boxMaterial = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0.5, -15);
box.rotation.set(1, 1, 0);

const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);
const torusMaterial = new THREE.MeshNormalMaterial();
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(0, 1, 10);

scene.add(box, torus);

// 線形補間で滑らかに移動させる
function lerp(x, y, a) {
  return ( 1 - a ) * x + a * y;
}

// 各区間内でのスクロールの割合 0 ~ 1の値
function scalePercent(start, end) {
  return ( scrollParcent - start )  / ( end - start );

}

// scrollAnimationの定義
const animationScripts = [];
animationScripts.push({
  start: 0,
  end: 40,
  function() {
    camera.lookAt(box.position);
    camera.position.set(0, 1, 10);
    box.position.z = lerp(-15, 2, scalePercent(this.start, this.end));
    torus.position.z = lerp(10, -20, scalePercent(this.start, this.end));
  }
});

animationScripts.push({
  start: 40,
  end: 60,
  function() {
    camera.lookAt(box.position);
    camera.position.set(0, 1, 10);
    box.rotation.z = lerp(1, 3.14, scalePercent(this.start, this.end));
  }
});

animationScripts.push({
  start: 60,
  end: 80,
  function() {
    camera.position.x = lerp(0, -15, scalePercent(this.start, this.end));
    camera.position.y = lerp(1,  15, scalePercent(this.start, this.end));
    camera.position.z = lerp(10, 25, scalePercent(this.start, this.end));
    camera.lookAt(box.position);
  }
});

animationScripts.push({
  start: 80,
  end: 100,
  function() {
    camera.lookAt(box.position);
    box.rotation.x += 0.02;
    box.rotation.y += 0.02;
  }
});

function playScrollAnimation() {
  animationScripts.forEach( animation => {
    if(scrollParcent >= animation.start && scrollParcent <= animation.end) {
      animation.function();
    }
  })
}

// スクロール量を取得する
let scrollParcent = 0;
window.addEventListener('scroll', () => {
  scrollParcent = 
    ( window.scrollY / ( document.documentElement.scrollHeight - document.documentElement.clientHeight ) ) * 100;
  scrollParcent = Math.floor(scrollParcent);

});
 
//アニメーション
const tick = () => {

  playScrollAnimation();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});

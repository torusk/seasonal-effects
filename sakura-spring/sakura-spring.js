/*
 * 春の桜吹雪アニメーション
 * 明るい空を背景とした桜のエフェクト
 */

"use strict";

// Canvas要素を取得
const sakuraCanvas = document.getElementById("sakura-canvas");

// コンテキストの取得
const ctx = sakuraCanvas.getContext("2d");

// Canvas サイズの設定とリサイズ関数
function resizeCanvas() {
  sakuraCanvas.width = window.innerWidth;
  sakuraCanvas.height = window.innerHeight;
}
resizeCanvas();

// 桜の花びらのクラス
class SakuraPetal {
  constructor() {
    this.reset();
  }

  reset() {
    // 花びらの位置をランダムに設定
    this.x = Math.random() * sakuraCanvas.width;
    this.y = -10 - Math.random() * 50; // 画面の上から少し上に生成

    // 花びらのサイズをランダムに設定（少し大きめに）
    this.size = 10 + Math.random() * 15;

    // 透明度をランダムに設定
    this.opacity = 0.7 + Math.random() * 0.3;

    // 落下速度と横移動速度をランダムに設定（穏やかに）
    this.speedY = 0.3 + Math.random() * 1.2;
    this.speedX = 0.3 + Math.random() * 0.7;
    this.speedRotate = 0.01 + Math.random() * 0.03;

    // 横移動の方向をランダムに設定
    this.direction = Math.random() > 0.5 ? 1 : -1;

    // 花びらの回転角度
    this.rotation = Math.random() * Math.PI * 2;

    // 揺れの振幅と頻度
    this.swing = {
      amplitude: 0.5 + Math.random() * 1.5,
      frequency: 0.01 + Math.random() * 0.02,
    };

    // 揺れの時間オフセット
    this.timeOffset = Math.random() * 100;

    // 春らしい桜色の色合いをランダムに設定
    this.color = this.getRandomSakuraColor();
  }

  // ランダムな桜色を生成
  getRandomSakuraColor() {
    // 桜色の範囲（明るいピンク系）
    const r = 245 + Math.floor(Math.random() * 10);
    const g = 170 + Math.floor(Math.random() * 50);
    const b = 200 + Math.floor(Math.random() * 35);
    return `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
  }

  // 花びらの更新処理
  update(time) {
    // Y方向の移動 (落下)
    this.y += this.speedY;

    // X方向の移動 (風などによる揺れ)
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX * this.direction + swingOffset;

    // 回転
    this.rotation += this.speedRotate;

    // 画面外に出たら再配置
    if (
      this.y > sakuraCanvas.height + 10 ||
      this.x < -20 ||
      this.x > sakuraCanvas.width + 20
    ) {
      this.reset();
    }
  }

  // 花びらの描画処理
  draw() {
    ctx.save();

    // 花びらの中心に移動して回転
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 花びらの描画
    ctx.fillStyle = this.color;
    ctx.beginPath();

    // 花びらの形を描画
    this.drawPetalShape();

    ctx.fill();
    ctx.restore();
  }

  // 桜の花びらの形状を描画
  drawPetalShape() {
    const s = this.size;

    // より自然な桜の花びらの形状
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s / 4, -s / 2, s, -s / 3, s / 2, -s);
    ctx.bezierCurveTo(0, -s / 1.5, -s / 2, -s, -s / 2, -s / 3);
    ctx.bezierCurveTo(-s, -s / 3, -s / 4, -s / 2, 0, 0);

    // 花びらの中央に薄いグラデーションを追加
    const gradient = ctx.createRadialGradient(0, -s / 2, 0, 0, -s / 2, s);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

// 設定
const sakuraConfig = {
  petalCount: 120, // 花びらの数
  backgroundColor: "rgba(232, 244, 248, 0.05)", // 薄い青空色の背景（ほぼ透明）
};

// 花びらの配列
const petals = [];

// 花びらの初期化
function initPetals() {
  for (let i = 0; i < sakuraConfig.petalCount; i++) {
    petals.push(new SakuraPetal());
  }
}

// アニメーションタイマー
let animationTime = 0;
let lastUpdateTime = Date.now();

// アニメーションの更新関数
function update() {
  const now = Date.now();
  const dt = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;

  animationTime += dt;

  // キャンバスをクリア
  ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 半透明の背景を描画（軌跡を残す効果）
  ctx.fillStyle = sakuraConfig.backgroundColor;
  ctx.fillRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 全ての花びらを更新して描画
  petals.forEach((petal) => {
    petal.update(animationTime);
    petal.draw();
  });

  // 次のフレームを要求
  requestAnimationFrame(update);
}

// アプリケーションの初期化と開始
function init() {
  // 花びらの初期化
  initPetals();

  // アニメーションの開始
  update();

  // ウィンドウリサイズイベント
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
}

// 初期化の実行
init();

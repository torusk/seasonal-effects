/*
 * 春の桜吹雪アニメーション
 * 春の背景画像上に桜の花びらが舞うエフェクト
 * クリック時に花びらがふわっと広がる機能付き
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

// クリック位置の追跡用変数
let clickX = -1000;
let clickY = -1000;
let clickTime = 0;
const clickEffectDuration = 2; // クリック効果の持続時間（秒）

// クリックイベントを追跡
sakuraCanvas.addEventListener("click", (e) => {
  // クリック位置を保存
  clickX = e.clientX;
  clickY = e.clientY;

  // クリック時間をリセット
  clickTime = 0;
});

// 桜の花びらのクラス
class SakuraPetal {
  constructor() {
    this.reset();
  }

  reset() {
    // 花びらの位置をランダムに設定
    this.x = Math.random() * sakuraCanvas.width;
    this.y = -10 - Math.random() * 50; // 画面の上から少し上に生成

    // 花びらのサイズを中間サイズに調整
    this.size = 2 + Math.random() * 4; // 中間サイズ

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

    // 春らしい桜色の色合いをランダムに設定（淡いピンク色）
    this.color = this.getRandomSakuraColor();
  }

  // ランダムな桜色を生成（より淡いピンク色に）
  getRandomSakuraColor() {
    // 桜色の範囲（淡いピンク系）
    const r = 245 + Math.floor(Math.random() * 10);
    const g = 200 + Math.floor(Math.random() * 30);
    const b = 220 + Math.floor(Math.random() * 20);
    return `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
  }

  // 花びらの更新処理
  update(time, dt) {
    // Y方向の移動 (落下)
    this.y += this.speedY;

    // X方向の移動 (風などによる揺れ)
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX * this.direction + swingOffset;

    // 回転
    this.rotation += this.speedRotate;

    // クリック効果の適用（クリックしてから一定時間内）
    if (clickTime < clickEffectDuration) {
      // クリック位置との距離を計算
      const dx = this.x - clickX;
      const dy = this.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 影響範囲内（300ピクセル）にある場合
      if (distance < 300) {
        // 距離と経過時間に基づいて影響力を計算
        const timeInfluence = 1 - clickTime / clickEffectDuration;
        const distanceInfluence = 1 - distance / 300;
        const influence = timeInfluence * distanceInfluence * 5; // 影響力の強さを調整

        // クリック位置から外側に広がる効果
        if (distance > 0) {
          // 0での除算を防ぐ
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * influence;
          const moveY = Math.sin(angle) * influence;

          this.x += moveX;
          this.y += moveY;

          // ふわっと効果のため、少し上向きに加速
          this.y -= influence * 0.5;

          // 花びらを少し回転させる
          this.rotation += influence * 0.1;
        }
      }
    }

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

    // サイズが小さいので、単純な形状に変更
    this.drawSimplePetalShape();

    ctx.restore();
  }

  // シンプルな桜の花びらの形状を描画
  drawSimplePetalShape() {
    const s = this.size;

    // シンプルな花びらの形状
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s / 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 花びらの中央に小さなアクセント（サイズに合わせて調整）
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 240, 245, ${this.opacity * 0.6})`;
    ctx.ellipse(0, -s / 6, s / 4, s / 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 設定
const sakuraConfig = {
  petalCount: 300, // 花びらの数（サイズが小さくなったので数を増やす）
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
  clickTime += dt; // クリック後の経過時間を更新

  // キャンバスをクリア
  ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 半透明の背景を描画（軌跡を残す効果）
  ctx.fillStyle = sakuraConfig.backgroundColor;
  ctx.fillRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 全ての花びらを更新して描画
  petals.forEach((petal) => {
    petal.update(animationTime, dt);
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

/*
 * 粉雪アニメーション
 * 冬の背景画像上に雪が降るエフェクト
 * クリック時に周辺の雪がふわっと広がる機能付き
 */

"use strict";

// Canvas要素を取得
const snowCanvas = document.getElementById("sakura-canvas");

// コンテキストの取得
const ctx = snowCanvas.getContext("2d");

// Canvas サイズの設定とリサイズ関数
function resizeCanvas() {
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
}
resizeCanvas();

// クリック位置の追跡用変数
let clickX = -1000;
let clickY = -1000;
let clickTime = 0;
const clickEffectDuration = 2; // クリック効果の持続時間（秒）

// クリックイベントを追跡
snowCanvas.addEventListener("click", (e) => {
  // クリック位置を保存
  clickX = e.clientX;
  clickY = e.clientY;

  // クリック時間をリセット
  clickTime = 0;
});

// 雪の結晶クラス
class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    // 雪の位置をランダムに設定
    this.x = Math.random() * snowCanvas.width;
    this.y = -5 - Math.random() * 30; // 画面の上から少し上に生成

    // 雪の大きさをランダムに設定（小さめに）
    this.size = 2 + Math.random() * 5;

    // 透明度をランダムに設定
    this.opacity = 0.5 + Math.random() * 0.5;

    // 落下速度と横移動速度をランダムに設定
    this.speedY = 0.3 + Math.random() * 1;
    this.speedX = 0.1 + Math.random() * 0.3;
    this.speedRotate = 0.01 + Math.random() * 0.03;

    // 横移動の方向をランダムに設定
    this.direction = Math.random() > 0.5 ? 1 : -1;

    // 雪の回転角度
    this.rotation = Math.random() * Math.PI * 2;

    // 揺れの振幅と頻度
    this.swing = {
      amplitude: 0.3 + Math.random() * 0.7,
      frequency: 0.01 + Math.random() * 0.02,
    };

    // 揺れの時間オフセット
    this.timeOffset = Math.random() * 100;

    // 雪の色を設定（白〜淡い青）
    this.color = this.getRandomSnowColor();

    // 雪の形（円形または結晶）
    this.type = Math.random() > 0.7 ? "crystal" : "circle";
    this.numArms = 6 + Math.floor(Math.random() * 2) * 2; // 6か8の腕
  }

  // ランダムな雪色を生成
  getRandomSnowColor() {
    // 白〜淡い青の範囲
    const blueShift = Math.floor(Math.random() * 20);
    const r = 240 - blueShift;
    const g = 250 - blueShift;
    const b = 255;
    return `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
  }

  // 雪の更新処理
  update(time, dt) {
    // Y方向の移動 (落下)
    this.y += this.speedY;

    // X方向の移動 (風による揺れ)
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX * this.direction + swingOffset;

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

          // 雪を少し回転させる
          this.rotation += influence * 0.1;
        }
      }
    }

    // 回転 (結晶の場合)
    if (this.type === "crystal") {
      this.rotation += this.speedRotate;
    }

    // 画面外に出たら再配置
    if (
      this.y > snowCanvas.height + 10 ||
      this.x < -20 ||
      this.x > snowCanvas.width + 20
    ) {
      this.reset();
    }
  }

  // 雪の描画処理
  draw() {
    ctx.save();

    // 雪の中心に移動して回転
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 雪の描画
    ctx.fillStyle = this.color;

    if (this.type === "circle") {
      // 円形の雪
      this.drawCircle();
    } else {
      // 結晶型の雪
      this.drawCrystal();
    }

    ctx.restore();
  }

  // 円形の雪を描画
  drawCircle() {
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 結晶型の雪を描画
  drawCrystal() {
    const s = this.size;
    const arms = this.numArms;

    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const angle = ((Math.PI * 2) / arms) * i;
      const length = s;

      // 中心から先端へ
      ctx.moveTo(0, 0);
      const endX = Math.sin(angle) * length;
      const endY = Math.cos(angle) * length;
      ctx.lineTo(endX, endY);

      // 小枝を追加
      const branchLength = length * 0.4;
      const branchAngle1 = angle + Math.PI / 6;
      const branchAngle2 = angle - Math.PI / 6;

      // 枝の位置（中心からの距離に応じて）
      const branchPos = 0.6;
      const branchX = Math.sin(angle) * length * branchPos;
      const branchY = Math.cos(angle) * length * branchPos;

      // 小枝1
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + Math.sin(branchAngle1) * branchLength,
        branchY + Math.cos(branchAngle1) * branchLength
      );

      // 小枝2
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + Math.sin(branchAngle2) * branchLength,
        branchY + Math.cos(branchAngle2) * branchLength
      );
    }

    ctx.lineWidth = this.size / 10;
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }
}

// 設定
const snowConfig = {
  flakeCount: 250, // 雪の数
  backgroundColor: "rgba(0, 0, 0, 0.05)", // 黒い背景（ほぼ透明）
};

// 雪の配列
const snowflakes = [];

// 雪の初期化
function initSnowflakes() {
  for (let i = 0; i < snowConfig.flakeCount; i++) {
    snowflakes.push(new Snowflake());
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
  ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  // 半透明の背景を描画（軌跡を残す効果）
  ctx.fillStyle = snowConfig.backgroundColor;
  ctx.fillRect(0, 0, snowCanvas.width, snowCanvas.height);

  // 全ての雪を更新して描画
  snowflakes.forEach((flake) => {
    flake.update(animationTime, dt);
    flake.draw();
  });

  // 次のフレームを要求
  requestAnimationFrame(update);
}

// アプリケーションの初期化と開始
function init() {
  // 雪の初期化
  initSnowflakes();

  // アニメーションの開始
  update();

  // ウィンドウリサイズイベント
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
}

// 初期化の実行
init();

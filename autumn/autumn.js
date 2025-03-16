/*
 * 紅葉アニメーション
 * 秋の風に揺れて落ちる紅葉のエフェクト
 */

"use strict";

// Canvas要素を取得
const autumnCanvas = document.getElementById("autumn-canvas");

// コンテキストの取得
const ctx = autumnCanvas.getContext("2d");

// Canvas サイズの設定とリサイズ関数
function resizeCanvas() {
  autumnCanvas.width = window.innerWidth;
  autumnCanvas.height = window.innerHeight;
}
resizeCanvas();

// 紅葉の葉クラス
class AutumnLeaf {
  constructor() {
    this.reset();
  }

  reset() {
    // 葉の位置をランダムに設定
    this.x = Math.random() * autumnCanvas.width;
    this.y = -20 - Math.random() * 50; // 画面の上から少し上に生成

    // 葉のサイズをランダムに設定
    this.size = 15 + Math.random() * 15;

    // 透明度をランダムに設定
    this.opacity = 0.7 + Math.random() * 0.3;

    // 落下速度と横移動速度をランダムに設定
    this.speedY = 0.6 + Math.random() * 1.2;
    this.speedX = 0.3 + Math.random() * 0.8;
    this.speedRotate = 0.01 + Math.random() * 0.03;

    // 横移動の方向をランダムに設定
    this.direction = Math.random() > 0.5 ? 1 : -1;

    // 葉の回転角度
    this.rotation = Math.random() * Math.PI * 2;

    // 揺れの振幅と頻度
    this.swing = {
      amplitude: 1 + Math.random() * 2,
      frequency: 0.01 + Math.random() * 0.02,
    };

    // 揺れの時間オフセット
    this.timeOffset = Math.random() * 100;

    // 紅葉の色（赤、オレンジ、黄色）
    this.color = this.getRandomAutumnColor();

    // 葉の種類（カエデ、イチョウなど）
    this.type = Math.random() > 0.5 ? "maple" : "ginkgo";
  }

  // ランダムな秋の色を生成
  getRandomAutumnColor() {
    const colors = [
      // 赤系
      "rgba(187, 37, 37, " + this.opacity + ")",
      "rgba(214, 69, 65, " + this.opacity + ")",
      // オレンジ系
      "rgba(232, 121, 36, " + this.opacity + ")",
      "rgba(235, 140, 52, " + this.opacity + ")",
      // 黄色系
      "rgba(212, 175, 55, " + this.opacity + ")",
      "rgba(255, 215, 0, " + this.opacity + ")",
      // 茶色系
      "rgba(139, 69, 19, " + this.opacity + ")",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 葉の更新処理
  update(time) {
    // Y方向の移動 (落下)
    this.y += this.speedY;

    // X方向の移動 (風による揺れ)
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX * this.direction + swingOffset;

    // 回転
    this.rotation += this.speedRotate;

    // 画面外に出たら再配置
    if (
      this.y > autumnCanvas.height + 10 ||
      this.x < -30 ||
      this.x > autumnCanvas.width + 30
    ) {
      this.reset();
    }
  }

  // 葉の描画処理
  draw() {
    ctx.save();

    // 葉の中心に移動して回転
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 葉の描画
    ctx.fillStyle = this.color;
    ctx.beginPath();

    if (this.type === "maple") {
      this.drawMapleLeaf();
    } else {
      this.drawGinkgoLeaf();
    }

    ctx.fill();
    ctx.restore();
  }

  // カエデの葉を描画
  drawMapleLeaf() {
    const s = this.size;

    // カエデの葉の形状
    ctx.moveTo(0, -s * 0.5);
    
    // 左上の切れ込み
    ctx.bezierCurveTo(-s * 0.3, -s * 0.4, -s * 0.7, -s * 0.2, -s * 0.8, 0);
    
    // 左下の切れ込み
    ctx.bezierCurveTo(-s * 0.7, s * 0.2, -s * 0.5, s * 0.3, -s * 0.3, s * 0.5);
    
    // 下部の切れ込み
    ctx.bezierCurveTo(-s * 0.2, s * 0.6, s * 0.2, s * 0.6, s * 0.3, s * 0.5);
    
    // 右下の切れ込み
    ctx.bezierCurveTo(s * 0.5, s * 0.3, s * 0.7, s * 0.2, s * 0.8, 0);
    
    // 右上の切れ込み
    ctx.bezierCurveTo(s * 0.7, -s * 0.2, s * 0.3, -s * 0.4, 0, -s * 0.5);
    
    // 葉脈を描画（オプション）
    if (Math.random() > 0.5) {
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(0, s * 0.5);
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.6, s * 0.1);
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.6, s * 0.1);
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(-s * 0.4, -s * 0.1);
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(s * 0.4, -s * 0.1);
    }
  }

  // イチョウの葉を描画
  drawGinkgoLeaf() {
    const s = this.size;

    // イチョウの葉の形状
    ctx.moveTo(0, -s * 0.1); // 葉の付け根
    
    // 扇形の葉を描画
    ctx.bezierCurveTo(-s * 0.4, -s * 0.3, -s * 0.8, s * 0.2, -s * 0.5, s * 0.6);
    ctx.bezierCurveTo(-s * 0.3, s * 0.7, s * 0.3, s * 0.7, s * 0.5, s * 0.6);
    ctx.bezierCurveTo(s * 0.8, s * 0.2, s * 0.4, -s * 0.3, 0, -s * 0.1);
    
    // 中央の切れ込み
    ctx.moveTo(0, -s * 0.1);
    ctx.lineTo(0, s * 0.6);
  }
}

// 設定
const autumnConfig = {
  leafCount: 100, // 葉の数
  backgroundColor: "rgba(42, 21, 6, 0.05)", // 背景色（半透明）
};

// 紅葉の配列
const autumnLeaves = [];

// 紅葉の初期化
function initAutumnLeaves() {
  for (let i = 0; i < autumnConfig.leafCount; i++) {
    autumnLeaves.push(new AutumnLeaf());
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
  ctx.clearRect(0, 0, autumnCanvas.width, autumnCanvas.height);

  // 半透明の背景を描画（軌跡を残す効果）
  ctx.fillStyle = autumnConfig.backgroundColor;
  ctx.fillRect(0, 0, autumnCanvas.width, autumnCanvas.height);

  // 全ての紅葉を更新して描画
  autumnLeaves.forEach((leaf) => {
    leaf.update(animationTime);
    leaf.draw();
  });

  // 次のフレームを要求
  requestAnimationFrame(update);
}

// アプリケーションの初期化と開始
function init() {
  // 紅葉の初期化
  initAutumnLeaves();

  // アニメーションの開始
  update();

  // ウィンドウリサイズイベント
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
}

// 初期化の実行
init();
/*
 * 四季の移ろいアニメーション
 * 冬の雪と春の桜を表現
 */

"use strict";

// Canvas要素を取得
const snowCanvas = document.getElementById("snow-canvas");
const sakuraCanvas = document.getElementById("sakura-canvas");

// コンテキストの取得
const snowCtx = snowCanvas.getContext("2d");
const sakuraCtx = sakuraCanvas.getContext("2d");

// Canvas サイズの設定とリサイズ関数
function resizeCanvas() {
  // 雪キャンバスのリサイズ
  snowCanvas.width = snowCanvas.offsetWidth;
  snowCanvas.height = snowCanvas.offsetHeight;

  // 桜キャンバスのリサイズ
  sakuraCanvas.width = sakuraCanvas.offsetWidth;
  sakuraCanvas.height = sakuraCanvas.offsetHeight;
}
resizeCanvas();

// クリック位置の追跡用変数
let clickX = -1000;
let clickY = -1000;
let clickTime = 0;
const clickEffectDuration = 2; // クリック効果の持続時間（秒）

// クリックイベントを追跡（雪キャンバス）
snowCanvas.addEventListener("click", (e) => {
  // キャンバス内での相対位置を計算
  const rect = snowCanvas.getBoundingClientRect();
  clickX = e.clientX - rect.left;
  clickY = e.clientY - rect.top;

  // クリック時間をリセット
  clickTime = 0;
});

// クリックイベントを追跡（桜キャンバス）
sakuraCanvas.addEventListener("click", (e) => {
  // キャンバス内での相対位置を計算
  const rect = sakuraCanvas.getBoundingClientRect();
  clickX = e.clientX - rect.left;
  clickY = e.clientY - rect.top;

  // クリック時間をリセット
  clickTime = 0;
});

//----------- 雪のクラス -----------//
class Snowflake {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    // 雪の位置をランダムに設定
    this.x = Math.random() * this.canvas.width;
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
  update(time, dt, ctx) {
    // Y方向の移動 (落下)
    this.y += this.speedY;

    // X方向の移動 (風による揺れ)
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX * this.direction + swingOffset;

    // クリック効果の適用（クリックしてから一定時間内）
    if (clickTime < clickEffectDuration && ctx === snowCtx) {
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
      this.y > this.canvas.height + 10 ||
      this.x < -20 ||
      this.x > this.canvas.width + 20
    ) {
      this.reset();
    }
  }

  // 雪の描画処理
  draw(ctx) {
    ctx.save();

    // 雪の中心に移動して回転
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 雪の描画
    ctx.fillStyle = this.color;

    if (this.type === "circle") {
      // 円形の雪
      this.drawCircle(ctx);
    } else {
      // 結晶型の雪
      this.drawCrystal(ctx);
    }

    ctx.restore();
  }

  // 円形の雪を描画
  drawCircle(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 結晶型の雪を描画
  drawCrystal(ctx) {
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

//----------- 桜の花びらのクラス -----------//
class SakuraPetal {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    // 花びらの位置をランダムに設定
    this.x = Math.random() * this.canvas.width;
    this.y = -10 - Math.random() * 50; // 画面の上から少し上に生成

    // 花びらのサイズを調整
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

  // ランダムな桜色を生成
  getRandomSakuraColor() {
    // 桜色の範囲（淡いピンク系）
    const r = 245 + Math.floor(Math.random() * 10);
    const g = 200 + Math.floor(Math.random() * 30);
    const b = 220 + Math.floor(Math.random() * 20);
    return `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
  }

  // 花びらの更新処理
  update(time, dt, ctx) {
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
    if (clickTime < clickEffectDuration && ctx === sakuraCtx) {
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
      this.y > this.canvas.height + 10 ||
      this.x < -20 ||
      this.x > this.canvas.width + 20
    ) {
      this.reset();
    }
  }

  // 花びらの描画処理
  draw(ctx) {
    ctx.save();

    // 花びらの中心に移動して回転
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 花びらの描画
    ctx.fillStyle = this.color;

    // 花びらの形状を描画
    this.drawSimplePetalShape(ctx);

    ctx.restore();
  }

  // シンプルな桜の花びらの形状を描画
  drawSimplePetalShape(ctx) {
    const s = this.size;

    // シンプルな花びらの形状
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s / 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 花びらの中央に小さなアクセント
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 240, 245, ${this.opacity * 0.6})`;
    ctx.ellipse(0, -s / 6, s / 4, s / 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

//----------- 設定 -----------//
const config = {
  snow: {
    count: 250, // 雪の数
    backgroundColor: "rgba(0, 0, 0, 0.05)", // 背景（ほぼ透明）
  },
  sakura: {
    count: 300, // 花びらの数
    backgroundColor: "rgba(232, 244, 248, 0.05)", // 背景（ほぼ透明）
  },
};

// 雪と桜の花びらの配列
const snowflakes = [];
const petals = [];

// 初期化
function initParticles() {
  // 雪の初期化
  for (let i = 0; i < config.snow.count; i++) {
    snowflakes.push(new Snowflake(snowCanvas));
  }

  // 桜の花びらの初期化
  for (let i = 0; i < config.sakura.count; i++) {
    petals.push(new SakuraPetal(sakuraCanvas));
  }
}

// アニメーションタイマー
let animationTime = 0;
let lastUpdateTime = Date.now();

// 雪のアニメーション更新関数
function updateSnow() {
  // キャンバスをクリア
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  // 半透明の背景を描画
  snowCtx.fillStyle = config.snow.backgroundColor;
  snowCtx.fillRect(0, 0, snowCanvas.width, snowCanvas.height);

  // 全ての雪を更新して描画
  snowflakes.forEach((flake) => {
    flake.update(animationTime, 0, snowCtx);
    flake.draw(snowCtx);
  });
}

// 桜のアニメーション更新関数
function updateSakura() {
  // キャンバスをクリア
  sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 半透明の背景を描画
  sakuraCtx.fillStyle = config.sakura.backgroundColor;
  sakuraCtx.fillRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  // 全ての花びらを更新して描画
  petals.forEach((petal) => {
    petal.update(animationTime, 0, sakuraCtx);
    petal.draw(sakuraCtx);
  });
}

// メインアニメーションループ
function update() {
  const now = Date.now();
  const dt = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;

  animationTime += dt;
  clickTime += dt; // クリック後の経過時間を更新

  // 両方のアニメーションを更新
  updateSnow();
  updateSakura();

  // 次のフレームを要求
  requestAnimationFrame(update);
}

// アプリケーションの初期化と開始
function init() {
  // 粒子の初期化
  initParticles();

  // アニメーションの開始
  update();

  // ウィンドウリサイズイベント
  window.addEventListener("resize", () => {
    resizeCanvas();
  });

  // スクロール検出
  window.addEventListener("scroll", () => {
    // 必要に応じてスクロール位置に基づいた処理を追加できます
  });
}

// 初期化の実行
init();

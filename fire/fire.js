/*
 * 焚き火アニメーション
 * 炎と火の粉の表現
 */

"use strict";

// Canvas要素を取得
const fireCanvas = document.getElementById("fire-canvas");

// コンテキストの取得
const ctx = fireCanvas.getContext("2d");

// Canvas サイズの設定とリサイズ関数
function resizeCanvas() {
  fireCanvas.width = window.innerWidth;
  fireCanvas.height = window.innerHeight;
}
resizeCanvas();

// 木の薪の位置（画面中央下部）
const firebaseX = fireCanvas.width / 2;
const firebaseY = fireCanvas.height * 0.8;

// 火の粒子クラス
class FireParticle {
  constructor(baseX, baseY) {
    this.reset(baseX, baseY);
  }

  reset(baseX, baseY) {
    // 火の粒子の生成位置（薪の中心付近でランダム）
    const spread = 70;
    this.x = baseX + (-spread / 2 + Math.random() * spread);
    this.y = baseY - Math.random() * 10;
    
    // 粒子の初期サイズ（火の中心部分は大きめ）
    this.size = 3 + Math.random() * 15;
    
    // 透明度（徐々に薄くなる）
    this.alpha = 0.7 + Math.random() * 0.3;
    
    // 上昇速度（ランダム）
    this.speedY = 1 + Math.random() * 3;
    
    // 横方向の揺れ（風の影響）
    this.speedX = -0.5 + Math.random() * 1;
    
    // 粒子の寿命
    this.lifespan = 40 + Math.random() * 60;
    this.age = 0;
    
    // サイズの減少率
    this.shrinkRate = 0.94 + Math.random() * 0.04;
    
    // 色（赤〜オレンジ〜黄色）
    this.colorIndex = Math.floor(Math.random() * 3); // 0=赤, 1=オレンジ, 2=黄色
    
    // 炎のゆらぎ用パラメータ
    this.wobbleSpeed = 0.1 + Math.random() * 0.1;
    this.wobbleOffset = Math.random() * Math.PI * 2;
  }

  // 火の粒子の更新処理
  update(time, baseX, baseY) {
    // 年齢を更新
    this.age++;
    
    // 寿命が来たらリセット
    if (this.age > this.lifespan) {
      this.reset(baseX, baseY);
      return;
    }
    
    // サイズを徐々に小さく
    this.size *= this.shrinkRate;
    
    // 透明度を徐々に下げる
    this.alpha = Math.max(0, this.alpha - 0.005);
    
    // 上昇（少しずつ加速）
    this.speedY *= 1.01;
    this.y -= this.speedY;
    
    // 横方向の揺れ（サインカーブで自然な動き）
    const wobble = Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * 0.5;
    this.x += this.speedX + wobble;
    
    // サイズが小さくなりすぎたらリセット
    if (this.size < 0.5) {
      this.reset(baseX, baseY);
    }
  }
  
  // 火の粒子の描画
  draw() {
    // 色の設定（炎の高さによって色が変化）
    let color;
    
    // 赤〜オレンジ〜黄色のグラデーション
    const lifeRatio = this.age / this.lifespan;
    
    // 基本色の設定
    if (this.colorIndex === 0) {
      // 赤系
      color = `rgba(255, ${Math.floor(50 + lifeRatio * 100)}, 0, ${this.alpha})`;
    } else if (this.colorIndex === 1) {
      // オレンジ系
      color = `rgba(255, ${Math.floor(100 + lifeRatio * 80)}, 0, ${this.alpha})`;
    } else {
      // 黄色系（上部の火の粉に使用）
      color = `rgba(255, ${Math.floor(180 + lifeRatio * 75)}, ${Math.floor(lifeRatio * 100)}, ${this.alpha})`;
    }
    
    // グロー効果（光の拡散）
    const gradientSize = this.size * 2;
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, gradientSize
    );
    
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, gradientSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 火の粉クラス
class Ember {
  constructor(baseX, baseY) {
    this.reset(baseX, baseY);
  }

  reset(baseX, baseY) {
    // 火の粉の発生位置（炎の上部付近）
    const spread = 40;
    this.x = baseX + (-spread / 2 + Math.random() * spread);
    this.y = baseY - 50 - Math.random() * 50;
    
    // 火の粉のサイズ（小さめ）
    this.size = 0.5 + Math.random() * 2;
    
    // 透明度
    this.alpha = 0.4 + Math.random() * 0.6;
    
    // 上昇速度
    this.speedY = 0.5 + Math.random() * 2;
    
    // 横方向の揺れ（風の影響）
    this.speedX = -0.5 + Math.random() * 1;
    
    // 揺れの振幅と頻度
    this.swing = {
      amplitude: 0.5 + Math.random() * 1,
      frequency: 0.02 + Math.random() * 0.03,
    };
    
    // 揺れの時間オフセット
    this.timeOffset = Math.random() * 100;
    
    // 寿命
    this.lifespan = 100 + Math.random() * 200;
    this.age = 0;
    
    // 明滅パラメータ
    this.pulseSpeed = 0.1 + Math.random() * 0.2;
    
    // 色（赤〜オレンジ）
    const r = 255;
    const g = 100 + Math.floor(Math.random() * 120);
    const b = Math.floor(Math.random() * 50);
    this.color = [r, g, b];
  }

  // 火の粉の更新処理
  update(time, baseX, baseY) {
    // 年齢を更新
    this.age++;
    
    // 寿命が来たらリセット
    if (this.age > this.lifespan) {
      this.reset(baseX, baseY);
      return;
    }
    
    // 上昇
    this.y -= this.speedY;
    
    // 横方向の揺れ
    const swingOffset =
      Math.sin(time * this.swing.frequency + this.timeOffset) *
      this.swing.amplitude;
    this.x += this.speedX + swingOffset;
    
    // 透明度を徐々に下げる
    this.alpha = Math.max(0, this.alpha - 0.002);
    
    // 明滅効果
    const pulseValue = 0.7 + Math.sin(time * this.pulseSpeed) * 0.3;
    
    // 画面外に出たらリセット
    if (
      this.y < 0 ||
      this.x < 0 ||
      this.x > fireCanvas.width
    ) {
      this.reset(baseX, baseY);
    }
    
    // 透明度が低くなりすぎたらリセット
    if (this.alpha < 0.1) {
      this.reset(baseX, baseY);
    }
  }
  
  // 火の粉の描画処理
  draw() {
    const [r, g, b] = this.color;
    
    // 明滅効果を含めた透明度
    const finalAlpha = this.alpha * (0.7 + Math.sin(Date.now() * 0.01 + this.timeOffset) * 0.3);
    
    // 火の粉のグロー（光の拡散）
    const glowSize = this.size * 3;
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, glowSize
    );
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalAlpha})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 火の粉の中心（明るい部分）
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, ${b + 100}, ${finalAlpha})`;
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 背景の炎のグロー効果
function drawFireGlow(baseX, baseY, intensity) {
  const glowSize = 150 + Math.sin(Date.now() * 0.003) * 20;
  
  const gradient = ctx.createRadialGradient(
    baseX, baseY - 30, 0,
    baseX, baseY - 30, glowSize
  );
  
  gradient.addColorStop(0, `rgba(255, 100, 0, ${0.2 * intensity})`);
  gradient.addColorStop(0.4, `rgba(255, 50, 0, ${0.1 * intensity})`);
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(baseX, baseY - 30, glowSize, 0, Math.PI * 2);
  ctx.fill();
}

// 設定
const fireConfig = {
  particleCount: 150, // 炎の粒子数
  emberCount: 50,     // 火の粉の数
  backgroundColor: "rgba(10, 10, 10, 0.2)", // 背景色（半透明）
};

// 炎の粒子配列
const fireParticles = [];

// 火の粉の配列
const embers = [];

// 粒子の初期化
function initParticles() {
  // 炎の粒子の初期化
  for (let i = 0; i < fireConfig.particleCount; i++) {
    fireParticles.push(new FireParticle(firebaseX, firebaseY));
  }
  
  // 火の粉の初期化
  for (let i = 0; i < fireConfig.emberCount; i++) {
    embers.push(new Ember(firebaseX, firebaseY));
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

  // 薪の位置を更新（ウィンドウサイズが変わった場合）
  const firebaseX = fireCanvas.width / 2;
  const firebaseY = fireCanvas.height * 0.8;

  // キャンバスをクリア
  ctx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);

  // 半透明の背景を描画
  ctx.fillStyle = fireConfig.backgroundColor;
  ctx.fillRect(0, 0, fireCanvas.width, fireCanvas.height);
  
  // 炎のグローを描画
  const glowIntensity = 0.8 + Math.sin(animationTime * 2) * 0.2;
  drawFireGlow(firebaseX, firebaseY, glowIntensity);

  // 全ての炎の粒子を更新して描画
  fireParticles.forEach((particle) => {
    particle.update(animationTime, firebaseX, firebaseY);
    particle.draw();
  });
  
  // 全ての火の粉を更新して描画
  embers.forEach((ember) => {
    ember.update(animationTime, firebaseX, firebaseY);
    ember.draw();
  });

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
    
    // 薪の位置を更新
    const firebaseX = fireCanvas.width / 2;
    const firebaseY = fireCanvas.height * 0.8;
    
    // 薪の表示位置を更新
    document.getElementById('logs').style.left = `${firebaseX - 100}px`;
  });
}

// 初期化の実行
init();
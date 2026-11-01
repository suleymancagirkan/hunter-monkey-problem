"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { soundFX } from "../../utils/soundEffects";
import {
  IconPlayerPlayFilled,
  IconRotateClockwise,
  IconCrosshair,
  IconCamera,
  IconEye
} from "@tabler/icons-react";

export default function SimulationCanvas({
  hunterX = 10,
  hunterY = 2,
  monkeyX = 60,
  monkeyY = 32,
  muzzleVelocity = 38,
  gravity = 9.8,
  monkeyDropDelay = 0.0,
  aimAngle = null,
  isAutoAim = true,
  projectileType = "banana",
  showSightline = true,
  showTrails = true,
  showDeltaH = true,
  showGrid = true,
  timeScale = 1.0,
  viewMode = "side", // 'side' (2.5D Saha) | 'scope' (Avcının Dürbünü)
  onHit = () => {},
  onMiss = () => {},
  onStatusChange = () => {},
  onStatsUpdate = () => {},
}) {
  const canvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [simState, setSimState] = useState("idle");

  // Fizik motoru durumu (Re-render cascade olmadan ref içinde saklanır)
  const stateRef = useRef({
    simTime: 0,
    bullet: {
      x: hunterX,
      y: hunterY,
      vx: 0,
      vy: 0,
      active: false,
      hit: false,
      trail: [],
    },
    theoreticalBullet: {
      x: hunterX,
      y: hunterY,
    },
    monkey: {
      x: monkeyX,
      y: monkeyY,
      vy: 0,
      falling: false,
      initialY: monkeyY,
      trail: [],
    },
    particles: [],
    impactRing: null,
    flashIntensity: 0,
  });

  // Hedef açısını hesapla (radyan)
  const calculateAimAngle = useCallback(() => {
    if (!isAutoAim && aimAngle !== null) {
      return (aimAngle * Math.PI) / 180;
    }
    const dx = monkeyX - hunterX;
    const dy = monkeyY - hunterY;
    return Math.atan2(dy, dx);
  }, [hunterX, hunterY, monkeyX, monkeyY, isAutoAim, aimAngle]);

  // İsabet durumu fonksiyonu
  const triggerHit = useCallback((x, y) => {
    soundFX.playHit();
    setSimState("hit");
    setIsPlaying(false);
    onStatusChange("hit");
    onHit();

    // Yıldız ve konfeti parçacıkları
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 16 + 4;
      stateRef.current.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.4,
        color: ["#f59e0b", "#10b981", "#38bdf8", "#ec4899", "#6366f1"][Math.floor(Math.random() * 5)],
        size: Math.random() * 5 + 3,
      });
    }

    stateRef.current.impactRing = { x, y, radius: 2, alpha: 1 };

    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.55 },
        colors: ["#10b981", "#38bdf8", "#f59e0b", "#ec4899"],
      });
    } catch {
      // Safe fallback
    }
  }, [onHit, onStatusChange]);

  // Iska fonksiyonu
  const triggerMiss = useCallback((reason) => {
    soundFX.playMiss();
    setSimState(reason);
    setIsPlaying(false);
    onStatusChange(reason);
    onMiss(reason);
  }, [onMiss, onStatusChange]);

  // Simülasyonu başlat / sıfırla
  const resetSimulation = useCallback(() => {
    const angle = calculateAimAngle();
    const vx = muzzleVelocity * Math.cos(angle);
    const vy = muzzleVelocity * Math.sin(angle);

    stateRef.current = {
      simTime: 0,
      bullet: {
        x: hunterX,
        y: hunterY,
        vx: vx,
        vy: vy,
        active: false,
        hit: false,
        trail: [],
      },
      theoreticalBullet: {
        x: hunterX,
        y: hunterY,
      },
      monkey: {
        x: monkeyX,
        y: monkeyY,
        vy: 0,
        falling: false,
        initialY: monkeyY,
        trail: [],
      },
      particles: [],
      impactRing: null,
      flashIntensity: 0,
    };

    setIsPlaying(false);
    setSimState("idle");
    onStatusChange("idle");

    onStatsUpdate({
      simTime: "0.00",
      bulletX: hunterX.toFixed(1),
      bulletY: hunterY.toFixed(1),
      bulletSpeed: muzzleVelocity.toFixed(1),
      monkeyY: monkeyY.toFixed(1),
      deltaH: "0.00",
      angleDeg: ((angle * 180) / Math.PI).toFixed(1),
    });
  }, [hunterX, hunterY, monkeyX, monkeyY, muzzleVelocity, calculateAimAngle, onStatusChange, onStatsUpdate]);

  // Ateşleme fonksiyonu
  const handleFire = () => {
    if (simState === "flying") return;

    resetSimulation();
    const angle = calculateAimAngle();
    const vx = muzzleVelocity * Math.cos(angle);
    const vy = muzzleVelocity * Math.sin(angle);

    stateRef.current.bullet.active = true;
    stateRef.current.bullet.vx = vx;
    stateRef.current.bullet.vy = vy;
    stateRef.current.flashIntensity = 1.0;

    // Namlu alev parçacıkları
    for (let i = 0; i < 16; i++) {
      stateRef.current.particles.push({
        x: hunterX + Math.cos(angle) * 3,
        y: hunterY + Math.sin(angle) * 3,
        vx: (Math.random() * 9 + 4) * Math.cos(angle + (Math.random() - 0.5) * 0.4),
        vy: (Math.random() * 9 + 4) * Math.sin(angle + (Math.random() - 0.5) * 0.4),
        life: 0.9,
        color: i % 2 === 0 ? "#fbbf24" : "#f97316",
        size: Math.random() * 4 + 2,
      });
    }

    soundFX.playShoot();
    setIsPlaying(true);
    setSimState("flying");
    onStatusChange("flying");
  };

  // -------------------------------------------------------------
  // ANA ÇİZİM VE FİZİK DÖNGÜSÜ
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let lastTime = performance.now();

    const render = (currentTime) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05) * timeScale;
      const { width, height } = canvas;
      const state = stateRef.current;

      // -------------------------------------------------------------
      // 1. FİZİK GÜNCELLEMESİ
      // -------------------------------------------------------------
      if (isPlaying && state.bullet.active) {
        state.simTime += dt;
        const currentSimTime = state.simTime;

        // Maymunun hareketi
        if (currentSimTime >= monkeyDropDelay) {
          if (!state.monkey.falling) {
            state.monkey.falling = true;
            soundFX.playFall();
          }
          const tFall = currentSimTime - monkeyDropDelay;
          state.monkey.y = Math.max(0, state.monkey.initialY - 0.5 * gravity * tFall * tFall);
          state.monkey.vy = -gravity * tFall;
        }

        // Merminin hareketi
        const currentAngle = calculateAimAngle();
        const v0 = muzzleVelocity;
        const bulletVx = isAutoAim ? v0 * Math.cos(currentAngle) : v0 * Math.cos((aimAngle * Math.PI) / 180);
        const bulletVyInit = isAutoAim ? v0 * Math.sin(currentAngle) : v0 * Math.sin((aimAngle * Math.PI) / 180);

        state.bullet.x = hunterX + bulletVx * currentSimTime;
        state.bullet.y = hunterY + bulletVyInit * currentSimTime - 0.5 * gravity * currentSimTime * currentSimTime;
        state.bullet.vx = bulletVx;
        state.bullet.vy = bulletVyInit - gravity * currentSimTime;

        state.theoreticalBullet.x = hunterX + bulletVx * currentSimTime;
        state.theoreticalBullet.y = hunterY + bulletVyInit * currentSimTime;

        // Trail izleri
        if (state.bullet.trail.length === 0 || 
            Math.hypot(state.bullet.x - state.bullet.trail[state.bullet.trail.length - 1].x, 
                       state.bullet.y - state.bullet.trail[state.bullet.trail.length - 1].y) > 0.8) {
          state.bullet.trail.push({ x: state.bullet.x, y: state.bullet.y });
          if (state.bullet.trail.length > 120) state.bullet.trail.shift();
        }

        if (state.monkey.falling && (state.monkey.trail.length === 0 || 
            Math.abs(state.monkey.y - state.monkey.trail[state.monkey.trail.length - 1].y) > 0.8)) {
          state.monkey.trail.push({ x: state.monkey.x, y: state.monkey.y });
          if (state.monkey.trail.length > 80) state.monkey.trail.shift();
        }

        // Çarpışma Testi
        const hitRadius = 2.4;
        const distToMonkey = Math.hypot(state.bullet.x - state.monkey.x, state.bullet.y - state.monkey.y);

        if (distToMonkey <= hitRadius && state.bullet.y > 0.2) {
          state.bullet.hit = true;
          triggerHit(state.bullet.x, state.bullet.y);
        } else if (state.bullet.y <= 0) {
          state.bullet.y = 0;
          triggerMiss("miss_ground");
        } else if (state.bullet.x > state.monkey.x + 8) {
          triggerMiss("miss_past");
        } else if (state.monkey.y <= 0 && state.bullet.x < state.monkey.x - 5) {
          triggerMiss("miss_ground");
        }

        const deltaHVal = 0.5 * gravity * currentSimTime * currentSimTime;
        onStatsUpdate({
          simTime: currentSimTime.toFixed(2),
          bulletX: state.bullet.x.toFixed(1),
          bulletY: state.bullet.y.toFixed(1),
          bulletSpeed: Math.hypot(state.bullet.vx, state.bullet.vy).toFixed(1),
          monkeyY: state.monkey.y.toFixed(1),
          deltaH: deltaHVal.toFixed(2),
          distToMonkey: distToMonkey.toFixed(1),
          angleDeg: ((currentAngle * 180) / Math.PI).toFixed(1),
        });
      }

      // Parçacık güncellemeleri
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 9.8 * dt * 0.4;
        p.life -= dt * 1.5;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      if (state.impactRing) {
        state.impactRing.radius += dt * 45;
        state.impactRing.alpha -= dt * 1.3;
        if (state.impactRing.alpha <= 0) state.impactRing = null;
      }

      if (state.flashIntensity > 0) {
        state.flashIntensity = Math.max(0, state.flashIntensity - dt * 4);
      }

      // -------------------------------------------------------------
      // 2. ÇİZİM MODU SEÇİMİ (2.5D SAHA vs AVCININ GÖZÜNDEN DÜRBÜN)
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      if (viewMode === "scope") {
        // =========================================================
        // AVCININ GÖZÜNDEN DÜRBÜN GÖRÜNÜMÜ (FIRST-PERSON SCOPE)
        // =========================================================
        const scopeRadius = Math.min(width, height) * 0.44;
        const centerX = width / 2;
        const centerY = height / 2;

        // Dürbün dışı karanlık vignette
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, width, height);

        // Dürbün camı açılışı
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, scopeRadius, 0, Math.PI * 2);
        ctx.clip();

        // Dürbün içi arka plan (uzak ağaç ve gökyüzü)
        const scopeGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, scopeRadius);
        scopeGrad.addColorStop(0, "#bae6fd");
        scopeGrad.addColorStop(0.7, "#7dd3fc");
        scopeGrad.addColorStop(1, "#38bdf8");
        ctx.fillStyle = scopeGrad;
        ctx.fillRect(centerX - scopeRadius, centerY - scopeRadius, scopeRadius * 2, scopeRadius * 2);

        // Ağaç dalı ve maymunun dürbündeki görünümü
        // Maymunun göreli dikey hareketi (scope merkezine göre)
        const currentSimTime = state.simTime;
        const dropPixels = (state.monkey.initialY - state.monkey.y) * 8;

        // Dürbündeki Ağaç Dalı
        ctx.strokeStyle = "#592308";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY + 20);
        ctx.lineTo(centerX + 160, centerY - 10);
        ctx.stroke();

        // Dürbündeki Maymun (Yakın plan)
        const mScopeY = centerY + dropPixels;
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.arc(centerX, mScopeY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Kulaklar
        ctx.fillStyle = "#a16207";
        ctx.beginPath();
        ctx.arc(centerX - 30, mScopeY - 10, 12, 0, Math.PI * 2);
        ctx.arc(centerX + 30, mScopeY - 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Gözler
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(centerX - 12, mScopeY - 6, 8, 0, Math.PI * 2);
        ctx.arc(centerX + 12, mScopeY - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(centerX - 12, mScopeY - 6, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 12, mScopeY - 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ağız
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (state.bullet.hit) {
          ctx.arc(centerX, mScopeY + 12, 10, 0, Math.PI);
        } else if (state.monkey.falling) {
          ctx.arc(centerX, mScopeY + 14, 6, 0, Math.PI * 2);
        } else {
          ctx.arc(centerX, mScopeY + 10, 8, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();

        // Uçan mermi dürbünden yaklaşırken
        if (state.bullet.active && !state.bullet.hit) {
          const progress = Math.min(1, currentSimTime / Math.max(0.1, (monkeyX - hunterX) / (muzzleVelocity * 0.9)));
          const bScopeSize = 4 + progress * 24;
          const bScopeY = centerY + (state.monkey.initialY - state.bullet.y) * 8;

          ctx.fillStyle = projectileType === "banana" ? "#facc15" : "#ef4444";
          ctx.beginPath();
          ctx.arc(centerX - (1 - progress) * 80, bScopeY, bScopeSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dürbün Cam Yansıması (Glass Sheen)
        const sheen = ctx.createLinearGradient(centerX - scopeRadius, centerY - scopeRadius, centerX + scopeRadius, centerY + scopeRadius);
        sheen.addColorStop(0, "rgba(255, 255, 255, 0.25)");
        sheen.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
        sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = sheen;
        ctx.fillRect(centerX - scopeRadius, centerY - scopeRadius, scopeRadius * 2, scopeRadius * 2);

        // Dürbün Artı Göstergesi (Sniper Reticle)
        ctx.strokeStyle = "rgba(220, 38, 38, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Ana artı
        ctx.moveTo(centerX - scopeRadius, centerY);
        ctx.lineTo(centerX + scopeRadius, centerY);
        ctx.moveTo(centerX, centerY - scopeRadius);
        ctx.lineTo(centerX, centerY + scopeRadius);
        // Mil-dot ölçekleri
        for (let r = 30; r < scopeRadius; r += 30) {
          ctx.moveTo(centerX - 6, centerY + r);
          ctx.lineTo(centerX + 6, centerY + r);
          ctx.moveTo(centerX - 6, centerY - r);
          ctx.lineTo(centerX + 6, centerY - r);
          ctx.moveTo(centerX + r, centerY - 6);
          ctx.lineTo(centerX + r, centerY + 6);
          ctx.moveTo(centerX - r, centerY - 6);
          ctx.lineTo(centerX - r, centerY + 6);
        }
        ctx.stroke();

        // Merkez halka
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Dürbün Dış Metal Halkası (3D Bevel)
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, scopeRadius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Dürbün HUD Bilgisi
        ctx.font = "bold 13px Outfit, monospace";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`RANGE: ${(monkeyX - hunterX).toFixed(0)}m`, centerX - scopeRadius + 20, centerY - scopeRadius + 35);
        ctx.fillText(`ELEV: ${monkeyY}m`, centerX - scopeRadius + 20, centerY - scopeRadius + 55);
        ctx.fillText(`FPS SCOPE v1.0`, centerX + scopeRadius - 130, centerY - scopeRadius + 35);

      } else {
        // =========================================================
        // 2.5D DERİNLİKLİ SAHA KAMERASI (SIDE TACTICAL VIEW)
        // =========================================================
        const worldMaxX = Math.max(monkeyX + 25, 80);
        const worldMaxY = Math.max(monkeyY + 16, 46);
        const paddingLeft = 55;
        const paddingBottom = 48;
        const paddingTop = 32;
        const paddingRight = 45;

        const viewWidth = width - paddingLeft - paddingRight;
        const viewHeight = height - paddingTop - paddingBottom;
        const scaleX = viewWidth / worldMaxX;
        const scaleY = viewHeight / worldMaxY;
        const scale = Math.min(scaleX, scaleY);

        const toScreenX = (mX) => paddingLeft + mX * scale;
        const toScreenY = (mY) => height - paddingBottom - mY * scale;
        const toScreenDist = (distM) => distM * scale;

        // 2.5D Gökyüzü (Zengin Atmosferik Gradyan)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, "#e0f2fe");
        skyGrad.addColorStop(0.35, "#f0f9ff");
        skyGrad.addColorStop(0.7, "#f8fafc");
        skyGrad.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // 2.5D Uzak Dağlar (Arka Plan Katmanı / Depth)
        ctx.fillStyle = "rgba(186, 230, 253, 0.45)";
        ctx.beginPath();
        ctx.moveTo(0, height - paddingBottom - 40);
        ctx.lineTo(width * 0.25, height - paddingBottom - 110);
        ctx.lineTo(width * 0.55, height - paddingBottom - 60);
        ctx.lineTo(width * 0.85, height - paddingBottom - 130);
        ctx.lineTo(width, height - paddingBottom - 50);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Sis Katmanı
        const fogGrad = ctx.createLinearGradient(0, height - paddingBottom - 80, 0, height - paddingBottom);
        fogGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        fogGrad.addColorStop(1, "rgba(255, 255, 255, 0.6)");
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, height - paddingBottom - 80, width, 80);

        // Grid / Cetvel Çizgileri
        if (showGrid) {
          ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);

          for (let gx = 0; gx <= worldMaxX; gx += 10) {
            const sx = toScreenX(gx);
            ctx.beginPath();
            ctx.moveTo(sx, paddingTop);
            ctx.lineTo(sx, height - paddingBottom);
            ctx.stroke();

            ctx.font = "10px Outfit, sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.textAlign = "center";
            ctx.fillText(`${gx}m`, sx, height - paddingBottom + 16);
          }

          for (let gy = 0; gy <= worldMaxY; gy += 10) {
            const sy = toScreenY(gy);
            ctx.beginPath();
            ctx.moveTo(paddingLeft, sy);
            ctx.lineTo(width - paddingRight, sy);
            ctx.stroke();

            ctx.font = "10px Outfit, sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.textAlign = "right";
            ctx.fillText(`${gy}m`, paddingLeft - 8, sy + 3);
          }
          ctx.setLineDash([]);
        }

        // 2.5D Derinlikli Zemin (Perspektif Çimen & Toprak Blok)
        const groundY = toScreenY(0);

        // Zemin Ön Yüzeyi (Toprak Katmanları)
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
        groundGrad.addColorStop(0, "#22c55e");
        groundGrad.addColorStop(0.08, "#16a34a");
        groundGrad.addColorStop(0.18, "#78350f");
        groundGrad.addColorStop(1, "#451a03");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, width, height - groundY);

        // Zemin Üst Işıltı Çizgisi
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(width, groundY);
        ctx.stroke();

        // ---------------------------------------------------------
        // FİZİK ÇİZGİLERİ (SIGHTLINE, DELTA H, TRAILS)
        // ---------------------------------------------------------
        const hSx = toScreenX(hunterX);
        const hSy = toScreenY(hunterY);
        const mOrigSx = toScreenX(monkeyX);
        const mOrigSy = toScreenY(monkeyY);

        // Doğrudan Nişan Çizgisi
        if (showSightline) {
          ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(hSx, hSy);

          const curAngle = calculateAimAngle();
          const sightEndX = toScreenX(hunterX + Math.cos(curAngle) * 140);
          const sightEndY = toScreenY(hunterY + Math.sin(curAngle) * 140);
          ctx.lineTo(sightEndX, sightEndY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Hedef Artı
          ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(mOrigSx, mOrigSy, 11, 0, Math.PI * 2);
          ctx.moveTo(mOrigSx - 16, mOrigSy);
          ctx.lineTo(mOrigSx + 16, mOrigSy);
          ctx.moveTo(mOrigSx, mOrigSy - 16);
          ctx.lineTo(mOrigSx, mOrigSy + 16);
          ctx.stroke();
        }

        // Maymunun Dikey Düşüş Hattı
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mOrigSx, mOrigSy);
        ctx.lineTo(mOrigSx, groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Eşit Düşüş Mesafesi (Delta H Okları)
        if (showDeltaH && isPlaying && state.bullet.active) {
          const theoSx = toScreenX(state.theoreticalBullet.x);
          const theoSy = toScreenY(state.theoreticalBullet.y);
          const bullSx = toScreenX(state.bullet.x);
          const bullSy = toScreenY(state.bullet.y);

          ctx.strokeStyle = "#0284c7";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(theoSx, theoSy);
          ctx.lineTo(bullSx, bullSy);
          ctx.stroke();

          const monNowSy = toScreenY(state.monkey.y);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(mOrigSx, mOrigSy);
          ctx.lineTo(mOrigSx, monNowSy);
          ctx.stroke();

          ctx.font = "bold 11px Outfit, sans-serif";
          ctx.fillStyle = "#0369a1";
          ctx.textAlign = "right";
          ctx.fillText(`Δh mermi`, bullSx - 8, (theoSy + bullSy) / 2);

          ctx.fillStyle = "#b45309";
          ctx.textAlign = "left";
          ctx.fillText(`Δh maymun`, mOrigSx + 8, (mOrigSy + monNowSy) / 2);
        }

        // Mermi İzi (Neon Cyan/Blue Trail)
        if (showTrails && state.bullet.trail.length > 1) {
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 3.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          state.bullet.trail.forEach((pt, idx) => {
            const sx = toScreenX(pt.x);
            const sy = toScreenY(pt.y);
            if (idx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          ctx.stroke();
        }

        // ---------------------------------------------------------
        // 2.5D NİZAMİ NESNELER (AĞAÇ, MAYMUN, AVCI)
        // ---------------------------------------------------------

        // AĞAÇ (TREE)
        const treeBaseSx = toScreenX(monkeyX + 2.5);
        const treeTopSy = toScreenY(monkeyY + 12);
        const treeTrunkWidth = Math.max(16, toScreenDist(2.2));
        const treeBranchY = toScreenY(monkeyY + 2.5);

        // Ağaç Zemin Gölgesi (2.5D Oval Shadow)
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.ellipse(treeBaseSx, groundY, treeTrunkWidth * 1.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde
        const trunkGrad = ctx.createLinearGradient(treeBaseSx - treeTrunkWidth / 2, 0, treeBaseSx + treeTrunkWidth / 2, 0);
        trunkGrad.addColorStop(0, "#78350f");
        trunkGrad.addColorStop(0.5, "#92400e");
        trunkGrad.addColorStop(1, "#592308");
        ctx.fillStyle = trunkGrad;

        ctx.beginPath();
        ctx.moveTo(treeBaseSx - treeTrunkWidth / 1.5, groundY);
        ctx.lineTo(treeBaseSx - treeTrunkWidth / 2, treeTopSy + 20);
        ctx.lineTo(treeBaseSx + treeTrunkWidth / 2, treeTopSy + 20);
        ctx.lineTo(treeBaseSx + treeTrunkWidth / 1.5, groundY);
        ctx.closePath();
        ctx.fill();

        // Kalın Dal
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = Math.max(8, toScreenDist(1.0));
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(treeBaseSx, treeBranchY);
        ctx.quadraticCurveTo(mOrigSx + 5, treeBranchY - 4, mOrigSx - 4, treeBranchY + 2);
        ctx.stroke();

        // Yaprak Kümeleri (2.5D Hacimli Taç)
        const crownRadius = Math.max(30, toScreenDist(6.5));
        const drawLeaf = (cx, cy, r, c1, c2) => {
          const lGrad = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.2, cx, cy, r);
          lGrad.addColorStop(0, c1);
          lGrad.addColorStop(1, c2);
          ctx.fillStyle = lGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        };
        drawLeaf(treeBaseSx - 12, treeTopSy + 15, crownRadius * 0.85, "#4ade80", "#15803d");
        drawLeaf(treeBaseSx + 18, treeTopSy + 10, crownRadius * 0.9, "#22c55e", "#166534");
        drawLeaf(treeBaseSx, treeTopSy, crownRadius, "#86efac", "#16a34a");

        // MAYMUN (MONKEY)
        const monSx = toScreenX(state.monkey.x);
        const monSy = toScreenY(state.monkey.y);
        const monSize = Math.max(14, toScreenDist(2.2));

        // Maymun Zemin Düşüş Gölgesi
        if (state.monkey.falling) {
          const shadowScale = Math.max(0.2, 1 - state.monkey.y / monkeyY);
          ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + shadowScale * 0.15})`;
          ctx.beginPath();
          ctx.ellipse(monSx, groundY, monSize * shadowScale * 0.8, 4 * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.translate(monSx, monSy);
        if (state.bullet.hit) {
          ctx.rotate(0.12 * Math.sin(currentTime * 0.01));
        }

        // Gövde
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.ellipse(0, 0, monSize * 0.9, monSize * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Karın
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(0, monSize * 0.15, monSize * 0.5, monSize * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kafa
        const headY = -monSize * 0.9;
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.arc(0, headY, monSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Kulaklar
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.arc(-monSize * 0.65, headY - 2, monSize * 0.3, 0, Math.PI * 2);
        ctx.arc(monSize * 0.65, headY - 2, monSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Yüz & Gözler
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(-monSize * 0.22, headY - 2, monSize * 0.28, 0, Math.PI * 2);
        ctx.arc(monSize * 0.22, headY - 2, monSize * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(-monSize * 0.2, headY - 2, monSize * 0.09, 0, Math.PI * 2);
        ctx.arc(monSize * 0.2, headY - 2, monSize * 0.09, 0, Math.PI * 2);
        ctx.fill();

        // Ağız
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (state.bullet.hit) {
          ctx.arc(0, headY + monSize * 0.15, monSize * 0.18, 0, Math.PI);
        } else if (state.monkey.falling) {
          ctx.arc(0, headY + monSize * 0.2, monSize * 0.1, 0, Math.PI * 2);
        } else {
          ctx.arc(0, headY + monSize * 0.18, monSize * 0.14, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();

        // Kollar
        ctx.strokeStyle = "#854d0e";
        ctx.lineWidth = Math.max(3, monSize * 0.22);
        ctx.lineCap = "round";
        if (!state.monkey.falling) {
          ctx.beginPath();
          ctx.moveTo(-monSize * 0.6, 0);
          ctx.lineTo(-monSize * 0.8, -monSize * 1.3);
          ctx.moveTo(monSize * 0.6, 0);
          ctx.lineTo(monSize * 0.8, -monSize * 1.3);
          ctx.stroke();
        } else {
          const armWave = Math.sin(currentTime * 0.02) * monSize * 0.3;
          ctx.beginPath();
          ctx.moveTo(-monSize * 0.6, -monSize * 0.2);
          ctx.lineTo(-monSize * 1.1, -monSize * 0.3 + armWave);
          ctx.moveTo(monSize * 0.6, -monSize * 0.2);
          ctx.lineTo(monSize * 1.1, -monSize * 0.3 - armWave);
          ctx.stroke();
        }
        ctx.restore();

        // AVCI (HUNTER)
        const avciSx = toScreenX(hunterX);
        const avciSize = Math.max(14, toScreenDist(2.4));

        // Avcı Zemin Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.ellipse(avciSx, groundY, avciSize * 0.9, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(avciSx - 6, groundY);

        // Pantolon
        ctx.fillStyle = "#334155";
        ctx.fillRect(-avciSize * 0.45, -avciSize * 0.9, avciSize * 0.35, avciSize * 0.9);
        ctx.fillRect(avciSize * 0.1, -avciSize * 0.9, avciSize * 0.35, avciSize * 0.9);

        // Yelek / Gövde (Indigo / Cyan 3D Tech Suit)
        ctx.fillStyle = "#4f46e5";
        ctx.beginPath();
        ctx.roundRect(-avciSize * 0.5, -avciSize * 1.8, avciSize * 1.0, avciSize * 0.95, 4);
        ctx.fill();

        // Kafa & Safari Şapkası
        const avciHeadY = -avciSize * 2.2;
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, avciHeadY, avciSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-avciSize * 0.2, avciHeadY - avciSize * 0.1, avciSize * 0.45, avciSize * 0.16);

        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(0, avciHeadY - avciSize * 0.3, avciSize * 0.75, avciSize * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // FIRLATICI NAMLU
        const curAngle = calculateAimAngle();
        const gunLength = Math.max(22, toScreenDist(3.2));

        ctx.save();
        ctx.translate(hSx, hSy);
        ctx.rotate(-curAngle);

        const gunGrad = ctx.createLinearGradient(0, -3, gunLength, 3);
        gunGrad.addColorStop(0, "#1e293b");
        gunGrad.addColorStop(0.6, "#0284c7");
        gunGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = gunGrad;
        ctx.fillRect(0, -3.5, gunLength, 7);

        // Lazer/Dürbün
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(6, -8, 12, 4);

        if (state.flashIntensity > 0) {
          ctx.fillStyle = `rgba(251, 191, 36, ${state.flashIntensity})`;
          ctx.beginPath();
          ctx.arc(gunLength + 6, 0, 12 * state.flashIntensity, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // MERMİ / MUZ
        if (state.bullet.active && !state.bullet.hit && state.bullet.y > 0) {
          const bSx = toScreenX(state.bullet.x);
          const bSy = toScreenY(state.bullet.y);
          const flightAngle = Math.atan2(-state.bullet.vy, state.bullet.vx);

          ctx.save();
          ctx.translate(bSx, bSy);
          ctx.rotate(flightAngle);

          if (projectileType === "banana") {
            ctx.fillStyle = "#facc15";
            ctx.strokeStyle = "#ca8a04";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 4.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-8, -4);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-8, 4);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Parçacıklar
        state.particles.forEach((p) => {
          const pSx = toScreenX(p.x);
          const pSy = toScreenY(p.y);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(pSx, pSy, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });

        // Şok Dalgası
        if (state.impactRing) {
          const rSx = toScreenX(state.impactRing.x);
          const rSy = toScreenY(state.impactRing.y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${state.impactRing.alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(rSx, rSy, state.impactRing.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    hunterX,
    hunterY,
    monkeyX,
    monkeyY,
    muzzleVelocity,
    gravity,
    monkeyDropDelay,
    aimAngle,
    isAutoAim,
    projectileType,
    showSightline,
    showTrails,
    showDeltaH,
    showGrid,
    timeScale,
    viewMode,
    isPlaying,
    calculateAimAngle,
    triggerHit,
    triggerMiss,
    onStatsUpdate,
  ]);

  // Durum rozeti metni ve stili
  const getStatusBadge = () => {
    switch (simState) {
      case "flying":
        return { text: "Uçuş Sürüyor...", color: "bg-sky-600 text-white animate-pulse" };
      case "hit":
        return { text: "🎯 MÜKEMMEL İSABET!", color: "bg-emerald-600 text-white font-bold" };
      case "miss_ground":
        return { text: "⚠️ Mermi Yere Erken Düştü!", color: "bg-amber-600 text-white" };
      case "miss_past":
        return { text: "❌ Iska (Hedefi Aştı)", color: "bg-rose-600 text-white" };
      default:
        return { text: "Ateşe Hazır", color: "bg-slate-200 text-slate-700" };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="relative w-full panel-3d rounded-3xl overflow-hidden flex flex-col">
      {/* 3D Kokpit Üst Barı */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-100 via-white to-slate-100 border-b-2 border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-game tracking-wide shadow-xs ${status.color}`}>
            {status.text}
          </span>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Ağaç Mesafesi: <strong className="text-slate-800 font-mono">{monkeyX - hunterX}m</strong> | Yükseklik:{" "}
            <strong className="text-slate-800 font-mono">{monkeyY}m</strong>
          </span>
        </div>

        {/* 3D Aksiyon Butonları */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 btn-3d-white text-slate-700 rounded-xl text-xs font-bold font-game"
          >
            <IconRotateClockwise size={15} />
            <span>Sıfırla</span>
          </button>

          <button
            onClick={handleFire}
            disabled={simState === "flying"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black font-game tracking-wider text-white shadow-md transition-all ${
              simState === "flying"
                ? "bg-slate-400 cursor-not-allowed opacity-70"
                : "btn-3d-emerald cursor-pointer"
            }`}
          >
            <IconPlayerPlayFilled size={16} />
            <span>ATEŞ ET!</span>
          </button>
        </div>
      </div>

      {/* Ana Çizim Canvas Alanı */}
      <div className="relative w-full h-[420px] sm:h-[490px] lg:h-[550px] bg-slate-900">
        <canvas
          ref={canvasRef}
          width={1020}
          height={550}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Teori Doğrulandı Pop-up */}
        {simState === "hit" && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-emerald-500 shadow-xl text-center pointer-events-none animate-bounce">
            <p className="text-emerald-700 font-game font-black text-sm sm:text-base">
              🎉 Teori Kusursuz Doğrulandı!
            </p>
            <p className="text-slate-600 text-xs">
              Merminin düşüş sapması = Maymunun düşüş mesafesi = <strong className="text-emerald-800">½ g t²</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

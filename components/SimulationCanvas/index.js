"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { soundFX } from "../../utils/soundEffects";
import {
  IconPlayerPlayFilled,
  IconRotateClockwise
} from "@tabler/icons-react";

function SimulationCanvasComponent({
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
    lastStatsTime: 0,
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

  // Manuel Sıfırlama Butonu (Sadece kullanıcı butona bastığında çağrılır, useEffect içinde DEĞİL!)
  const resetSimulation = useCallback(() => {
    const angle = calculateAimAngle();
    const vx = muzzleVelocity * Math.cos(angle);
    const vy = muzzleVelocity * Math.sin(angle);

    stateRef.current = {
      simTime: 0,
      lastStatsTime: 0,
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
  }, [hunterX, hunterY, monkeyX, monkeyY, muzzleVelocity, calculateAimAngle, onStatusChange]);

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

      // Idle iken pozisyonları doğrudan ref'e senkronize et (Re-render cascade olmadan!)
      if (!isPlaying) {
        state.monkey.x = monkeyX;
        state.monkey.y = monkeyY;
        state.monkey.initialY = monkeyY;
        state.bullet.x = hunterX;
        state.bullet.y = hunterY;
      }

      // FİZİK GÜNCELLEMESİ
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

        // Telemetri Güncellemesi (60ms Throttle ile React render yükünü sıfırlar)
        if (currentTime - state.lastStatsTime > 60) {
          state.lastStatsTime = currentTime;
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

      // ÇİZİM
      ctx.clearRect(0, 0, width, height);

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

      // Gökyüzü
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#e0f2fe");
      skyGrad.addColorStop(0.35, "#f0f9ff");
      skyGrad.addColorStop(0.7, "#f8fafc");
      skyGrad.addColorStop(1, "#e2e8f0");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

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

      // Zemin
      const groundY = toScreenY(0);
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
      groundGrad.addColorStop(0, "#22c55e");
      groundGrad.addColorStop(0.08, "#16a34a");
      groundGrad.addColorStop(0.18, "#78350f");
      groundGrad.addColorStop(1, "#451a03");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

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

      // Mermi İzi
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

      // AĞAÇ
      const treeBaseSx = toScreenX(monkeyX + 2.5);
      const treeTopSy = toScreenY(monkeyY + 12);
      const treeTrunkWidth = Math.max(16, toScreenDist(2.2));
      const treeBranchY = toScreenY(monkeyY + 2.5);

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

      // Taç
      const crownRadius = Math.max(30, toScreenDist(6.5));
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(treeBaseSx, treeTopSy, crownRadius, 0, Math.PI * 2);
      ctx.fill();

      // MAYMUN
      const monSx = toScreenX(state.monkey.x);
      const monSy = toScreenY(state.monkey.y);
      const monSize = Math.max(14, toScreenDist(2.2));

      ctx.save();
      ctx.translate(monSx, monSy);
      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      ctx.ellipse(0, 0, monSize * 0.9, monSize * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.ellipse(0, monSize * 0.15, monSize * 0.5, monSize * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      ctx.arc(0, -monSize * 0.9, monSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // AVCI
      const avciSx = toScreenX(hunterX);
      const avciSize = Math.max(14, toScreenDist(2.4));

      ctx.save();
      ctx.translate(avciSx - 6, groundY);
      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.roundRect(-avciSize * 0.5, -avciSize * 1.8, avciSize * 1.0, avciSize * 0.95, 4);
      ctx.fill();
      ctx.restore();

      // NAMLU
      const curAngle = calculateAimAngle();
      const gunLength = Math.max(22, toScreenDist(3.2));

      ctx.save();
      ctx.translate(hSx, hSy);
      ctx.rotate(-curAngle);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(0, -3.5, gunLength, 7);
      ctx.restore();

      // MERMİ
      if (state.bullet.active && !state.bullet.hit && state.bullet.y > 0) {
        const bSx = toScreenX(state.bullet.x);
        const bSy = toScreenY(state.bullet.y);
        ctx.fillStyle = projectileType === "banana" ? "#facc15" : "#0284c7";
        ctx.beginPath();
        ctx.arc(bSx, bSy, 6, 0, Math.PI * 2);
        ctx.fill();
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
    showGrid,
    timeScale,
    isPlaying,
    calculateAimAngle,
    triggerHit,
    triggerMiss,
    onStatsUpdate,
  ]);

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

      <div className="relative w-full h-[420px] sm:h-[490px] lg:h-[550px] bg-slate-900">
        <canvas
          ref={canvasRef}
          width={1020}
          height={550}
          className="w-full h-full block cursor-crosshair"
        />

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

const SimulationCanvas = React.memo(SimulationCanvasComponent);
export default SimulationCanvas;

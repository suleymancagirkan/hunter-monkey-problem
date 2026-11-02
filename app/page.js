"use client";

import React, { useState, useCallback } from "react";
import Header from "../components/Header";
import Simulation3D from "../components/Simulation3D";
import SimulationCanvas from "../components/SimulationCanvas";
import ControlPanel from "../components/ControlPanel";
import PhysicsStats from "../components/PhysicsStats";
import TheoryExplainer from "../components/TheoryExplainer";

export default function Home() {
  // 3D vs 2D Görünüm Modu ('3d' | '2d')
  const [dimensionMode, setDimensionMode] = useState("3d");
  const [soundMuted, setSoundMuted] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  // Fiziksel Ortam Değişkenleri
  const [hunterDistance, setHunterDistance] = useState(50); // metre
  const [treeHeight, setTreeHeight] = useState(30);         // metre
  const [muzzleVelocity, setMuzzleVelocity] = useState(38); // m/s
  const [gravity, setGravity] = useState(9.8);              // m/s^2
  const [monkeyDropDelay, setMonkeyDropDelay] = useState(0.0); // saniye

  // Nişan & Mühimmat Ayarları
  const [isAutoAim, setIsAutoAim] = useState(true);
  const [manualAngle, setManualAngle] = useState(30.0);
  const [projectileType, setProjectileType] = useState("banana");
  const [timeScale, setTimeScale] = useState(1.0);

  // Görsel Kılavuzlar
  const [showSightline, setShowSightline] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showDeltaH, setShowDeltaH] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Canlı Telemetri İstatistikleri
  const [stats, setStats] = useState({
    simTime: "0.00",
    bulletX: "0.0",
    bulletY: "2.0",
    bulletSpeed: "38.0",
    monkeyY: "30.0",
    deltaH: "0.00",
    distToMonkey: "50.0",
    angleDeg: "29.2",
  });

  // Sabit useCallback ile telemetri güncellemesi (Render döngüsü kaskadını önler)
  const handleStatsUpdate = useCallback((newStats) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  // Varsayılan değerlere sıfırlama
  const handleResetDefaults = () => {
    setHunterDistance(50);
    setTreeHeight(30);
    setMuzzleVelocity(38);
    setGravity(9.8);
    setMonkeyDropDelay(0.0);
    setIsAutoAim(true);
    setManualAngle(30.0);
    setProjectileType("banana");
    setTimeScale(1.0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 3D Üst Navigasyon & Mod Seçici */}
      <Header
        dimensionMode={dimensionMode}
        setDimensionMode={setDimensionMode}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        onReset={handleResetDefaults}
        onOpenExplainer={() => setIsExplainerOpen(true)}
      />

      {/* 
        SPLIT-SCREEN DASHBOARD:
        Sol Taraf: 3D FPS Sahnesi (Sabit / Sticky) - Yürü, butona bas, canlı izle
        Sağ Taraf: 3D Kokpit Kontrolleri ve Canlı Fizik Telemetrisi
      */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-5 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* SOL SÜTUN (7 Kolon): Sticky 3D / 2.5D Sahne */}
          <div className="xl:col-span-7 xl:sticky xl:top-[68px] z-20 space-y-3">
            <div key={dimensionMode} className="animate-dimension-enter">
              {dimensionMode === "3d" ? (
                <Simulation3D
                  hunterDistance={hunterDistance}
                  treeHeight={treeHeight}
                  muzzleVelocity={muzzleVelocity}
                  gravity={gravity}
                  monkeyDropDelay={monkeyDropDelay}
                  aimAngle={isAutoAim ? null : manualAngle}
                  manualAngle={manualAngle}
                  isAutoAim={isAutoAim}
                  projectileType={projectileType}
                  timeScale={timeScale}
                  onStatsUpdate={handleStatsUpdate}
                  setHunterDistance={setHunterDistance}
                  setTreeHeight={setTreeHeight}
                  setMuzzleVelocity={setMuzzleVelocity}
                  setGravity={setGravity}
                  setMonkeyDropDelay={setMonkeyDropDelay}
                  setIsAutoAim={setIsAutoAim}
                  setManualAngle={setManualAngle}
                  setProjectileType={setProjectileType}
                  setTimeScale={setTimeScale}
                />
              ) : (
                <SimulationCanvas
                  hunterX={10}
                  hunterY={2}
                  monkeyX={10 + hunterDistance}
                  monkeyY={treeHeight}
                  muzzleVelocity={muzzleVelocity}
                  gravity={gravity}
                  monkeyDropDelay={monkeyDropDelay}
                  aimAngle={isAutoAim ? null : manualAngle}
                  isAutoAim={isAutoAim}
                  projectileType={projectileType}
                  showSightline={showSightline}
                  showTrails={showTrails}
                  showDeltaH={showDeltaH}
                  showGrid={showGrid}
                  timeScale={timeScale}
                  onStatsUpdate={handleStatsUpdate}
                />
              )}
            </div>

            {/* Sahne Altı Bilgi Şeridi */}
            <div className="hidden xl:flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 text-xs text-slate-600 font-semibold shadow-2xs">
              <span className="flex items-center gap-2">
                <span className="led-indicator text-emerald-500" />
                <span>3D Canlı FPS Senkronizasyonu Aktif</span>
              </span>
              <span className="text-slate-500">
                WASD ile kaideye yürüyün, <strong className="text-emerald-700">[E]</strong> veya butona basarak ateşleyin!
              </span>
            </div>
          </div>

          {/* SAĞ SÜTUN (5 Kolon): Kontrol Paneli & Telemetri */}
          <div className="xl:col-span-5 space-y-5">
            {/* 3D Dijital Telemetri Göstergesi */}
            <PhysicsStats
              stats={stats}
              muzzleVelocity={muzzleVelocity}
              gravity={gravity}
              hunterDistance={hunterDistance}
              treeHeight={treeHeight}
            />

            {/* 3D Slider Kokpit Paneli */}
            <ControlPanel
              hunterDistance={hunterDistance}
              setHunterDistance={setHunterDistance}
              treeHeight={treeHeight}
              setTreeHeight={setTreeHeight}
              muzzleVelocity={muzzleVelocity}
              setMuzzleVelocity={setMuzzleVelocity}
              gravity={gravity}
              setGravity={setGravity}
              monkeyDropDelay={monkeyDropDelay}
              setMonkeyDropDelay={setMonkeyDropDelay}
              isAutoAim={isAutoAim}
              setIsAutoAim={setIsAutoAim}
              manualAngle={manualAngle}
              setManualAngle={setManualAngle}
              projectileType={projectileType}
              setProjectileType={setProjectileType}
              timeScale={timeScale}
              setTimeScale={setTimeScale}
              showSightline={showSightline}
              setShowSightline={setShowSightline}
              showTrails={showTrails}
              setShowTrails={setShowTrails}
              showDeltaH={showDeltaH}
              setShowDeltaH={setShowDeltaH}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
              onResetDefaults={handleResetDefaults}
            />
          </div>

        </div>
      </main>

      {/* Fizik Teori Açıklama Modalı */}
      <TheoryExplainer
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-slate-200 bg-white/90 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold">
            🎯 Avcı & Maymun Fizik Problemi — 3D Etkileşimli FPS Simülasyonu
          </span>
          <span className="font-mono text-slate-400">
            Three.js WebGL • 3D Pedestal & Button • FPS Walk
          </span>
        </div>
      </footer>
    </div>
  );
}

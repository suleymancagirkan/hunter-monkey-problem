"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import SimulationCanvas from "../components/SimulationCanvas";
import ControlPanel from "../components/ControlPanel";
import PhysicsStats from "../components/PhysicsStats";
import TheoryExplainer from "../components/TheoryExplainer";

export default function Home() {
  // Kamera Görünüm Modu ('side': 2.5D Saha | 'scope': Avcının Gözünden Dürbün)
  const [viewMode, setViewMode] = useState("side");
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
    bulletX: "10.0",
    bulletY: "2.0",
    bulletSpeed: "38.0",
    monkeyY: "30.0",
    deltaH: "0.00",
    distToMonkey: "50.0",
    angleDeg: "29.2",
  });

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
    setViewMode("side");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 3D Üst Navigasyon & Kamera Kontrolü */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        onReset={handleResetDefaults}
        onOpenExplainer={() => setIsExplainerOpen(true)}
      />

      {/* 
        SPLIT-SCREEN KOKPİT DÜZENİ:
        Slider değiştirirken sahneden asla kopmama garantisi!
        Sol: Ekranda her an sabit (Sticky / Göz Önünde) Canlı 2.5D Sahne
        Sağ: Anlık Slider Kontrolleri ve Canlı Fizik Telemetrisi
      */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-5 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* SOL BÖLGE (xl: 7 Kolon): Sticky Canlı Sahne */}
          <div className="xl:col-span-7 xl:sticky xl:top-[68px] z-20 space-y-4">
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
              viewMode={viewMode}
              onStatsUpdate={setStats}
            />

            {/* Sahne Altı Hızlı Durum / Kılavuz İpucu Barı */}
            <div className="hidden xl:flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 text-xs text-slate-500 font-semibold shadow-2xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="led-indicator text-emerald-500" />
                <span>Canlı Sahne Senkronizasyonu Aktif</span>
              </span>
              <span>Sağdaki sliderları oynattığınızda ağaç ve nişan anında güncellenir.</span>
            </div>
          </div>

          {/* SAĞ BÖLGE (xl: 5 Kolon): Kontrol Konsolu & Telemetri */}
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
            🎯 Avcı & Maymun Fizik Problemi — İnteraktif Mekanik Laboratuvarı
          </span>
          <span className="font-mono text-slate-400">
            Split-Dashboard Viewport • Canlı Senkronizasyon
          </span>
        </div>
      </footer>
    </div>
  );
}

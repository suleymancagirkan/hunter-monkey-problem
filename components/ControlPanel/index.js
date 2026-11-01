"use client";

import React from "react";
import {
  IconGauge,
  IconRuler2,
  IconArrowUpRight,
  IconPlanet,
  IconClockPlay,
  IconCrosshair,
  IconLayersLinked,
  IconAdjustmentsHorizontal,
  IconRocket,
  IconRefresh,
  IconCpu
} from "@tabler/icons-react";
import { soundFX } from "../../utils/soundEffects";

export default function ControlPanel({
  hunterDistance,
  setHunterDistance,
  treeHeight,
  setTreeHeight,
  muzzleVelocity,
  setMuzzleVelocity,
  gravity,
  setGravity,
  monkeyDropDelay,
  setMonkeyDropDelay,
  isAutoAim,
  setIsAutoAim,
  manualAngle,
  setManualAngle,
  projectileType,
  setProjectileType,
  timeScale,
  setTimeScale,
  showSightline,
  setShowSightline,
  showTrails,
  setShowTrails,
  showDeltaH,
  setShowDeltaH,
  showGrid,
  setShowGrid,
  onResetDefaults,
}) {
  const gravityPresets = [
    { name: "Dünya", val: 9.8, icon: "🌍", color: "from-blue-600 to-indigo-600" },
    { name: "Ay", val: 1.6, icon: "🌕", color: "from-slate-600 to-slate-800" },
    { name: "Mars", val: 3.7, icon: "🪐", color: "from-amber-600 to-rose-700" },
    { name: "Jüpiter", val: 24.8, icon: "⚡", color: "from-purple-600 to-indigo-800" },
    { name: "Sıfır G", val: 0.0, icon: "🌌", color: "from-cyan-600 to-blue-700" },
  ];

  return (
    <div className="panel-3d rounded-3xl p-5 sm:p-7 space-y-6 bg-slate-50/60">
      {/* 3D Kokpit Başlığı */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-indigo-700">
              <IconCpu size={22} stroke={2.4} />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black font-game text-slate-900 tracking-wide">
              Fizik Laboratuvarı Kontrol Konsolu
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ortam parametrelerini canlı ayarlayın, eşzamanlı düşüşü test edin
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            onResetDefaults();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 btn-3d-white text-xs font-bold font-game text-slate-700 rounded-xl"
        >
          <IconRefresh size={15} />
          <span>Fabrika Ayarları</span>
        </button>
      </div>

      {/* 3D SLIDER KOKPİT KARTLARI (İlgi Çekici Tasarım) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KART 1: Fırlatma Sistemi (v0) */}
        <div className="relative rounded-2xl p-4 bg-white border border-sky-200 border-b-4 border-b-sky-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-black font-game text-sky-950 uppercase tracking-wider">
              <IconGauge size={18} className="text-sky-600" />
              <span>Namlu Hızı (v₀)</span>
            </span>
            {/* LCD Sayacı */}
            <div className="lcd-screen px-3 py-1 rounded-lg text-sky-400 font-mono text-sm font-bold tracking-widest">
              {muzzleVelocity} <span className="text-[10px] text-sky-600">m/s</span>
            </div>
          </div>

          <div className="py-2">
            <input
              type="range"
              min={15}
              max={100}
              step={1}
              value={muzzleVelocity}
              onChange={(e) => setMuzzleVelocity(Number(e.target.value))}
              className="w-full slider-3d"
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
            <span>15 m/s (Yavaş)</span>
            <span>50 m/s</span>
            <span>100 m/s (Maks)</span>
          </div>
        </div>

        {/* KART 2: Avcı - Ağaç Mesafesi */}
        <div className="relative rounded-2xl p-4 bg-white border border-indigo-200 border-b-4 border-b-indigo-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-black font-game text-indigo-950 uppercase tracking-wider">
              <IconRuler2 size={18} className="text-indigo-600" />
              <span>Ağaç Mesafesi (x)</span>
            </span>
            <div className="lcd-screen px-3 py-1 rounded-lg text-indigo-400 font-mono text-sm font-bold tracking-widest">
              {hunterDistance} <span className="text-[10px] text-indigo-600">m</span>
            </div>
          </div>

          <div className="py-2">
            <input
              type="range"
              min={20}
              max={85}
              step={1}
              value={hunterDistance}
              onChange={(e) => setHunterDistance(Number(e.target.value))}
              className="w-full slider-3d"
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
            <span>20 m (Yakın)</span>
            <span>50 m</span>
            <span>85 m (Uzak)</span>
          </div>
        </div>

        {/* KART 3: Maymun Yüksekliği */}
        <div className="relative rounded-2xl p-4 bg-white border border-amber-200 border-b-4 border-b-amber-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-black font-game text-amber-950 uppercase tracking-wider">
              <IconArrowUpRight size={18} className="text-amber-600" />
              <span>Ağaç Yüksekliği (h)</span>
            </span>
            <div className="lcd-screen px-3 py-1 rounded-lg text-amber-400 font-mono text-sm font-bold tracking-widest">
              {treeHeight} <span className="text-[10px] text-amber-600">m</span>
            </div>
          </div>

          <div className="py-2">
            <input
              type="range"
              min={10}
              max={45}
              step={1}
              value={treeHeight}
              onChange={(e) => setTreeHeight(Number(e.target.value))}
              className="w-full slider-3d"
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
            <span>10 m (Alçak)</span>
            <span>25 m</span>
            <span>45 m (Yüksek)</span>
          </div>
        </div>
      </div>

      {/* İKİNCİ SIRA: YERÇEKİMİ VE TEPKİ GECİKMESİ KONSOLU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Yerçekimi Konsolu (Emerald / Tepe Gezegen Seçici) */}
        <div className="rounded-2xl p-5 bg-white border border-emerald-200 border-b-4 border-b-emerald-400 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black font-game text-emerald-950 uppercase tracking-wider">
              <IconPlanet size={18} className="text-emerald-600" />
              <span>Yerçekimi İvmesi (g)</span>
            </span>
            <div className="lcd-screen px-3 py-1 rounded-lg text-emerald-400 font-mono text-sm font-bold">
              {gravity} <span className="text-[10px] text-emerald-600">m/s²</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={25}
            step={0.1}
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className="w-full slider-3d"
          />

          {/* 3D Gezegen Butonları */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {gravityPresets.map((planet) => (
              <button
                key={planet.name}
                onClick={() => {
                  soundFX.playClick();
                  setGravity(planet.val);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
                  gravity === planet.val
                    ? "btn-3d-emerald text-white scale-102"
                    : "btn-3d-white text-slate-700"
                }`}
              >
                <span>{planet.icon}</span>
                <span>{planet.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Maymun Düşüş Zamanlaması (Coral / Rose Gösterge) */}
        <div className="rounded-2xl p-5 bg-white border border-rose-200 border-b-4 border-b-rose-400 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black font-game text-rose-950 uppercase tracking-wider">
              <IconClockPlay size={18} className="text-rose-600" />
              <span>Maymun Tepki Gecikmesi (Δt)</span>
            </span>
            <div className="lcd-screen px-3 py-1 rounded-lg text-rose-400 font-mono text-sm font-bold">
              {monkeyDropDelay === 0 ? "0.00s (Klasik)" : `${monkeyDropDelay > 0 ? "+" : ""}${monkeyDropDelay.toFixed(2)}s`}
            </div>
          </div>

          <input
            type="range"
            min={-0.4}
            max={0.8}
            step={0.05}
            value={monkeyDropDelay}
            onChange={(e) => setMonkeyDropDelay(Number(e.target.value))}
            className="w-full slider-3d"
          />

          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>-0.4s (Erken Düşüş)</span>
            <span className="text-emerald-700 font-bold">0.0s (Tam Eşzamanlı)</span>
            <span>+0.8s (Tembel Maymun)</span>
          </div>
        </div>
      </div>

      {/* ÜÇÜNCÜ SIRA: NİŞAN ALMA, MÜHİMMAT & AĞIR ÇEKİM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t-2 border-slate-200">
        {/* Nişan Alma Tercihi */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
          <label className="text-xs font-black font-game uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <IconCrosshair size={17} className="text-indigo-600" />
            <span>Nişan Alma Yöntemi</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsAutoAim(true);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-game transition-all ${
                isAutoAim ? "btn-3d-blue text-white" : "btn-3d-white text-slate-600"
              }`}
            >
              Otomatik Hedef
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setIsAutoAim(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-game transition-all ${
                !isAutoAim ? "btn-3d-blue text-white" : "btn-3d-white text-slate-600"
              }`}
            >
              Manuel Açı
            </button>
          </div>

          {!isAutoAim && (
            <div className="pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Namlu Açısı:</span>
                <span className="font-mono text-indigo-700">{manualAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={0.5}
                value={manualAngle}
                onChange={(e) => setManualAngle(Number(e.target.value))}
                className="w-full slider-3d"
              />
            </div>
          )}
        </div>

        {/* Mühimmat Seçimi */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
          <label className="text-xs font-black font-game uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <IconRocket size={17} className="text-amber-500" />
            <span>Mühimmat Seçimi</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setProjectileType("banana");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-game transition-all ${
                projectileType === "banana" ? "btn-3d-amber text-amber-950" : "btn-3d-white text-slate-600"
              }`}
            >
              🍌 Muz Fırlatıcı
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setProjectileType("dart");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-game transition-all ${
                projectileType === "dart" ? "btn-3d-blue text-white" : "btn-3d-white text-slate-600"
              }`}
            >
              🎯 Dart Oku
            </button>
          </div>
        </div>

        {/* Ağır Çekim (Slow-Motion) */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
          <label className="text-xs font-black font-game uppercase tracking-wider text-slate-800">
            Simülasyon Hızı:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.15, 0.35, 0.65, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  soundFX.playClick();
                  setTimeScale(rate);
                }}
                className={`py-2 rounded-xl text-xs font-black font-mono transition-all ${
                  timeScale === rate ? "btn-3d-emerald text-white" : "btn-3d-white text-slate-600"
                }`}
              >
                {rate === 1.0 ? "1x" : `${rate}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DÖRDÜNCÜ SIRA: GÖRSEL KILAVUZ BUTONLARI (3D Tactile Switches) */}
      <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-black font-game text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <IconLayersLinked size={16} />
          <span>Görsel Kılavuz Katmanları:</span>
        </span>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowSightline(!showSightline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              showSightline ? "btn-3d-blue text-white" : "btn-3d-white text-slate-400"
            }`}
          >
            <span className={`led-indicator ${showSightline ? "text-cyan-300" : "text-slate-300"}`} />
            <span>Nişan Doğrultusu</span>
          </button>

          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              showTrails ? "btn-3d-blue text-white" : "btn-3d-white text-slate-400"
            }`}
          >
            <span className={`led-indicator ${showTrails ? "text-cyan-300" : "text-slate-300"}`} />
            <span>Yörünge İzi</span>
          </button>

          <button
            onClick={() => setShowDeltaH(!showDeltaH)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              showDeltaH ? "btn-3d-blue text-white" : "btn-3d-white text-slate-400"
            }`}
          >
            <span className={`led-indicator ${showDeltaH ? "text-cyan-300" : "text-slate-300"}`} />
            <span>Δh Düşüş Okları</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              showGrid ? "btn-3d-blue text-white" : "btn-3d-white text-slate-400"
            }`}
          >
            <span className={`led-indicator ${showGrid ? "text-cyan-300" : "text-slate-300"}`} />
            <span>Metre Grid Cetveli</span>
          </button>
        </div>
      </div>
    </div>
  );
}

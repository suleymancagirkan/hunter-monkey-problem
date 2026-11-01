"use client";

import React from "react";
import {
  IconTargetArrow,
  IconVolume,
  IconVolumeOff,
  IconBulb,
  IconRotateClockwise,
  IconCamera,
  IconCrosshair,
  IconCube3dSphere
} from "@tabler/icons-react";
import { soundFX } from "../../utils/soundEffects";

export default function Header({
  viewMode,
  setViewMode,
  soundMuted,
  setSoundMuted,
  onReset,
  onOpenExplainer,
}) {
  const handleSoundToggle = () => {
    const isEnabled = soundFX.toggle();
    setSoundMuted(!isEnabled);
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & 3D Rozet Başlık */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center text-indigo-600">
              <IconTargetArrow size={28} stroke={2.4} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-game tracking-wide bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-700 bg-clip-text text-transparent">
                Avcı & Maymun Simülatörü
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                2.5D FİZİK LAB
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Klasik Mekanik: Eşzamanlı Serbest Düşme ve Eğik Atış Deneyi
            </p>
          </div>
        </div>

        {/* 3D Kamera Perspektifi Seçici (Gelecek 3D güncellemesi zemini) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          {/* Taktik 2.5D Saha Kamerası */}
          <button
            onClick={() => {
              soundFX.playClick();
              setViewMode("side");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-game transition-all ${
              viewMode === "side"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200 scale-102"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconCamera size={16} />
            <span>2.5D Saha Kamerası</span>
          </button>

          {/* Avcının Gözünden Dürbün Kamerası */}
          <button
            onClick={() => {
              soundFX.playClick();
              setViewMode("scope");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-game transition-all ${
              viewMode === "scope"
                ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md scale-102"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            <IconCrosshair size={16} />
            <span>Avcının Gözünden (Dürbün)</span>
          </button>

          {/* 3D Gezinti Bildirimi */}
          <div
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 cursor-not-allowed select-none opacity-80"
            title="Gelecek güncellemede tam 3D FPS serbest gezinti eklenecektir"
          >
            <IconCube3dSphere size={15} />
            <span>3D Gezinti (Pek Yakında)</span>
          </div>
        </div>

        {/* Aksiyon Butonları (3D Kabartmalı) */}
        <div className="flex items-center gap-2.5">
          {/* Teori Butonu */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenExplainer();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 btn-3d-white text-slate-700 rounded-xl text-xs sm:text-sm font-bold font-game"
            title="Fiziksel Teori ve Formüller"
          >
            <IconBulb size={17} className="text-amber-500" />
            <span className="hidden sm:inline">Teorik İspat</span>
          </button>

          {/* Sıfırla Butonu */}
          <button
            onClick={() => {
              soundFX.playClick();
              onReset();
            }}
            className="p-2 btn-3d-white text-slate-700 rounded-xl"
            title="Simülasyonu Sıfırla"
          >
            <IconRotateClockwise size={18} />
          </button>

          {/* Ses Aç / Kapa */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-xl transition-all ${
              soundMuted
                ? "bg-slate-200 text-slate-400 border border-slate-300"
                : "btn-3d-white text-indigo-600"
            }`}
            title={soundMuted ? "Sesi Aç" : "Sesi Kapat"}
          >
            {soundMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

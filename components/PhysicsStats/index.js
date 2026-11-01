"use client";

import React from "react";
import {
  IconActivity,
  IconClock,
  IconArrowBadgeDown,
  IconTarget,
  IconMathFunction,
  IconCheck,
  IconInfoCircle
} from "@tabler/icons-react";

export default function PhysicsStats({ stats, muzzleVelocity, gravity, hunterDistance, treeHeight }) {
  const dx = hunterDistance;
  const dy = treeHeight - 2;
  const thetaRad = Math.atan2(dy, dx);
  const thetaDeg = ((thetaRad * 180) / Math.PI).toFixed(1);

  const theoreticalTimeOfImpact = dx / (muzzleVelocity * Math.cos(thetaRad));
  const theoreticalDropAtImpact = 0.5 * gravity * Math.pow(theoreticalTimeOfImpact, 2);
  const theoreticalCollisionY = treeHeight - theoreticalDropAtImpact;
  const willHitBeforeGround = theoreticalCollisionY > 0;

  return (
    <div className="panel-3d rounded-3xl p-5 sm:p-6 space-y-4 bg-slate-50/60">
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <IconActivity size={18} />
          </div>
          <h3 className="font-game font-black text-slate-900 text-sm sm:text-base tracking-wide">
            Canlı Telemetri & Fizik Çözücü
          </h3>
        </div>
        <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
          REAL-TIME SOLVER
        </span>
      </div>

      {/* 3D Dijital Gösterge Kartları */}
      <div className="grid grid-cols-2 gap-3">
        {/* Simülasyon Süresi (t) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
            <IconClock size={15} className="text-sky-600" />
            <span>Geçen Süre (t)</span>
          </div>
          <div className="lcd-screen p-2 rounded-xl text-sky-400 font-mono text-lg font-black tracking-wider text-center">
            {stats?.simTime || "0.00"} <span className="text-xs text-sky-600">s</span>
          </div>
        </div>

        {/* Düşüş Mesafesi (Delta h) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
            <IconMathFunction size={15} className="text-indigo-600" />
            <span>Düşüş (½gt²)</span>
          </div>
          <div className="lcd-screen p-2 rounded-xl text-indigo-400 font-mono text-lg font-black tracking-wider text-center">
            {stats?.deltaH || "0.00"} <span className="text-xs text-indigo-600">m</span>
          </div>
        </div>

        {/* Mermi Konumu */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
            <IconTarget size={15} className="text-emerald-600" />
            <span>Mermi Konumu</span>
          </div>
          <div className="lcd-screen p-2 rounded-xl text-emerald-400 font-mono text-sm font-black tracking-wider text-center">
            ({stats?.bulletX || "0"}, {stats?.bulletY || "0"})
          </div>
        </div>

        {/* Maymun Yüksekliği */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
            <IconArrowBadgeDown size={15} className="text-amber-500" />
            <span>Maymun Y</span>
          </div>
          <div className="lcd-screen p-2 rounded-xl text-amber-400 font-mono text-lg font-black tracking-wider text-center">
            {stats?.monkeyY || treeHeight} <span className="text-xs text-amber-600">m</span>
          </div>
        </div>
      </div>

      {/* Teorik Tahmin Kartı */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-900 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-bold text-sky-300 flex items-center gap-1.5 font-game">
            <IconCheck size={16} className="text-emerald-400" />
            <span>Teorik Analiz</span>
          </span>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
            willHitBeforeGround ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
          }`}>
            {willHitBeforeGround ? "✓ Havadayken İsabet" : "✕ Yere Erken Çarpış"}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 font-medium">
          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400">Hedefleme Açısı:</span>
            <strong className="text-white font-mono">{thetaDeg}°</strong>
          </div>
          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400">Buluşma Anı (t*):</span>
            <strong className="text-sky-300 font-mono">{theoreticalTimeOfImpact.toFixed(2)} sn</strong>
          </div>
          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400">Çarpışma Yüksekliği:</span>
            <strong className="text-emerald-300 font-mono">{theoreticalCollisionY.toFixed(1)} m</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

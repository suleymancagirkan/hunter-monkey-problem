"use client";

import React from "react";
import {
  IconX,
  IconBulb,
  IconMath,
  IconChecklist,
  IconTargetArrow,
  IconFlame
} from "@tabler/icons-react";
import { soundFX } from "../../utils/soundEffects";

export default function TheoryExplainer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-blue-100 royal-shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Başlığı */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <IconBulb size={20} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-game font-bold text-lg">
                Fiziksel Sır: Avcı & Maymun Problemi
              </h3>
              <p className="text-xs text-blue-200">
                Serbest Düşme ve Eğik Atışın Eşzamanlı Hareketi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Modal İçerik */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Soru Kutusu */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4">
            <h4 className="font-bold font-game text-blue-900 text-base mb-1 flex items-center gap-2">
              <IconTargetArrow size={18} className="text-blue-600" />
              Paradoks: Neden Maymunun Üstüne Değil, Tam Üzerine Nişan Alınır?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merminin havada yerçekimi nedeniyle parabolik bir eğri çizerek aşağı düşeceğini bilen biri,
              hedefin biraz üstüne nişan alması gerektiğini düşünebilir. 
              <strong> Ancak maymun, merminin namludan çıktığı anda dalı bırakırsa bu kural tersine döner!</strong>
            </p>
          </div>

          {/* Matematiksel İspat Adımları */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase tracking-wider">
              <IconMath size={18} className="text-indigo-600" />
              Adım Adım Matematiksel İspat
            </h4>

            {/* Adım 1 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-blue-700 block text-xs mb-1 font-game">
                1. Merminin Hedefe Ulaşma Süresi (t*):
              </strong>
              <p className="text-xs text-slate-600">
                Avcı doğrudan ağaçtaki maymuna nişan aldığında açı: <br />
                <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-800 font-mono text-[11px]">
                  tan(θ) = h / d
                </code>
                <br />
                Merminin maymunun dikey hizasına (x = d) ulaşma süresi: <br />
                <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-800 font-mono text-[11px]">
                  t* = d / (v₀ · cos θ)
                </code>
              </p>
            </div>

            {/* Adım 2 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-blue-700 block text-xs mb-1 font-game">
                2. Her İki Cismin de Düşey Konumu:
              </strong>
              <p className="text-xs text-slate-600 space-y-1">
                <span>Merminin konumu: </span>
                <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-800 font-mono text-[11px]">
                  y_mermi = (v₀ · sin θ) · t* - ½ g (t*)² = h - ½ g (t*)²
                </code>
                <br />
                <span>Maymunun konumu: </span>
                <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-amber-800 font-mono text-[11px]">
                  y_maymun = h - ½ g (t*)²
                </code>
              </p>
            </div>

            {/* Sonuç Vurgusu */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-300 rounded-2xl p-4">
              <strong className="text-emerald-800 font-game block text-sm mb-1">
                🎯 Muazzam Sonuç: y_mermi = y_maymun
              </strong>
              <p className="text-xs text-slate-700 leading-relaxed">
                Yerçekimi hem mermiye hem de maymuna <strong>aynı ivmeyle (g)</strong> etki ettiği için,
                mermi ve maymun her an aynı düşey mesafede (<strong>½ g t²</strong>) aşağı düşer! 
                Bu nedenle fırlatma hızı ne olursa olsun (mermi yere çarpmadan maymunun çizgisine varırsa),
                <strong> mermi kesinlikle maymuna isabet eder!</strong>
              </p>
            </div>
          </div>

          {/* Simülasyonda Deneyebileceğiniz Şeyler */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              <IconChecklist size={16} className="text-indigo-600" />
              Laboratuvarda Neler Deneyebilirsiniz?
            </h5>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Farklı Namlu Hızları:</strong> Hızı 25 m/s veya 80 m/s yapın, ikisinde de vuruşun gerçekleştiğini ama yüksekliklerin farklı olduğunu görün.
              </li>
              <li>
                <strong>Sıfır Yerçekimi (g = 0):</strong> Merminin dümdüz gittiğini, maymunun ise havada asılı kaldığını gözlemleyin.
              </li>
              <li>
                <strong>Maymun Gecikmesi:</strong> Maymunun düşüşünü 0.2 saniye geciktirirseniz ne olur? Iska gerçekleşir!
              </li>
            </ul>
          </div>
        </div>

        {/* Kapat Butonu */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-game font-bold text-xs sm:text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all btn-game-press"
          >
            Anladım, Laboratuvara Dön!
          </button>
        </div>
      </div>
    </div>
  );
}


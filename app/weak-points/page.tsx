"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { slug: "life-planning", name: "ライフプランニングと資金計画", icon: "🏠" },
  { slug: "risk-management", name: "リスク管理", icon: "🛡️" },
  { slug: "financial-assets", name: "金融資産運用", icon: "📈" },
  { slug: "tax-planning", name: "タックスプランニング", icon: "🧾" },
  { slug: "real-estate", name: "不動産", icon: "🏢" },
  { slug: "inheritance", name: "相続・事業承継", icon: "📜" },
];

type Progress = Record<string, { correct: number; incorrect: number }>;

export default function WeakPointsPage() {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem("fp_progress") || "{}"));
    } catch {
      setProgress({});
    }
  }, []);

  const handleReset = () => {
    if (confirm("学習記録をリセットしますか？")) {
      localStorage.removeItem("fp_progress");
      setProgress({});
    }
  };

  const stats = CATEGORIES.map((cat) => {
    const p = progress[cat.slug] || { correct: 0, incorrect: 0 };
    const total = p.correct + p.incorrect;
    const rate = total > 0 ? Math.round((p.correct / total) * 100) : null;
    return { ...cat, correct: p.correct, incorrect: p.incorrect, total, rate };
  });

  const totalAnswered = stats.reduce((s, c) => s + c.total, 0);
  const totalCorrect = stats.reduce((s, c) => s + c.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">苦手分野チェック</h1>
          <p className="text-sm text-slate-500">分野別の正答率を確認して弱点を克服しよう</p>
        </div>
        {totalAnswered > 0 && (
          <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
            記録をリセット
          </button>
        )}
      </div>

      {/* 全体サマリー */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm text-center">
        {overallRate !== null ? (
          <>
            <div className="text-4xl font-bold text-blue-600 mb-1">{overallRate}%</div>
            <div className="text-slate-500 text-sm mb-2">総合正答率</div>
            <div className="text-xs text-slate-400">{totalAnswered}問中 {totalCorrect}問正解</div>
          </>
        ) : (
          <div className="text-slate-400 text-sm py-2">まだ問題を解いていません</div>
        )}
      </div>

      {/* 分野別 */}
      <div className="flex flex-col gap-3">
        {stats
          .sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101))
          .map((cat) => {
            const rateColor =
              cat.rate === null ? "text-slate-400" :
              cat.rate >= 80 ? "text-green-600" :
              cat.rate >= 60 ? "text-yellow-600" : "text-red-500";
            const barColor =
              cat.rate === null ? "bg-slate-200" :
              cat.rate >= 80 ? "bg-green-500" :
              cat.rate >= 60 ? "bg-yellow-400" : "bg-red-400";

            return (
              <div key={cat.slug} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rateColor}`}>
                      {cat.rate !== null ? `${cat.rate}%` : "未回答"}
                    </span>
                    <Link
                      href={`/quiz?category=${cat.slug}`}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg font-medium transition-colors"
                    >
                      演習
                    </Link>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${cat.rate ?? 0}%` }}
                  />
                </div>
                {cat.total > 0 && (
                  <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                    <span>✅ {cat.correct}問</span>
                    <span>❌ {cat.incorrect}問</span>
                    <span>合計 {cat.total}問</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: { name: string; slug: string; icon: string };
};

type ProgressRecord = Record<string, { correct: number; incorrect: number }>;

function loadProgress(): ProgressRecord {
  try {
    return JSON.parse(localStorage.getItem("fp_progress") || "{}");
  } catch {
    return {};
  }
}

function saveProgress(slug: string, isCorrect: boolean) {
  const progress = loadProgress();
  if (!progress[slug]) progress[slug] = { correct: 0, incorrect: 0 };
  if (isCorrect) progress[slug].correct++;
  else progress[slug].incorrect++;
  localStorage.setItem("fp_progress", JSON.stringify(progress));
}

function QuizContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setScore({ correct: 0, incorrect: 0 });
    setFinished(false);

    const url = `/api/questions?limit=10${categorySlug ? `&category=${categorySlug}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  }, [categorySlug]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowExplanation(true);
    const isCorrect = index === questions[current].correctIndex;
    saveProgress(questions[current].category.slug, isCorrect);
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      incorrect: s.incorrect + (isCorrect ? 0 : 1),
    }));
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400 text-sm">問題を読み込み中...</div>
      </div>
    );
  }

  if (finished) {
    const total = score.correct + score.incorrect;
    const rate = Math.round((score.correct / total) * 100);
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="text-5xl mb-4">{rate >= 80 ? "🎉" : rate >= 60 ? "📚" : "💪"}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">演習完了！</h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-5xl font-bold text-blue-600 mb-1">{rate}%</div>
          <div className="text-slate-500 text-sm mb-4">正答率</div>
          <div className="flex justify-center gap-8 text-sm">
            <div><span className="text-green-600 font-bold text-xl">{score.correct}</span><div className="text-slate-400">正解</div></div>
            <div><span className="text-red-500 font-bold text-xl">{score.incorrect}</span><div className="text-slate-400">不正解</div></div>
            <div><span className="text-slate-700 font-bold text-xl">{total}</span><div className="text-slate-400">合計</div></div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={fetchQuestions}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            もう一度
          </button>
          <a href="/" className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
            トップへ
          </a>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q.correctIndex;

  return (
    <div className="max-w-xl mx-auto">
      {/* 進捗バー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{current + 1} / {questions.length}</span>
      </div>

      {/* 分野バッジ */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-sm">{q.category.icon}</span>
        <span className="text-xs text-slate-500">{q.category.name}</span>
      </div>

      {/* 問題文 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
        <p className="text-slate-800 text-sm leading-relaxed font-medium">{q.text}</p>
      </div>

      {/* 選択肢 */}
      <div className="flex flex-col gap-2 mb-4">
        {q.options.map((option, i) => {
          let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ";
          if (selected === null) {
            cls += "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50";
          } else if (i === q.correctIndex) {
            cls += "bg-green-50 border-green-400 text-green-800 font-medium";
          } else if (i === selected && !isCorrect) {
            cls += "bg-red-50 border-red-400 text-red-700";
          } else {
            cls += "bg-white border-slate-200 text-slate-400";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} className={cls}>
              <span className="font-medium mr-2 text-slate-400">{["①", "②", "③", "④"][i]}</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* 解説 */}
      {showExplanation && (
        <div className={`rounded-xl p-4 mb-4 text-sm ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className={`font-bold mb-1.5 ${isCorrect ? "text-green-700" : "text-red-600"}`}>
            {isCorrect ? "✅ 正解！" : "❌ 不正解"}
          </div>
          <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* 次へボタン */}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          {current + 1 >= questions.length ? "結果を見る" : "次の問題へ →"}
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-slate-400 text-sm">読み込み中...</div></div>}>
      <QuizContent />
    </Suspense>
  );
}

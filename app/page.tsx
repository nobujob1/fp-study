import Link from "next/link";
import { prisma } from "./lib/prisma";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">FP3級 勉強アプリ</h1>
        <p className="text-slate-500 text-sm">6分野の問題演習・まとめで合格をめざそう</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/quiz"
          className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 transition-colors shadow-sm"
        >
          <span className="text-3xl">🎯</span>
          <div>
            <div className="font-bold text-lg">全分野ランダム演習</div>
            <div className="text-blue-100 text-sm">すべての分野から出題</div>
          </div>
        </Link>
        <Link
          href="/weak-points"
          className="flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 transition-colors shadow-sm"
        >
          <span className="text-3xl">📊</span>
          <div>
            <div className="font-bold text-lg text-slate-800">苦手分野チェック</div>
            <div className="text-slate-500 text-sm">分野別の正答率を確認</div>
          </div>
        </Link>
      </div>

      <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">分野別に学ぶ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
              </div>
              <span className="text-xs text-slate-400">{cat._count.questions}問</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{cat.description}</p>
            <div className="flex gap-2">
              <Link
                href={`/quiz?category=${cat.slug}`}
                className="flex-1 text-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors"
              >
                演習する
              </Link>
              <Link
                href={`/categories/${cat.slug}`}
                className="flex-1 text-center text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                まとめを見る
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

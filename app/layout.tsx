import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FP3級 勉強アプリ",
  description: "FP3級試験の学習をサポートする練習問題・まとめアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-blue-600 text-lg tracking-tight">
              📚 FP3級
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/quiz" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                問題演習
              </Link>
              <Link href="/weak-points" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                苦手分野
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 text-center text-xs text-slate-400 py-4">
          FP3級 勉強アプリ
        </footer>
      </body>
    </html>
  );
}

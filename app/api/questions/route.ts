import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") || "10");

  const where = category ? { category: { slug: category } } : {};

  const total = await prisma.question.count({ where });
  const skip = Math.floor(Math.random() * Math.max(0, total - limit));

  const questions = await prisma.question.findMany({
    where,
    include: { category: { select: { name: true, slug: true, icon: true } } },
    skip: Math.max(0, skip),
    take: limit,
  });

  // シャッフル
  const shuffled = questions.sort(() => Math.random() - 0.5);

  return NextResponse.json(shuffled);
}

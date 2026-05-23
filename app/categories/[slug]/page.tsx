import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const summaries: Record<string, { points: string[]; keywords: { term: string; desc: string }[] }> = {
  "life-planning": {
    points: [
      "公的医療保険：会社員は健康保険（協会けんぽ・組合健保）、自営業者は国民健康保険に加入",
      "保険料は被保険者と事業主が折半（健康保険）",
      "公的年金：国民年金（基礎年金）＋厚生年金（会社員・公務員）の2階建て構造",
      "老齢基礎年金の受給開始は原則65歳（60〜75歳の間で繰り上げ・繰り下げ可）",
      "雇用保険の基本手当：離職前2年間に被保険者期間12か月以上が必要",
      "介護保険：第1号（65歳以上）は原因不問、第2号（40〜64歳）は特定疾病のみ",
      "住宅ローン：元利均等返済は毎月の支払い額一定、元金均等返済は総返済額が少ない",
    ],
    keywords: [
      { term: "協会けんぽ", desc: "中小企業の会社員が加入する全国健康保険協会管掌健康保険" },
      { term: "国民年金", desc: "20〜60歳の全国民が加入する基礎年金制度" },
      { term: "厚生年金", desc: "会社員・公務員が加入する上乗せ年金" },
      { term: "マクロ経済スライド", desc: "少子高齢化に対応した年金給付の自動調整機能" },
      { term: "高額療養費", desc: "医療費の自己負担が一定額を超えた場合に払い戻す制度" },
    ],
  },
  "risk-management": {
    points: [
      "保険の三当事者：保険契約者（保険料負担）・被保険者（保険の対象）・保険受取人",
      "定期保険：保険期間内の死亡保障のみ。満期保険金なし（掛け捨て）",
      "終身保険：一生涯の死亡保障。貯蓄性あり",
      "養老保険：満期時に満期保険金＝死亡保険金。死亡保障と貯蓄を兼ねる",
      "生命保険料は3利源（死差益・費差益・利差益）に基づいて算定",
      "自賠責保険は強制加入の対人賠償のみ。任意保険で対物・車両・搭乗者もカバー",
      "火災保険は地震・噴火・津波を原則補償しない（地震保険が必要）",
    ],
    keywords: [
      { term: "純保険料", desc: "保険金支払いの財源部分" },
      { term: "付加保険料", desc: "保険会社の事業費部分" },
      { term: "解約返戻金", desc: "生命保険を解約したときに受け取れる金額" },
      { term: "告知義務", desc: "契約時に健康状態などを正直に申告する義務" },
      { term: "地震保険", desc: "火災保険に付帯する地震・津波補償（単独加入不可）" },
    ],
  },
  "financial-assets": {
    points: [
      "単利と複利：複利は利息にも利息がつくため長期運用で有利",
      "債券：価格と利回りは逆相関。市場金利↑→債券価格↓",
      "株式指標：PER（株価÷EPS）・PBR（株価÷1株純資産）・ROE（純利益÷自己資本）",
      "投資信託の費用：購入時手数料・信託報酬（日々差引）・信託財産留保額",
      "NISA：成長投資枠240万円＋つみたて投資枠120万円。非課税期間は無期限",
      "外貨預金はペイオフ対象外。為替リスクあり",
      "ポートフォリオの分散投資でリスクを低減できる（相関係数が低いほど効果大）",
    ],
    keywords: [
      { term: "PER", desc: "Price Earnings Ratio。株価 ÷ 1株当たり純利益" },
      { term: "PBR", desc: "Price Book-value Ratio。株価 ÷ 1株当たり純資産" },
      { term: "信託報酬", desc: "投資信託の運用管理費用。日々純資産から差引" },
      { term: "ペイオフ", desc: "預金保険制度。元本1,000万円まで保護（外貨預金は対象外）" },
      { term: "NISA", desc: "少額投資非課税制度。年間360万円まで非課税投資可能" },
    ],
  },
  "tax-planning": {
    points: [
      "所得は10種類：給与所得・事業所得・不動産所得・利子所得・配当所得など",
      "所得控除14種類：基礎控除・配偶者控除・扶養控除・医療費控除・社会保険料控除など",
      "基礎控除：48万円（住民税は43万円）※合計所得2,400万円以下",
      "医療費控除：（医療費－補填額－10万円）が控除額（上限200万円）",
      "青色申告特別控除：e-Tax申告で最大65万円、それ以外は55万円または10万円",
      "給与収入2,000万円超は年末調整不可→確定申告必要",
      "所得税は超過累進税率（5〜45%の7段階）",
    ],
    keywords: [
      { term: "源泉徴収", desc: "給与支払い時に事業主が所得税を天引きする制度" },
      { term: "年末調整", desc: "1年間の所得税を正確に計算し過不足を精算する手続き" },
      { term: "確定申告", desc: "自ら所得と税額を計算して申告・納税する手続き" },
      { term: "損益通算", desc: "複数の所得で損失と利益を合算すること" },
      { term: "青色申告", desc: "複式簿記で記帳することで特別控除などの特典が受けられる申告方法" },
    ],
  },
  "real-estate": {
    points: [
      "不動産登記：表題部（物理情報）・甲区（所有権）・乙区（抵当権など）",
      "重要事項説明：契約締結前に宅地建物取引士が書面交付・説明義務",
      "不動産取得税：都道府県税。取得時に課税",
      "固定資産税・都市計画税：市区町村税。毎年1月1日現在の所有者に課税",
      "譲渡所得：所有5年以下は短期（39.63%）、5年超は長期（20.315%）",
      "居住用3,000万円特別控除：マイホームを売った場合、3,000万円まで控除",
      "借地借家法：普通借家は更新あり。定期借家は期間満了で終了",
    ],
    keywords: [
      { term: "宅地建物取引士", desc: "不動産取引の専門資格者。重要事項説明が必須" },
      { term: "抵当権", desc: "不動産を担保とする権利。登記簿の乙区に記載" },
      { term: "固定資産税評価額", desc: "固定資産税・都市計画税の課税基準となる評価額" },
      { term: "定期借家契約", desc: "期間満了で終了する借家契約。更新なし" },
      { term: "不動産取得税", desc: "土地・建物の取得時に都道府県が課す税金" },
    ],
  },
  "inheritance": {
    points: [
      "法定相続分：配偶者＋子→配偶者1/2・子1/2。配偶者＋親→配偶者2/3・親1/3",
      "相続放棄：相続開始を知った日から3か月以内に家庭裁判所に申述",
      "相続税基礎控除：3,000万円＋（600万円×法定相続人数）",
      "贈与税の基礎控除：年間110万円（暦年課税）",
      "相続時精算課税：2,500万円まで贈与税非課税、相続時に合算",
      "遺言書の種類：自筆証書（全文自筆）・公正証書（公証人作成）・秘密証書",
      "小規模宅地等の特例：居住用宅地は最大330㎡まで80%評価減",
    ],
    keywords: [
      { term: "法定相続人", desc: "民法で定められた相続権を持つ人。配偶者・子・親・兄弟姉妹" },
      { term: "遺留分", desc: "法定相続人に保障された最低限の相続割合" },
      { term: "相続時精算課税", desc: "60歳以上の親・祖父母から18歳以上の子・孫への贈与に適用できる特例" },
      { term: "公正証書遺言", desc: "公証人が作成する最も確実な遺言書。家裁の検認不要" },
      { term: "基礎控除", desc: "相続税の非課税枠。3,000万円＋600万円×法定相続人数" },
    ],
  },
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { questions: true } } },
  });
  if (!category) notFound();

  const summary = summaries[slug];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">← トップ</Link>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{category.name}</h1>
          <p className="text-sm text-slate-500">{category.description}</p>
        </div>
      </div>

      {summary && (
        <>
          {/* 重要ポイント */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <span>📌</span> 重要ポイント
            </h2>
            <ul className="flex flex-col gap-2">
              {summary.points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-blue-400 flex-shrink-0 mt-0.5">▶</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* キーワード */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <span>🔑</span> 重要キーワード
            </h2>
            <div className="flex flex-col gap-2">
              {summary.keywords.map((kw, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-semibold text-blue-700 whitespace-nowrap min-w-24">{kw.term}</span>
                  <span className="text-slate-600">{kw.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Link
        href={`/quiz?category=${slug}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
      >
        🎯 この分野の問題を解く（{category._count.questions}問）
      </Link>
    </div>
  );
}

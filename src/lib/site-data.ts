import { prisma } from "./db";
import { GAMES, type GameCategory } from "./games";

export interface BannerData {
  id: string;
  imageUrl: string;
  link: string | null;
}

export interface RaspadinhaData {
  id: string;
  name: string;
  price: number;
  maxPrize: number;
  description: string;
  color: string;
  emoji: string;
  /** Imagem configurável no admin; vazio = usa o gradiente/emoji de fallback */
  imageUrl: string;
  category: GameCategory;
}

// Gera uma imagem de banner (SVG data-URI) — usada como conteúdo inicial editável
function bannerSvg(highlight: string, rest: string, sub: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1100 460'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0' stop-color='#2a0808'/><stop offset='0.55' stop-color='#7f1d1d'/><stop offset='1' stop-color='#c01010'/>
</linearGradient></defs>
<rect width='1100' height='460' fill='url(#g)'/>
<text x='80' y='220' font-family='Arial,Helvetica,sans-serif' font-size='74' font-weight='900'><tspan fill='#fca5a5'>${highlight} </tspan><tspan fill='#ffffff'>${rest}</tspan></text>
<text x='82' y='300' font-family='Arial,Helvetica,sans-serif' font-size='40' font-weight='700' fill='#fee2e2'>${sub}</text>
</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const DEFAULT_BANNERS = [
  { imageUrl: bannerSvg("Ganhe", "os prêmios dos seus sonhos", "De iPhone à sua moto 0km!"), link: "/jogar" },
  { imageUrl: bannerSvg("Raspe", "e ganhe PIX na hora!", "Saque em minutos, direto na sua conta."), link: "/jogar" },
  { imageUrl: bannerSvg("Prêmios", "de até R$ 15.000", "Cadastre-se grátis e comece a ganhar."), link: "/cadastrar" },
];

/** Cria os banners padrão na primeira vez (para serem editáveis no admin). */
export async function ensureBannersSeed() {
  const count = await prisma.banner.count();
  if (count === 0) {
    await prisma.banner.createMany({
      data: DEFAULT_BANNERS.map((b, i) => ({ ...b, sortOrder: i })),
    });
  }
}

/**
 * Banners do carrossel da home. Editáveis no painel admin (tabela Banner).
 * Faz seed automático dos banners padrão na primeira execução.
 */
export async function getBanners(): Promise<BannerData[]> {
  await ensureBannersSeed();
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.map((b) => ({ id: b.id, imageUrl: b.imageUrl, link: b.link }));
}

export interface WinnerData {
  id: string;
  imageUrl: string;
  name: string;
  value: number;
  badge: "PIX" | "PREMIO";
  minutesAgo: number;
}

const DEFAULT_WINNERS = [
  { name: "***s***...", value: 5000, badge: "PREMIO", minutesAgo: 54 },
  { name: "***r******", value: 1, badge: "PIX", minutesAgo: 32 },
  { name: "***f****...", value: 200, badge: "PIX", minutesAgo: 33 },
  { name: "***a*****", value: 10, badge: "PIX", minutesAgo: 12 },
  { name: "***m***...", value: 1, badge: "PIX", minutesAgo: 7 },
  { name: "***j*****", value: 2500, badge: "PREMIO", minutesAgo: 68 },
  { name: "***l****...", value: 50, badge: "PIX", minutesAgo: 21 },
  { name: "***b*****", value: 500, badge: "PIX", minutesAgo: 44 },
  { name: "***c***...", value: 20, badge: "PIX", minutesAgo: 9 },
  { name: "***p*****", value: 1000, badge: "PREMIO", minutesAgo: 73 },
  { name: "***t****...", value: 5, badge: "PIX", minutesAgo: 3 },
  { name: "***g*****", value: 100, badge: "PIX", minutesAgo: 58 },
];

/**
 * "Últimos Ganhadores" — entradas FIXAS (salvas no banco, não mudam no F5).
 * Fotos/valores/nomes editáveis no admin (tabela Winner). Seed automático.
 * Retorna a lista e o total de "Prêmios Distribuídos".
 */
export async function getWinners(): Promise<{ winners: WinnerData[]; total: number }> {
  let rows = await prisma.winner.findMany({ where: { active: true } });

  if (rows.length === 0) {
    await prisma.winner.createMany({
      data: DEFAULT_WINNERS.map((w, i) => ({ ...w, sortOrder: i })),
    });
    rows = await prisma.winner.findMany({ where: { active: true } });
  }

  rows.sort((a, b) => a.sortOrder - b.sortOrder);

  const winners: WinnerData[] = rows.map((w) => ({
    id: w.id,
    imageUrl: w.imageUrl,
    name: w.name,
    value: w.value,
    badge: (w.badge as "PIX" | "PREMIO") ?? "PIX",
    minutesAgo: w.minutesAgo,
  }));

  const total = await getWinnersTotal(winners);

  return { winners, total };
}

/**
 * "Prêmios Distribuídos" — valor editável no admin (Setting "winnersTotal").
 * Na 1ª vez, semeia com a soma dos prêmios + base.
 */
export async function getWinnersTotal(winners?: WinnerData[]): Promise<number> {
  const s = await prisma.setting.findUnique({ where: { key: "winnersTotal" } });
  if (s) return parseFloat(s.value) || 0;

  const rows = winners ?? (await prisma.winner.findMany({ where: { active: true } })).map((w) => ({ value: w.value } as WinnerData));
  const def = rows.reduce((sum, w) => sum + w.value, 0) + 25886;
  await prisma.setting.create({ data: { key: "winnersTotal", value: String(def) } });
  return def;
}

export async function setWinnersTotal(value: number): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "winnersTotal" },
    update: { value: String(value) },
    create: { key: "winnersTotal", value: String(value) },
  });
}

/**
 * Lista de raspadinhas mesclando a config estática (preços, prêmios, prob.)
 * com as configurações editáveis no admin (imagem e categoria via GameSetting).
 * Faz seed automático das settings padrão na primeira execução.
 */
export async function getRaspadinhas(): Promise<RaspadinhaData[]> {
  let settings = await prisma.gameSetting.findMany();

  // Seed automático na primeira vez
  if (settings.length === 0) {
    await prisma.gameSetting.createMany({
      data: GAMES.map((g) => ({
        gameId: g.id,
        imageUrl: "",
        category: g.category,
      })),
    });
    settings = await prisma.gameSetting.findMany();
  }

  const byId = new Map(settings.map((s) => [s.gameId, s]));

  return GAMES.map((g) => {
    const s = byId.get(g.id);
    return {
      id: g.id,
      name: s?.name ?? g.name,
      price: s?.price ?? g.price,
      maxPrize: g.maxPrize,
      description: s?.description ?? g.description,
      color: g.color,
      emoji: g.emoji,
      imageUrl: s?.imageUrl ?? "",
      category: (s?.category as GameCategory) ?? g.category,
    };
  });
}

/**
 * Game estático mesclado com os overrides do admin (name/price/description).
 * Usado na página de jogo e na cobrança do play.
 */
export async function getMergedGame(gameId: string) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return null;
  const s = await prisma.gameSetting.findUnique({ where: { gameId } });
  return {
    ...g,
    name: s?.name ?? g.name,
    price: s?.price ?? g.price,
    description: s?.description ?? g.description,
    imageUrl: s?.imageUrl ?? "",
    category: (s?.category as GameCategory) ?? g.category,
  };
}

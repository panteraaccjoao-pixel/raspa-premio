import "dotenv/config";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const sqlite = new Database("dev.db");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const bool = (v) => !!v;
const date = (v) => (v ? new Date(v) : new Date());
const rows = (t) => sqlite.prepare(`SELECT * FROM "${t}"`).all();

async function run() {
  // Banner
  const banners = rows("Banner");
  for (const b of banners) {
    const data = {
      imageUrl: b.imageUrl, link: b.link ?? null, objectFit: b.objectFit ?? "cover",
      sortOrder: b.sortOrder ?? 0, active: bool(b.active), createdAt: date(b.createdAt),
    };
    await prisma.banner.upsert({ where: { id: b.id }, update: data, create: { id: b.id, ...data } });
  }
  console.log("Banner:", banners.length);

  // GameSetting
  const gs = rows("GameSetting");
  for (const g of gs) {
    const data = {
      imageUrl: g.imageUrl ?? "", category: g.category ?? "PRODUTOS",
      name: g.name ?? null, price: g.price ?? null, description: g.description ?? null,
      maxPrize: g.maxPrize ?? 1000, active: bool(g.active),
    };
    await prisma.gameSetting.upsert({ where: { gameId: g.gameId }, update: data, create: { gameId: g.gameId, ...data } });
  }
  console.log("GameSetting:", gs.length);

  // GamePrize
  const gp = rows("GamePrize");
  for (const p of gp) {
    const data = {
      gameId: p.gameId, label: p.label, value: p.value ?? 0,
      imageUrl: p.imageUrl ?? "", sortOrder: p.sortOrder ?? 0, active: bool(p.active),
    };
    await prisma.gamePrize.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }
  console.log("GamePrize:", gp.length);

  // Winner
  const wn = rows("Winner");
  for (const w of wn) {
    const data = {
      imageUrl: w.imageUrl ?? "", name: w.name, value: w.value,
      badge: w.badge ?? "PIX", minutesAgo: w.minutesAgo ?? 5, sortOrder: w.sortOrder ?? 0, active: bool(w.active),
    };
    await prisma.winner.upsert({ where: { id: w.id }, update: data, create: { id: w.id, ...data } });
  }
  console.log("Winner:", wn.length);

  // Setting (só winnersTotal — ignora chaves de teste emailverify:*)
  const st = rows("Setting").filter((s) => !s.key.startsWith("emailverify:"));
  for (const s of st) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } });
  }
  console.log("Setting:", st.length);

  await prisma.$disconnect();
  console.log("\n✅ Migração concluída.");
}

run().catch((e) => { console.error("Erro:", e.message); process.exit(1); });

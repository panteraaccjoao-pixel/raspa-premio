import HomeShowcase from "@/components/HomeShowcase";
import { getBanners, getRaspadinhas, getWinners } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [banners, games, winnersData] = await Promise.all([
    getBanners(),
    getRaspadinhas(),
    getWinners(),
  ]);

  return (
    <HomeShowcase
      banners={banners}
      games={games}
      winners={winnersData.winners}
      winnersTotal={winnersData.total}
    />
  );
}

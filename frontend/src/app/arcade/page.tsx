import RouletteGame from "./RouletteGame";
import LotteryCard from "../../components/LotteryCard";

export default function ArcadePage() {
  return (
    <div className="min-h-screen text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Nexus <span className="neon-text text-purple-400">Arcade</span>
          </h1>
          <p className="text-xl text-gray-400">
            Provably fair games powered by Chainlink VRF
          </p>
        </div>

        <div className="grid gap-12 max-w-6xl mx-auto">
          {/* Roulette Section */}
          <section className="glass-panel rounded-2xl overflow-hidden p-1">
            <RouletteGame />
          </section>

          {/* Lottery Section */}
          <section className="glass-panel rounded-2xl overflow-hidden p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">Daily Lottery</h2>
              <LotteryCard />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

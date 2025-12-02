import SuggestionsBoard from "@/components/SuggestionsBoard";
import WinnersList from "@/components/WinnersList";
import GovernanceBoard from "@/components/GovernanceBoard";

export default function SocialPage() {
  return (
    <div className="min-h-screen text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Community <span className="neon-text text-green-400">Hub</span>
          </h1>
          <p className="text-xl text-gray-400">
            Celebrate winners and shape the future of Nexus
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-12">
          {/* Left Column: Winners */}
          <div className="h-[600px] glass-panel rounded-2xl p-1">
            <WinnersList />
          </div>

          {/* Right Column: Suggestions */}
          <div className="h-[600px] glass-panel rounded-2xl p-1">
            <SuggestionsBoard />
          </div>
        </div>

        {/* Governance Section */}
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl p-1">
            <GovernanceBoard />
        </div>
      </div>
    </div>
  );
}

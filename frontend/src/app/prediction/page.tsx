'use client';

import PredictionCard from '../../components/PredictionCard';

export default function PredictionPage() {
  return (
    <div className="min-h-screen text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Market <span className="neon-text">Predictions</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Predict price movements and relative performance. Win rewards if you are correct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PredictionCard symbol="ETH" />
          <PredictionCard symbol="ETH-BTC" />
        </div>
      </div>
    </div>
  );
}

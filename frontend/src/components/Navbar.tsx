import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center p-6 border-b border-white/10 bg-black/50 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent neon-text">
          NEXUS DEFI
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/analytics" className="text-sm text-gray-400 hover:text-white transition-colors">Analytics</Link>
          <Link href="/prediction" className="text-sm text-gray-400 hover:text-white transition-colors">Prediction</Link>
          <Link href="/arcade" className="text-sm text-gray-400 hover:text-white transition-colors">Arcade</Link>
          <Link href="/social" className="text-sm text-gray-400 hover:text-white transition-colors">Social</Link>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Ticker from '../../components/Ticker';

const VOLUME_DATA = [
  { name: 'Mon', eth: 4000, nex: 2400 },
  { name: 'Tue', eth: 3000, nex: 1398 },
  { name: 'Wed', eth: 2000, nex: 9800 },
  { name: 'Thu', eth: 2780, nex: 3908 },
  { name: 'Fri', eth: 1890, nex: 4800 },
  { name: 'Sat', eth: 2390, nex: 3800 },
  { name: 'Sun', eth: 3490, nex: 4300 },
];

const PRICE_DATA = [
  { time: '00:00', price: 1.10 },
  { time: '04:00', price: 1.15 },
  { time: '08:00', price: 1.12 },
  { time: '12:00', price: 1.25 },
  { time: '16:00', price: 1.22 },
  { time: '20:00', price: 1.30 },
  { time: '24:00', price: 1.28 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen text-white">
      <Ticker />
      
      <main className="p-8 max-w-7xl mx-auto pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Platform <span className="neon-text text-blue-400">Analytics</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Trading Volume (ETH vs NEX)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="eth" fill="#3b82f6" name="ETH Volume" />
                  <Bar dataKey="nex" fill="#8b5cf6" name="NEX Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price Chart */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-300">NEX Price Action (24h)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_DATA}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Tokens Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-gray-300">Top Traded Assets</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="p-4">Asset</th>
                <th className="p-4">Price</th>
                <th className="p-4">24h Change</th>
                <th className="p-4">24h Volume</th>
                <th className="p-4">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {[
                { name: 'Nexus (NEX)', price: '$1.24', change: '+12.5%', vol: '$2.4M', cap: '$12.4M' },
                { name: 'Ethereum (ETH)', price: '$3,456.78', change: '-1.2%', vol: '$15.2B', cap: '$415B' },
                { name: 'Bitcoin (BTC)', price: '$65,432.10', change: '+2.5%', vol: '$28.5B', cap: '$1.2T' },
                { name: 'Solana (SOL)', price: '$145.20', change: '+5.4%', vol: '$3.1B', cap: '$65B' },
              ].map((token, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">{token.name}</td>
                  <td className="p-4 text-gray-300">{token.price}</td>
                  <td className={`p-4 ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {token.change}
                  </td>
                  <td className="p-4 text-gray-300">{token.vol}</td>
                  <td className="p-4 text-gray-300">{token.cap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

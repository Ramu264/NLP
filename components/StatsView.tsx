
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsViewProps {
  originalWords: number;
  summaryWords: number;
}

const StatsView: React.FC<StatsViewProps> = ({ originalWords, summaryWords }) => {
  const data = [
    { name: 'Original', words: originalWords, color: '#6366f1' },
    { name: 'Summary', words: summaryWords, color: '#10b981' },
  ];

  const reduction = (((originalWords - summaryWords) / originalWords) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Compression Insights</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <p className="text-xs text-indigo-600 font-medium">Reduction Rate</p>
          <p className="text-2xl font-bold text-indigo-900">{reduction}%</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-600 font-medium">Words Saved</p>
          <p className="text-2xl font-bold text-emerald-900">{originalWords - summaryWords}</p>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="words" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsView;

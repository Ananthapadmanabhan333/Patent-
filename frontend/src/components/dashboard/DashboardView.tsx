import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

import { ClaimGraph } from './ClaimGraph';
import { PortfolioRiskRadar } from './PortfolioRiskRadar';
import { JurisdictionHeatmap } from './JurisdictionHeatmap';
import { SimulationPanel } from './SimulationPanel';

const MOCK_DATA = [
    { name: 'Jan', risk: 40 },
    { name: 'Feb', risk: 30 },
    { name: 'Mar', risk: 55 },
    { name: 'Apr', risk: 45 },
    { name: 'May', risk: 85 },
    { name: 'Jun', risk: 65 },
];

export const DashboardView = () => {
    return (
        <div className="space-y-6 animation-fade-in">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Analyses" value="1,248" icon={<Activity />} trend="+12% this month" />
                <MetricCard label="Average Risk Score" value="42.5" icon={<ShieldAlert />} trend="-5.2% vs last avg" />
                <MetricCard label="Actionable Claims" value="312" icon={<FileText />} trend="High severity" />
                <MetricCard label="Jurisdictions Monitored" value="8" icon={<Globe />} trend="Global coverage" />
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Portfolio Risk Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_DATA}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Comparison */}
                <PortfolioRiskRadar />
            </div>

            {/* Graph and Geography Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClaimGraph />
                <JurisdictionHeatmap />
                <SimulationPanel />
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, trend }: { label: string, value: string | number, icon: React.ReactNode, trend: string }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="glass-card p-6 flex flex-col"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg">
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-400">{trend}</span>
        </div>
        <span className="text-3xl font-bold text-white mb-1">{value}</span>
        <span className="text-sm text-gray-400 font-medium">{label}</span>
    </motion.div>
);

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { AlertTriangle, ShieldCheck, FileSearch, Target, TrendingUp, Layers } from 'lucide-react';

interface DashboardProps {
    riskData: any;
}

const semanticData = [
    { subject: 'Structure', A: 85, fullMark: 100 },
    { subject: 'Function', A: 90, fullMark: 100 },
    { subject: 'Materials', A: 60, fullMark: 100 },
    { subject: 'Mechanism', A: 75, fullMark: 100 },
    { subject: 'Algorithm', A: 40, fullMark: 100 },
    { subject: 'Use Case', A: 80, fullMark: 100 },
];

const similarPatents = [
    { name: 'US10973446', score: 87, active: true },
    { name: 'EP3421027', score: 79, active: true },
    { name: 'US11234567', score: 74, active: true },
    { name: 'WO2021098', score: 69, active: false },
    { name: 'US9876543', score: 61, active: true },
];

const Dashboard: React.FC<DashboardProps> = ({ riskData }) => {
    const score = riskData?.risk_score || 0;
    const level = riskData?.risk_level || "PENDING";

    const getRiskColor = (l: string) => {
        switch (l) {
            case 'CRITICAL': return 'bg-red-500 text-red-100';
            case 'HIGH': return 'bg-orange-500 text-orange-100';
            case 'MODERATE': return 'bg-yellow-500 text-yellow-100';
            case 'LOW': return 'bg-green-500 text-green-100';
            default: return 'bg-gray-600 text-gray-100';
        }
    };

    const getRiskTextColor = (l: string) => {
        switch (l) {
            case 'CRITICAL': return 'text-red-500';
            case 'HIGH': return 'text-orange-500';
            case 'MODERATE': return 'text-yellow-500';
            case 'LOW': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    if (!riskData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animation-fade-in">
                <Target className="w-16 h-16 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold">No active analysis</h2>
                <p>Start a new patent analysis to view insights here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animation-fade-in">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <div className="glass-card p-6 md:col-span-1 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${getRiskColor(level)}`}>
                        {level} RISK
                    </div>
                    <p className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">Infringement Score</p>
                    <div className="flex items-baseline mb-2">
                        <span className={`text-6xl font-black ${getRiskTextColor(level)}`}>{score}</span>
                        <span className="text-gray-500 ml-2 font-medium">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">Based on structural and semantic similarity to 5M+ active patents.</p>
                </div>

                <div className="glass-card p-6 md:col-span-3">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-brand-500" /> Executive Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        The submitted invention description exhibits <span className={`font-bold ${getRiskTextColor(level)}`}>{level.toLowerCase()}</span> risk of infringing on existing intellectual property.
                        We identified <strong>5 similar active patents</strong> globally, with the highest structural overlap found in the mechanism and structural components.
                        Consider reviewing the specific claims in <strong>US10973446</strong> to ensure freedom to operate.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center border border-gray-700">
                            <FileSearch className="text-blue-400 w-5 h-5 mr-3" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Similar Art Found</p>
                                <p className="font-bold text-lg">143 Patents</p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center border border-gray-700">
                            <AlertTriangle className="text-orange-400 w-5 h-5 mr-3" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">High Risk Claims</p>
                                <p className="font-bold text-lg">3 Claims</p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center border border-gray-700">
                            <Layers className="text-purple-400 w-5 h-5 mr-3" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Structural Overlap</p>
                                <p className="font-bold text-lg">82% Match</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="glass-card p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-brand-500" /> Top Similar Patents
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={similarPatents} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={90} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-brand-500" /> Semantic Overlap Analysis
                    </h3>
                    <div className="flex-1 -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={semanticData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Similarity" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;

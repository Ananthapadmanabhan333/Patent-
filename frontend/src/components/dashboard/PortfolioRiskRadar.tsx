import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
    { subject: 'Semantic Overlap', A: 85, B: 40, fullMark: 100 },
    { subject: 'Structural Density', A: 70, B: 30, fullMark: 100 },
    { subject: 'Claim Breadth', A: 90, B: 20, fullMark: 100 },
    { subject: 'Jurisdiction Threat', A: 60, B: 80, fullMark: 100 },
    { subject: 'Litigation Aggression', A: 45, B: 55, fullMark: 100 },
    { subject: 'Validity Entropy', A: 80, B: 40, fullMark: 100 },
];

export const PortfolioRiskRadar = () => {
    return (
        <div className="glass-card p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Multi-Factor Risk Assessment</h3>
                <span className="text-xs text-gray-400">Current vs Selected</span>
            </div>

            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#4b5563' }}
                            axisLine={false}
                        />

                        {/* Current Target */}
                        <Radar
                            name="Target Patent"
                            dataKey="A"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.4}
                        />

                        {/* Baseline/Comparator */}
                        <Radar
                            name="Portfolio Average"
                            dataKey="B"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded bg-red-500 mr-2 opacity-80"></span>
                    <span className="text-gray-300">Target Patent</span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded bg-brand-500 mr-2 opacity-80"></span>
                    <span className="text-gray-300">Portfolio Average</span>
                </div>
            </div>
        </div>
    );
};

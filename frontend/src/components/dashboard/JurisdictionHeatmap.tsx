import { motion } from 'framer-motion';

// Mock geographical data for the heatmap
const MAP_DATA = [
    { region: 'US', litigations: 142, intensity: 'bg-red-500', top: '40%', left: '20%' },
    { region: 'EP', litigations: 85, intensity: 'bg-orange-500', top: '35%', left: '48%' },
    { region: 'CN', litigations: 210, intensity: 'bg-red-600', top: '42%', left: '75%' },
    { region: 'JP', litigations: 45, intensity: 'bg-yellow-500', top: '40%', left: '82%' },
    { region: 'KR', litigations: 30, intensity: 'bg-brand-500', top: '45%', left: '80%' }
];

export const JurisdictionHeatmap = () => {
    return (
        <div className="glass-card p-6 flex flex-col h-[400px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 z-10">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100">Global Litigation Heatmap</h3>
                    <p className="text-xs text-gray-400 mt-1">Geographical clustering of prior art conflicts</p>
                </div>
            </div>

            {/* CSS-based Mock Map Background */}
            <div className="absolute inset-0 top-20 bottom-10 mx-6 bg-gray-900 rounded-lg overflow-hidden border border-dark-border opacity-60">
                <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-gray-700"></div>
                <div className="absolute top-0 left-1/2 w-px h-full border-l border-dashed border-gray-700"></div>
                <span className="absolute bottom-2 left-2 text-[10px] text-gray-600 font-mono">MAP: WIPO/EPO SYNC</span>
            </div>

            <div className="flex-1 relative z-10 mx-6 mt-4">
                {MAP_DATA.map((node, i) => (
                    <motion.div
                        key={node.region}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, type: "spring" }}
                        className={`absolute flex flex-col items-center justify-center cursor-pointer`}
                        style={{ top: node.top, left: node.left }}
                    >
                        {/* Radar ping effect */}
                        <span className={`absolute inline-flex h-full w-full rounded-full ${node.intensity} opacity-20 animate-ping`}></span>
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${node.intensity} shadow-lg shadow-black ring-2 ring-dark-card`}>
                            <span className="text-[10px] font-bold text-white">{node.region}</span>
                        </div>

                        <div className="mt-1 px-2 py-0.5 bg-dark-card border border-dark-border rounded text-[10px] text-gray-300 opacity-0 hover:opacity-100 transition-opacity absolute top-10 whitespace-nowrap z-20">
                            {node.litigations} Active Cases
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 border-t border-dark-border z-10">
                <span>High Priority: CN, US</span>
                <div className="flex space-x-2">
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>Severe</div>
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Elevated</div>
                </div>
            </div>
        </div>
    );
};

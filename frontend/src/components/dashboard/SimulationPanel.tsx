import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SimulationPanel = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentScore, setCurrentScore] = useState(82);

    const [features, setFeatures] = useState([
        { id: 1, name: 'Cloud synchronization engine', active: true, riskWeight: +15 },
        { id: 2, name: 'Machine learning heuristic filter', active: true, riskWeight: +25 },
        { id: 3, name: 'Local encrypted storage loop', active: false, riskWeight: -10 },
        { id: 4, name: 'Biometric edge-validation', active: true, riskWeight: +5 },
    ]);

    const toggleFeature = (id: number) => {
        setFeatures(features.map(f => f.id === id ? { ...f, active: !f.active } : f));
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        setTimeout(() => {
            // Dummy calculation based on active weights
            const base = 40;
            const calc = features.reduce((acc, f) => f.active ? acc + f.riskWeight : acc, base);
            setCurrentScore(Math.min(100, Math.max(0, calc)));
            setIsSimulating(false);
        }, 1500);
    };

    return (
        <div className="glass-card p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center">
                        <Sliders className="w-5 h-5 mr-2 text-brand-500" />
                        Design Modification Simulator
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Test "What-If" scenarios to lower patent risk</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Simulated Risk</div>
                    <motion.div
                        key={currentScore}
                        initial={{ scale: 1.2, color: '#fff' }}
                        animate={{ scale: 1, color: currentScore > 75 ? '#ef4444' : currentScore > 40 ? '#f59e0b' : '#10b981' }}
                        className="text-3xl font-bold font-mono"
                    >
                        {currentScore}
                    </motion.div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 hidden-scrollbar relative">
                {isSimulating && (
                    <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                        <p className="text-sm font-medium text-brand-400">Recalculating vectors...</p>
                    </div>
                )}

                <AnimatePresence>
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${feature.active
                                ? 'bg-gray-800/80 border-dark-border'
                                : 'bg-gray-900/50 border-gray-800 opacity-60'
                                }`}
                            onClick={() => toggleFeature(feature.id)}
                        >
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center transition-colors ${feature.active ? 'bg-brand-500' : 'bg-gray-700'
                                    }`}>
                                    {feature.active && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm ${feature.active ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                                    {feature.name}
                                </span>
                            </div>

                            <div className="flex items-center">
                                {feature.riskWeight > 10 && feature.active && (
                                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                                )}
                                <span className={`text-xs font-mono font-medium ${feature.riskWeight > 0 ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                    {feature.riskWeight > 0 ? '+' : ''}{feature.riskWeight} pts
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="mt-4 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex justify-center items-center"
            >
                {isSimulating ? 'Processing NLP Graph...' : 'Recalculate Risk Score'}
            </button>
        </div>
    );
};

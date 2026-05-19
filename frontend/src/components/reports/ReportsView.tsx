import { useState, useEffect } from 'react';
import { FileText, Download, Target, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { listAnalyses, AnalysisSummaryOut } from '../../lib/api';
import { Link } from 'react-router-dom';

export const ReportsView = () => {
    const [reports, setReports] = useState<AnalysisSummaryOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await listAnalyses();
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Derived metrics
    const totalReports = reports.length;
    const highRiskCount = reports.filter(r => r.risk_level?.toLowerCase() === 'high').length;
    const clearedCount = reports.filter(r => r.risk_level?.toLowerCase() === 'low').length;

    const getRiskStyles = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">Analysis Reports</h2>
                    <p className="text-sm text-gray-400 mt-1">Review historical risk assessments, litigation analysis, and download executive summaries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-4 flex items-center space-x-4 border-l-4 border-l-brand-500">
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{isLoading ? '-' : totalReports}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Reports</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center space-x-4 border-l-4 border-l-red-500">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{isLoading ? '-' : highRiskCount}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">High Risk Identified</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center space-x-4 border-l-4 border-l-emerald-500">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{isLoading ? '-' : clearedCount}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Cleared for Filing</p>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-gray-900/50">
                    <h3 className="font-semibold text-gray-100">Recent Assessments</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-800/40 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Report Title</th>
                                <th className="px-6 py-4 font-medium">Date Generated</th>
                                <th className="px-6 py-4 font-medium">Status / Score</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-500" />
                                        <p>Loading your analysis history...</p>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="mb-4">
                                            <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                                        </div>
                                        <p className="font-medium text-gray-300">No reports found</p>
                                        <p className="text-sm mt-1 mb-6">Submit an invention description to generate your first AI risk assessment.</p>
                                        <Link to="/analysis/new" className="text-brand-400 hover:text-brand-300 font-medium flex items-center justify-center">
                                            New Analysis
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Target className="w-4 h-4 mr-3 text-gray-500" />
                                                <span className="font-medium text-gray-200">{report.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {report.status.toLowerCase() !== 'completed' ? (
                                                <span className="inline-flex items-center text-brand-400">
                                                    <span className="w-3 h-3 border-2 border-brand-400/20 border-t-brand-400 rounded-full animate-spin mr-2"></span>
                                                    {report.status}
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-semibold ${getRiskStyles(report.risk_level || '')}`}>
                                                    {report.risk_level || 'Unknown'} (Score: {report.risk_score?.toFixed(1)})
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                disabled={report.status.toLowerCase() !== 'completed'}
                                                className="text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Download PDF Report"
                                            >
                                                <Download className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

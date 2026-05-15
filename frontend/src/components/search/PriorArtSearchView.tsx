import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Download, Loader2 } from 'lucide-react';
import { searchPriorArt, SimilarPatentOut } from '../../lib/api';

export const PriorArtSearchView = () => {
    const [query, setQuery] = useState("Cloud synchronization engine with edge validation");
    const [results, setResults] = useState<SimilarPatentOut[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const data = await searchPriorArt(query);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-search on initial load for demo purposes
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Prior Art & Semantic Search</h2>
                <p className="text-sm text-gray-400 mt-1">Search millions of global patents using natural language queries and semantic vector similarity.</p>
            </div>

            {/* Search Bar & Filters */}
            <div className="glass-card p-4">
                <div className="flex space-x-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="input-field pl-12 h-12 text-lg"
                            placeholder="Describe your invention, algorithm, or technical mechanism..."
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="btn-primary flex items-center px-6 disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                        Deep Search
                    </button>
                </div>

                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-dark-border text-sm">
                    <div className="flex items-center text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                        <Filter className="w-4 h-4 mr-2 text-brand-500" />
                        Jurisdictions: US, EP, CN
                    </div>
                    <div className="flex items-center text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-500" />
                        Date Range: Last 20 Years
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-gray-900/50">
                    <h3 className="font-semibold text-gray-100">Top Semantic Matches</h3>
                    <button className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-800/40 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Patent Number</th>
                                <th className="px-6 py-3 font-medium">Title</th>
                                <th className="px-6 py-3 font-medium">Assignee</th>
                                <th className="px-6 py-3 font-medium">Filing Date</th>
                                <th className="px-6 py-3 font-medium text-right">Relevance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {isSearching ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-500" />
                                        <p>Searching millions of global patents...</p>
                                        <p className="text-xs mt-2">Vectorizing query and computing semantic distances.</p>
                                    </td>
                                </tr>
                            ) : results.length > 0 ? (
                                results.map((result, i) => (
                                    <tr key={i} className="hover:bg-gray-800/30 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 font-mono text-brand-400">{result.patent_number}</td>
                                        <td className="px-6 py-4 text-gray-200 w-full max-w-md truncate" title={result.title || ''}>{result.title}</td>
                                        <td className="px-6 py-4 text-gray-400">{result.assignee}</td>
                                        <td className="px-6 py-4 text-gray-500">{result.filing_date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                {result.similarity_score ? `${(result.similarity_score * 100).toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : hasSearched ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No similar patents found in the current index.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-dark-border bg-gray-900/30 flex justify-center">
                    <button className="text-brand-400 text-sm hover:text-brand-300 transition-colors">Load More Results...</button>
                </div>
            </div>
        </div>
    );
};

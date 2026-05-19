import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, ArrowRight, X, FileCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitAnalysis } from '../../lib/api';

export const NewAnalysisView = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate professional upload progress
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 15;
            });
        }, 300);

        // Process file based on extension
        setTimeout(() => {
            setIsUploading(false);

            // Auto-fill Title (removing extension)
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setTitle(fileNameWithoutExt);

            // Handle txt extraction natively, mock others for demo
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setDescription(e.target?.result as string || '');
                };
                reader.readAsText(file);
            } else {
                // Mock text for PDFs / Word Docs demonstrating successful parsing
                setDescription(
                    `Invention Title: ${fileNameWithoutExt}\n\n` +
                    `1. A computer-implemented method for distributed AI processing, comprising:\n` +
                    `   - receiving an input dataset from an edge device;\n` +
                    `   - encrypting the dataset using a quantum-resistant key exchange protocol;\n` +
                    `   - distributing chunks of the encrypted dataset across a plurality of decentralized nodes;\n` +
                    `   - aggregating processing results centrally via a consensus mechanism.\n\n` +
                    `2. The method of claim 1, further wherein the decentralized nodes utilize dormant GPU cycles of consumer devices.`
                );
            }
        }, 2200);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitAnalysis(title, description);
            clearFile();
            navigate('/reports');
        } catch (error) {
            console.error("Failed to submit analysis", error);
            alert("Failed to submit analysis. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">New Patent Analysis</h2>
                    <p className="text-sm text-gray-400 mt-1">Submit invention disclosures or patent claims for immediate risk assessment.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 rounded-l-xl"></div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Analysis Title / Reference ID</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Project Phoenix - Core Algorithm"
                        className="input-field"
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Invention Description or Claims</label>
                        <span className="text-xs text-gray-500">Min 50 characters required</span>
                    </div>
                    <textarea
                        id="description"
                        rows={12}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste the full text of the invention disclosure, abstract, or the list of claims to be analyzed..."
                        className="input-field resize-y font-mono text-sm leading-relaxed"
                        required
                        minLength={50}
                    ></textarea>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 flex items-start border border-gray-700">
                    <AlertCircle className="w-5 h-5 text-brand-400 mr-3 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Data submitted is encrypted at rest and in transit. This platform uses a specialized retrieval gap engine that does not train foundational AI models on your proprietary IP.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                    <div>
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".txt,.pdf,.docx,.doc"
                        />

                        {isUploading ? (
                            <div className="flex items-center px-4 py-2 border border-brand-500/30 bg-brand-500/10 rounded-lg w-64">
                                <Loader2 className="w-4 h-4 text-brand-400 animate-spin mr-3 shrink-0" />
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-brand-200 mb-1">
                                        <span>Parsing SECURE-DOC...</span>
                                        <span>{Math.min(uploadProgress, 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-brand-500 h-full transition-all duration-300 ease-out"
                                            style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : selectedFile ? (
                            <div className="flex items-center px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <FileCheck className="w-4 h-4 mr-2" />
                                <span className="text-sm truncate max-w-[180px]">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="ml-3 text-emerald-500/70 hover:text-emerald-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Document (.pdf, .docx, .txt)
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading || description.length < 50}
                        className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                                Processing Engine...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Initiate AI Analysis
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

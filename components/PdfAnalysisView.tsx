import React, { useState, useCallback, useRef } from 'react';
import { AnalysisResult, PageContent } from '../types';
import { extractTextFromPdf } from '../services/pdfService';
import { analyzePdfText } from '../services/llmService';
import AnalysisResultDisplay from './AnalysisResultDisplay';
import { UploadCloud, FileText, Loader2, AlertTriangle, FileScan } from 'lucide-react';

const PdfAnalysisView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [framework, setFramework] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [pageContents, setPageContents] = useState<PageContent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setAnalysisResult(null); 
            setPageContents([]);
            setError(null);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!file || !framework.trim()) {
            setError("Please upload a PDF and provide your research questions.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const extractedPages = await extractTextFromPdf(file);
            setPageContents(extractedPages);
            const analysis = await analyzePdfText(extractedPages, framework);
            setAnalysisResult(analysis);
        } catch (err) {
            console.error("PDF Analysis failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to analyze the PDF. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [file, framework]);
    
    const handleReset = () => {
        setFile(null);
        setFramework('');
        setAnalysisResult(null);
        setPageContents([]);
        setError(null);
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="h-full w-full p-4 sm:p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <FileScan className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-logo">Research Analyzer</h1>
                        <p className="text-muted-foreground">Answer your research questions by extracting and paraphrasing key insights.</p>
                    </div>
                </div>

                {analysisResult ? (
                    <div className="p-6 bg-white border border-border rounded-lg shadow-sm">
                        <AnalysisResultDisplay result={analysisResult} pageContents={pageContents} />
                        <button
                            onClick={handleReset}
                            className="mt-8 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-semibold"
                        >
                            Analyze Another PDF
                        </button>
                    </div>
                ) : (
                    <div className="p-6 bg-white border border-border rounded-lg shadow-sm space-y-6">
                        {/* File Upload */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-2">1. Upload your PDF</label>
                            <div
                                className="flex justify-center items-center w-full px-6 py-10 border-2 border-border border-dashed rounded-md cursor-pointer hover:bg-slate-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                                    {file ? (
                                        <div className="mt-4 flex items-center text-sm text-slate-600">
                                            <FileText className="h-5 w-5 mr-2 text-primary" />
                                            <span className="font-semibold">{file.name}</span>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Research Questions Input - Conditional Render */}
                        {file && (
                            <div>
                                <label htmlFor="framework" className="text-sm font-medium text-slate-700 block mb-2">
                                    2. Provide your Research Questions
                                </label>
                                <textarea
                                    id="framework"
                                    rows={6}
                                    value={framework}
                                    onChange={(e) => setFramework(e.target.value)}
                                    placeholder="e.g., 'What are the key methodologies used in this study? What were the main limitations identified by the authors?'"
                                    className="w-full p-3 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-400 text-sm"
                                />
                            </div>
                        )}

                        {/* Action Button */}
                        <div>
                             <button
                                onClick={handleAnalyze}
                                disabled={!file || !framework.trim() || isLoading}
                                className="w-full flex justify-center items-center px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-sm font-semibold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze PDF'
                                )}
                            </button>
                        </div>
                         {error && (
                            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfAnalysisView;
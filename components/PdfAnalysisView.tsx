import React, { useState, useRef } from 'react';
import { AnalysisSession, KeyPointWithSource, HighlightRect } from '../types';
import AnalysisResultDisplay from './AnalysisResultDisplay';
import { UploadCloud, FileText, Loader2, AlertTriangle, FileScan, Plus, ChevronLeft, CheckCircle2, XCircle, Inbox, Search } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { findHighlightRects } from '../services/pdfHighlightService';


const NewAnalysisForm: React.FC<{
    onStartAnalysis: (file: File, framework: string) => void;
    onClose: () => void;
}> = ({ onStartAnalysis, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [framework, setFramework] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleAnalyze = () => {
        if (!file || !framework.trim()) {
            setError("Please upload a PDF and provide your research questions.");
            return;
        }
        onStartAnalysis(file, framework);
        onClose();
    };

    return (
        <div className="p-6 bg-white border border-border rounded-lg shadow-sm space-y-6 mb-8">
            <h2 className="text-lg font-bold text-slate-logo">New Analysis</h2>
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
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </div>

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
             {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm font-semibold"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAnalyze}
                    disabled={!file || !framework.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                    Start Analysis
                </button>
            </div>
        </div>
    );
};

const AnalysisCard: React.FC<{ session: AnalysisSession, onSelect: () => void }> = ({ session, onSelect }) => {
    const cardBaseClasses = "p-4 bg-white border border-border rounded-lg shadow-sm transition-shadow";
    const clickableClasses = "hover:shadow-md cursor-pointer";

    const StatusIndicator = () => {
        switch (session.status) {
            case 'loading':
                return <div className="flex items-center text-sm text-blue-600"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</div>;
            case 'completed':
                return <div className="flex items-center text-sm text-green-600"><CheckCircle2 className="h-4 w-4 mr-2" /> Completed</div>;
            case 'error':
                return <div className="flex items-center text-sm text-red-600"><XCircle className="h-4 w-4 mr-2" /> Error</div>;
        }
    };
    
    return (
        <div 
            className={`${cardBaseClasses} ${session.status === 'completed' && clickableClasses}`}
            onClick={session.status === 'completed' ? onSelect : undefined}
            role={session.status === 'completed' ? 'button' : undefined}
            tabIndex={session.status === 'completed' ? 0 : -1}
            onKeyPress={ (e) => (e.key === 'Enter' && session.status === 'completed') && onSelect() }
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate" title={session.fileName}>{session.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.createdAt).toLocaleString()}
                    </p>
                </div>
                <StatusIndicator />
            </div>
            {session.status === 'error' && (
                <p className="text-xs text-red-700 bg-red-50 p-2 mt-3 rounded-md">{session.error}</p>
            )}
            {session.status === 'completed' && session.result && (
                 <p className="text-sm text-slate-600 mt-3 border-t border-border pt-3 line-clamp-2">
                    <strong>Summary:</strong> {session.result.summary}
                </p>
            )}
        </div>
    );
};

const PdfAnalysisView: React.FC<{
    sessions: AnalysisSession[],
    onStartAnalysis: (file: File, framework: string) => void;
    onSessionSelect: () => void;
}> = ({ sessions, onStartAnalysis, onSessionSelect }) => {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [highlight, setHighlight] = useState<{ page: number; rects: HighlightRect[] } | null>(null);
    const [isHighlighting, setIsHighlighting] = useState(false);

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    const handleBack = () => {
        setSelectedSessionId(null);
        setPdfDoc(null);
        setHighlight(null);
        setIsHighlighting(false);
    };

    const handleSelectSession = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        onSessionSelect();
    };

    const handlePointSelect = async (point: KeyPointWithSource) => {
        if (!pdfDoc) return;
        setIsHighlighting(true);
        setHighlight(null); // Clear previous highlight immediately
        try {
            const page = await pdfDoc.getPage(point.pageNumber);
            const rects = await findHighlightRects(page, point.originalPoint);
            setHighlight({ page: point.pageNumber, rects });
        } catch (error) {
            console.error("Failed to find highlight:", error);
        } finally {
            setIsHighlighting(false);
        }
    };
    
    if (selectedSession) {
        return (
            <div className="h-full w-full flex flex-col bg-white">
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                    <button
                        onClick={handleBack}
                        className="flex items-center px-4 py-2 bg-white border border-border text-slate-700 rounded-md hover:bg-slate-100 text-sm font-semibold"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Analyses
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 truncate px-4">{selectedSession.fileName}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isHighlighting && <Loader2 className="h-4 w-4 animate-spin"/>}
                        {isHighlighting ? 'Finding source...' : <><Search className="h-4 w-4"/> Click a key point to find it</>}
                    </div>
                </div>
                 <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 h-full border-r border-border">
                        <PdfViewer 
                            file={selectedSession.file}
                            onDocumentLoad={setPdfDoc}
                            highlight={highlight}
                        />
                    </div>
                    <div className="w-1/2 h-full overflow-y-auto p-4 sm:p-8 bg-slate-50">
                        {selectedSession.result && selectedSession.pageContents && (
                            <AnalysisResultDisplay 
                                result={selectedSession.result}
                                pageContents={selectedSession.pageContents}
                                onPointSelect={handlePointSelect}
                                isHighlighting={isHighlighting}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full p-4 sm:p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <FileScan className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-logo">Research Analyzer</h1>
                            <p className="text-muted-foreground">Manage and review your PDF analysis sessions.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-semibold"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Analysis
                    </button>
                </div>

                {isFormVisible && <NewAnalysisForm onStartAnalysis={onStartAnalysis} onClose={() => setIsFormVisible(false)} />}
                
                <h2 className="text-xl font-bold text-slate-logo mb-4">Analysis History</h2>

                {sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.map(session => (
                            <AnalysisCard key={session.id} session={session} onSelect={() => handleSelectSession(session.id)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                         <Inbox className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">No analyses yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Click "New Analysis" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfAnalysisView;
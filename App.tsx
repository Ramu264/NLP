
import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileText, 
  Settings, 
  ChevronRight, 
  Copy, 
  Check, 
  RotateCcw, 
  History as HistoryIcon, 
  Sparkles,
  Zap,
  Info,
  Trash2
} from 'lucide-react';
import { summarizeText } from './services/geminiService';
import { SummaryResult, SummarizationConfig, SummaryLength, SummaryTone, SummaryFormat } from './types';
import StatsView from './components/StatsView';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [history, setHistory] = useState<SummaryResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Config State
  const [config, setConfig] = useState<SummarizationConfig>({
    length: 'medium',
    tone: 'professional',
    format: 'paragraph'
  });

  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    if (wordCount < 10) {
      setError("Text is too short for a meaningful summary. Try at least 10 words.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const summary = await summarizeText(inputText, config);
      const summaryWords = summary.trim().split(/\s+/).length;
      
      const newResult: SummaryResult = {
        id: Date.now().toString(),
        originalText: inputText,
        summaryText: summary,
        timestamp: Date.now(),
        config: { ...config },
        stats: {
          originalWords: wordCount,
          summaryWords,
          reduction: Math.round(((wordCount - summaryWords) / wordCount) * 100)
        }
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const loadFromHistory = (item: SummaryResult) => {
    setInputText(item.originalText);
    setResult(item);
    setConfig(item.config);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Summarize<span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-slate-500 hover:text-indigo-600 transition-colors relative"
              title="History"
            >
              <HistoryIcon className="w-6 h-6" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <a 
              href="https://github.com" 
              target="_blank" 
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Docs
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Input & Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Source Text</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-medium">{wordCount} words</span>
                  <button 
                    onClick={handleReset}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Clear text"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your long article, report, or text here..."
                className="w-full h-[32rem] p-6 text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed text-lg"
              />
            </div>

            {/* Config Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Summarization Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Length</label>
                  <div className="flex flex-col space-y-2">
                    {(['brief', 'medium', 'detailed'] as SummaryLength[]).map(l => (
                      <button
                        key={l}
                        onClick={() => setConfig(prev => ({ ...prev, length: l }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                          config.length === l 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Writing Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['professional', 'academic', 'casual', 'simple'] as SummaryTone[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setConfig(prev => ({ ...prev, tone: t }))}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          config.tone === t 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Format</label>
                  <div className="flex flex-col space-y-2">
                    {(['paragraph', 'bullets'] as SummaryFormat[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setConfig(prev => ({ ...prev, format: f }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                          config.format === f 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSummarize}
              disabled={loading || !inputText.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                loading || !inputText.trim() 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Context...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
                <Info className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel: Output & Stats */}
          <div className="lg:col-span-5 space-y-6">
            {!result && !loading ? (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to Summarize</h3>
                <p className="text-slate-500 max-w-xs">
                  Your summary and AI analysis will appear here once you hit generate.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Result Block */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Generated Summary</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleCopy}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors flex items-center space-x-1"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        <span className="text-xs font-medium">{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-8 prose prose-slate max-w-none">
                    {result?.summaryText.split('\n').map((line, i) => (
                      <p key={i} className="text-slate-800 leading-relaxed text-lg mb-4 whitespace-pre-wrap last:mb-0">
                        {line}
                      </p>
                    ))}
                    {loading && (
                      <div className="space-y-3 opacity-50 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-[90%]"></div>
                        <div className="h-4 bg-slate-200 rounded w-[95%]"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Block */}
                {result && !loading && (
                  <StatsView 
                    originalWords={result.stats.originalWords} 
                    summaryWords={result.stats.summaryWords} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Sidebar/Overlay */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowHistory(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <p className="text-slate-400 text-sm">Your summarization history will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.stats.reduction}% Reduced
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      {item.summaryText}
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">{item.config.length}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">{item.config.tone}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            {history.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={() => setHistory([])}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            Powered by Gemini AI Engine • Modern NLP Summarization
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

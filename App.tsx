import React, { useState, useCallback, useEffect } from 'react';
import IOSCard from './components/IOSCard';
import IOSInput from './components/IOSInput';
import IOSButton from './components/IOSButton';
import { AuthConfig, TestResult, TestStatus, TestStep, TestReport, ScreenshotPlaceholder } from './types';
import { generateTestPlan, generateRunReport } from './services/geminiService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Mock Screenshot Component with Tinny Fish Style
const MockScreenshot: React.FC<{ screenshot: ScreenshotPlaceholder }> = ({ screenshot }) => {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-teal-500/40 transition-all duration-300 group">
      <div className="bg-slate-800/80 aspect-[16/10] flex flex-col items-center justify-center relative p-4 overflow-hidden">
        
        {/* Animated Background Pulse for the "Live" feeling */}
        <div className="absolute inset-0 bg-teal-500/5 animate-pulse"></div>

        {/* Abstract UI Representation */}
        <div className={`w-3/4 h-3/4 bg-slate-900/90 shadow-2xl border border-white/10 rounded-xl flex flex-col overflow-hidden transform transition-transform group-hover:scale-[1.02] ${screenshot.type === 'modal' ? 'scale-90 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : ''}`}>
           <div className="h-4 bg-white/5 border-b border-white/5 flex items-center px-2 gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-400/50"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-green-400/50"></div>
           </div>
           <div className="flex-1 p-3 space-y-2 relative">
             <div className="h-2 w-1/3 bg-teal-500/20 rounded"></div>
             <div className="h-2 w-2/3 bg-white/5 rounded"></div>
             {screenshot.type === 'modal' && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-slate-800 p-4 rounded-xl shadow-2xl w-1/2 space-y-2 border border-white/10">
                    <div className="h-2 w-1/2 bg-teal-400/30 rounded"></div>
                    <div className="h-8 bg-white/5 rounded border border-white/5"></div>
                    <div className="h-6 w-full bg-teal-500/80 rounded"></div>
                  </div>
                </div>
             )}
             {screenshot.type === 'component' && (
                <div className="border-2 border-teal-500/30 rounded-lg h-full w-full absolute inset-0 m-auto animate-pulse"></div>
             )}
           </div>
        </div>
        
        <div className="absolute bottom-3 right-3 bg-teal-500/20 text-teal-300 text-[10px] px-3 py-1 rounded-full backdrop-blur-md border border-teal-500/20 flex items-center gap-1 font-bold tracking-tight">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          CAPTURED
        </div>
      </div>
      <div className="p-4 bg-slate-900/40">
        <h5 className="text-sm font-bold text-teal-50">{screenshot.title}</h5>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{screenshot.description}</p>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [url, setUrl] = useState(() => localStorage.getItem('autoqa_url') || '');
  const [auth, setAuth] = useState<AuthConfig>(() => {
    try {
      const saved = localStorage.getItem('autoqa_auth');
      return saved ? JSON.parse(saved) : { requiresAuth: false };
    } catch {
      return { requiresAuth: false };
    }
  });
  
  const [status, setStatus] = useState<TestStatus>(TestStatus.IDLE);
  const [result, setResult] = useState<TestResult | null>(null);
  const [report, setReport] = useState<TestReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'results' | 'report'>('setup');
  
  const [executingIndex, setExecutingIndex] = useState<number>(-1);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('autoqa_url', url);
  }, [url]);

  useEffect(() => {
    localStorage.setItem('autoqa_auth', JSON.stringify(auth));
  }, [auth]);

  const handleRunTest = useCallback(async () => {
    if (!url) return;
    setStatus(TestStatus.GENERATING);
    setResult(null);
    setReport(null);
    setExecutingIndex(-1);
    setSimulationComplete(false);
    setActiveTab('results');
    
    try {
      const data = await generateTestPlan({ url, auth });
      setResult(data);
      setStatus(TestStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(TestStatus.ERROR);
    }
  }, [url, auth]);

  const executeTestPlan = async () => {
    if (!result) return;
    setExecutingIndex(0);
    setSimulationComplete(false);
    setReport(null);

    for (let i = 0; i < result.steps.length; i++) {
      setExecutingIndex(i);
      const delay = Math.floor(Math.random() * 800) + 600; 
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setExecutingIndex(-1);
    setSimulationComplete(true);

    setReportLoading(true);
    try {
      const reportData = await generateRunReport(url, result.steps);
      setReport(reportData);
      setActiveTab('report');
    } catch (e) {
      console.error("Failed to generate report", e);
    } finally {
      setReportLoading(false);
    }
  };

  const getStepStatusIcon = (index: number) => {
    if (simulationComplete) {
      return (
        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      );
    }

    if (executingIndex === index) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></div>
      );
    }

    if (executingIndex > index) {
      return (
        <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm">
           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5"></div>
    );
  };

  return (
    <div className="min-h-screen text-teal-50 p-4 md:p-8 flex justify-center selection:bg-teal-500/30">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">AutoQA</h1>
              <p className="text-teal-400/70 text-xs font-bold uppercase tracking-[0.2em]">Automated Web Agent</p>
            </div>
          </div>

          <IOSCard title="Deep Search Settings">
             <IOSInput 
                label="Target Endpoint" 
                placeholder="https://example.com" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              
              <div className="flex items-center justify-between mb-6 mt-2 px-1">
                <span className="text-xs font-bold text-slate-400 tracking-wider">Session Auth Required</span>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={auth.requiresAuth}
                    onChange={(e) => setAuth(prev => ({ ...prev, requiresAuth: e.target.checked }))}
                  />
                  <div className="w-12 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {auth.requiresAuth && (
                <div className="space-y-4 pt-4 border-t border-white/5 animate-fadeIn">
                  <IOSInput 
                    label="Identity Handle" 
                    placeholder="user@autoqa.agent"
                    value={auth.username || ''}
                    onChange={(e) => setAuth(prev => ({ ...prev, username: e.target.value }))} 
                  />
                  <IOSInput 
                    label="Secret Phrase" 
                    type="password" 
                    placeholder="••••••••"
                    value={auth.password || ''}
                    onChange={(e) => setAuth(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              )}

              <div className="mt-8">
                <IOSButton 
                  className="w-full" 
                  onClick={handleRunTest}
                  isLoading={status === TestStatus.GENERATING}
                  disabled={!url || executingIndex !== -1}
                >
                  Initiate Analysis
                </IOSButton>
              </div>
          </IOSCard>

          <IOSCard className="bg-teal-500/5 border-teal-500/10">
             <div className="flex items-start gap-3">
               <div className="bg-teal-400/20 text-teal-400 rounded-lg p-2 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <p className="text-[11px] text-teal-100/60 leading-relaxed font-medium">
                 AutoQA uses deep semantic analysis to map every interactive element and separate feature logic for modular testing.
               </p>
             </div>
          </IOSCard>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           {/* High-end Navigation Bar */}
           <div className="bg-white/5 p-1.5 rounded-2xl inline-flex w-fit backdrop-blur-xl border border-white/5 self-start shadow-2xl">
             <button 
               onClick={() => setActiveTab('results')}
               className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'results' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'text-slate-400 hover:text-teal-200'}`}
             >
               Pipeline
             </button>
             <button 
               onClick={() => setActiveTab('setup')}
               className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'setup' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'text-slate-400 hover:text-teal-200'}`}
             >
               Source
             </button>
             {report && (
               <button 
                 onClick={() => setActiveTab('report')}
                 className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 animate-fadeIn ${activeTab === 'report' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'text-slate-400 hover:text-teal-200'}`}
               >
                 Report
               </button>
             )}
           </div>

           <div className="flex-1 min-h-[600px]">
             {status === TestStatus.IDLE && (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 p-12 glass-card rounded-[40px] border-dashed border-2 border-white/5">
                 <div className="w-20 h-20 mb-6 bg-white/5 rounded-full flex items-center justify-center animate-bounce">
                   <svg className="w-10 h-10 text-teal-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </div>
                 <p className="font-bold text-white/50 tracking-wider">AUTOQA IS READY</p>
                 <p className="text-xs text-slate-500 mt-1">Specify an endpoint to start the automated discovery</p>
               </div>
             )}

             {status === TestStatus.GENERATING && (
               <IOSCard className="h-full flex flex-col items-center justify-center gap-8 min-h-[500px] border-teal-500/20">
                 <div className="relative">
                   <div className="w-20 h-20 border-4 border-teal-500/10 rounded-full"></div>
                   <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-400 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                   </div>
                 </div>
                 <div className="space-y-2 text-center">
                   <h3 className="text-xl font-black text-white tracking-tight">Mapping DOM Features</h3>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto">Building a resilient virtual test suite with autonomous feature identification...</p>
                 </div>
               </IOSCard>
             )}

             {status === TestStatus.COMPLETED && result && (
               <div className="space-y-6 animate-fadeIn">
                 {/* Fluid Summary Header */}
                 <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-10">
                      <svg className="w-40 h-40 text-teal-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"></path></svg>
                   </div>
                   <div className="relative z-10">
                     <span className="text-teal-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4 block">Discovery Context</span>
                     <h2 className="text-2xl font-black text-white mb-3">Feature Set Resolved</h2>
                     <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{result.summary}</p>
                   </div>
                 </div>

                 {activeTab === 'results' ? (
                   <IOSCard 
                     title="Execution Pipeline" 
                     className="min-h-[500px]"
                     action={
                       <IOSButton 
                         variant="primary" 
                         onClick={executeTestPlan}
                         disabled={executingIndex !== -1 || reportLoading}
                         className="py-2 px-6 text-[10px] h-10 tracking-widest uppercase"
                       >
                         {executingIndex !== -1 ? 'LIVE EXEC' : (reportLoading ? 'COMPILING REPORT' : (simulationComplete ? 'RE-DEPLOY' : 'DEPLOY PIPELINE'))}
                       </IOSButton>
                     }
                   >
                     <div className="space-y-0 mt-4">
                       {result.steps.map((step, index) => (
                         <div key={step.id} className="relative pl-12 pb-10 last:pb-0">
                           {/* Aqua Pulse Line */}
                           {index !== result.steps.length - 1 && (
                             <div className={`absolute left-[11px] top-8 bottom-0 w-[2px] transition-all duration-1000 ${
                               (simulationComplete || executingIndex > index) ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'bg-white/5'
                             }`}></div>
                           )}
                           
                           <div className="absolute left-0 top-1 transition-all duration-500 scale-125">
                             {getStepStatusIcon(index)}
                           </div>

                           <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-5 rounded-2xl border transition-all duration-500 ${
                             (executingIndex === index) ? 'bg-teal-500/10 border-teal-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : (executingIndex > index || simulationComplete) ? 'bg-white/5 border-white/5 opacity-80' : 'bg-transparent border-transparent opacity-30 scale-95'
                           }`}>
                             <div>
                               <h4 className="font-black text-white text-sm tracking-tight">{step.description}</h4>
                               <div className="flex items-center gap-2 mt-2">
                                 <span className="text-[10px] font-bold tracking-tighter text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">{step.action.toUpperCase()}</span>
                                 <code className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{step.selector}</code>
                               </div>
                             </div>
                             {step.value && (
                               <div className="bg-slate-950/80 border border-white/5 px-4 py-2 rounded-xl text-[11px] font-mono text-teal-400 self-start">
                                 INPUT: <span className="font-bold text-white">{step.value}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   </IOSCard>
                 ) : activeTab === 'report' && report ? (
                    <div className="grid grid-cols-1 gap-6 animate-fadeIn">
                      <IOSCard title="Executive Run Analysis" className="space-y-8">
                         <div className="border-b border-white/5 pb-8">
                           <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-4">Summary Conclusion</h4>
                           <p className="text-white leading-relaxed text-sm font-medium">{report.executiveSummary}</p>
                         </div>

                         <div>
                           <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-6">Verified Feature Sets</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {report.coverage.map((item, i) => (
                               <div key={i} className="flex items-center gap-3 bg-white/5 text-white px-4 py-3 rounded-2xl border border-white/5 text-xs font-bold transition-hover hover:border-teal-500/30">
                                 <div className="w-5 h-5 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center">
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                 </div>
                                 {item}
                               </div>
                             ))}
                           </div>
                         </div>
                      </IOSCard>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {report.screenshots.map((shot, i) => (
                          <MockScreenshot key={i} screenshot={shot} />
                        ))}
                      </div>

                      <IOSCard className="bg-gradient-to-br from-slate-900 to-emerald-950 border-white/10">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           Optimization Guidance
                         </h4>
                         <p className="text-teal-50/70 text-sm leading-relaxed font-medium">{report.recommendations}</p>
                      </IOSCard>
                    </div>
                 ) : (
                   <IOSCard title="Autonomous Source Code" className="p-0 overflow-hidden bg-slate-950/80">
                     <div className="max-h-[700px] overflow-auto custom-scrollbar">
                       <SyntaxHighlighter 
                        language="typescript" 
                        style={ghcolors}
                        customStyle={{ 
                          margin: 0, 
                          padding: '2rem', 
                          background: 'transparent', 
                          fontSize: '12px',
                          color: '#94a3b8'
                        }}
                       >
                         {result.playwrightCode}
                       </SyntaxHighlighter>
                     </div>
                     <div className="bg-slate-900/50 border-t border-white/5 p-5 flex justify-end backdrop-blur-md">
                       <IOSButton 
                         variant="secondary" 
                         onClick={() => navigator.clipboard.writeText(result.playwrightCode)}
                         className="text-[10px] tracking-widest uppercase py-3 px-6 h-auto"
                       >
                         Copy Logic to Clipboard
                       </IOSButton>
                     </div>
                   </IOSCard>
                 )}
               </div>
             )}

            {status === TestStatus.ERROR && (
               <IOSCard className="border-red-500/30 bg-red-950/20">
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                   </div>
                   <h3 className="text-white text-xl font-black mb-2">Process Interrupted</h3>
                   <p className="text-red-400/80 text-sm mb-8 max-w-sm mx-auto">The autonomous mapping failed to resolve the target structure. Verify the endpoint connectivity.</p>
                   <IOSButton variant="secondary" onClick={() => setStatus(TestStatus.IDLE)}>Retry Deployment</IOSButton>
                 </div>
               </IOSCard>
            )}
        </div>
      </div>
    </div>
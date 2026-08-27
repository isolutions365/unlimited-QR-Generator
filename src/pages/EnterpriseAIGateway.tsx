import React, { useState } from 'react';
import { useTranslation } from '../utils/i18n';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Shield, Cpu, Sliders, Play, Trash, Check, Copy, AlertCircle, 
  Settings, RefreshCw, Key, Code, HelpCircle, FileText, Database, Activity, 
  ToggleLeft, ToggleRight, Layers, Bell, Eye, EyeOff, Plus, ChevronRight, BarChart3,
  Globe, Info, AlertTriangle, ArrowLeft, Home
} from 'lucide-react';
import { 
  aiService, aiRegistry, QRHealthCenter, promptManager, 
  automationCenter, integrationHub, apiGateway, featureFlagSystem,
  AIProvider, AIModuleId, QRHealthConfig, QRHealthReport
} from '../lib/enterpriseAI';

interface EnterpriseAIGatewayProps {
  onBack: () => void;
  user: any;
  onSignInClick: () => void;
}

export default function EnterpriseAIGateway({
   onBack, user, onSignInClick }: EnterpriseAIGatewayProps) {
  const { t } = useTranslation();
  const [activeNavTab, setActiveNavTab] = useState<string>('architecture');
  
  // Provider state (Step 2)
  const [activeProvider, setActiveProvider] = useState<AIProvider>(aiService.getActiveProvider());
  const [promptInput, setPromptInput] = useState<string>(
    t('enterprise.defaultPromptInput', 'Harmonize a scan-safe high-end color palette for an airport luggage brand with terminal markers.')
  );
  const [generationOutput, setGenerationOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStats, setGenerationStats] = useState<any>(null);

  // Health audit state (Step 4)
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [moduleCount, setModuleCount] = useState<number>(29);
  const [quietZoneSize, setQuietZoneSize] = useState<number>(4);
  const [logoWidthPercent, setLogoWidthPercent] = useState<number>(15);
  const [healthReport, setHealthReport] = useState<QRHealthReport>(
    QRHealthCenter.runAudit({ fgColor: '#0f172a', bgColor: '#ffffff', moduleCount: 29, quietZoneSize: 4, logoWidthPercent: 15 })
  );

  // Prompt templates state (Step 5)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('qr_designer');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    brandType: t('enterprise.defaultBrandType', 'luxury watchmaker'),
    accentColor: '#4f46e5'
  });
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');

  // Automation states (Step 6)
  const [workflows, setWorkflows] = useState(automationCenter.getWorkflows());
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<string>('on_qr_created');
  const [newWorkflowAction, setNewWorkflowAction] = useState<string>('webhook');
  const [newWorkflowName, setNewWorkflowName] = useState<string>('');

  // API Gateway states (Step 8)
  const [apiKeys, setApiKeys] = useState(apiGateway.getKeys());
  const [newKeyLabel, setNewKeyLabel] = useState<string>('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Feature Flags (Step 9)
  const [featureFlags, setFeatureFlags] = useState(featureFlagSystem.getFlags());

  // Security layer logs (Step 10)
  const [securityLogs, setSecurityLogs] = useState<any[]>([
    { timestamp: t('enterprise.logJustNow', 'Just now'), action: 'API_KEY_AUTH', status: 'SUCCESS', details: t('enterprise.logDetailsKeyAuth', 'Key masked (api_key_01) validated. Rate limit (enterprise_high) holds.'), severity: 'info' },
    { timestamp: t('enterprise.logThreeMinsAgo', '3 mins ago'), action: 'PROMPT_INPUT_CHECK', status: 'PASSED', details: t('enterprise.logDetailsPromptCheck', 'No command-injection heuristics detected on user query.'), severity: 'info' },
    { timestamp: t('enterprise.logTenMinsAgo', '10 mins ago'), action: 'PROVIDER_ROUTE', status: 'ROUTED', details: t('enterprise.logDetailsProviderRoute', 'Rerouted model target to server-side Gemini 3.5 node cluster.'), severity: 'info' },
    { timestamp: t('enterprise.logOneHourAgo', '1 hour ago'), action: 'RATE_LIMIT_CHECK', status: 'WARNING', details: t('enterprise.logDetailsRateLimitWarning', 'IP subnet 198.51.100.42 reached 85% of standard allowance.'), severity: 'warning' },
  ]);

  // Handle Provider Switch
  const handleProviderSwitch = (provider: AIProvider) => {
    aiService.setActiveProvider(provider);
    setActiveProvider(provider);
    addSecurityLog('PROVIDER_SWITCH', 'SUCCESS', t('enterprise.providerSwitchSuccessLog', 'Active LLM inference target switched to {{provider}}', { provider: provider.toUpperCase() }));
  };

  // Run Playground text generation (Mock framework simulation)
  const handlePlaygroundGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationOutput('');
    addSecurityLog('PLAYGROUND_GENERATE_START', 'IN_PROGRESS', t('enterprise.playgroundGenerateStartLog', 'Query sent to provider: {{provider}}', { provider: activeProvider }));
    
    setTimeout(async () => {
      const res = await aiService.generateText({ prompt: promptInput });
      setGenerationOutput(res.text);
      setGenerationStats({
        latency: res.latencyMs,
        tokens: res.usage.totalTokens,
        model: res.modelVersion
      });
      setIsGenerating(false);
      addSecurityLog('PLAYGROUND_GENERATE_COMPLETE', 'SUCCESS', t('enterprise.playgroundGenerateCompleteLog', 'Returned {{tokens}} tokens in {{latency}}ms via {{model}}', { tokens: res.usage.totalTokens, latency: res.latencyMs, model: res.modelVersion }));
    }, 850);
  };

  // Run QR Code Diagnostic Heuristics
  const triggerHealthAudit = () => {
    const report = QRHealthCenter.runAudit({
      fgColor,
      bgColor,
      moduleCount,
      quietZoneSize,
      logoWidthPercent
    });
    setHealthReport(report);
    addSecurityLog('QR_HEALTH_AUDIT', 'SUCCESS', t('enterprise.qrHealthAuditLog', 'Run heuristic metrics scan. Contrast: {{contrast}}:1. Score: {{score}}/100.', { contrast: report.contrastRatio.toFixed(2), score: report.overallScore }));
  };

  // Compile prompt variables
  const handleCompilePrompt = (templateId: string) => {
    const temp = promptManager.getTemplates().find(t => t.id === templateId);
    if (!temp) return;
    
    let text = temp.userPromptTemplate;
    Object.entries(variableValues).forEach(([key, val]) => {
      text = text.replace(`{${key}}`, val || `{${key}}`);
    });
    setCompiledPrompt(text);
  };

  // Add Workflow
  const handleAddWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!((val) => (val || '').trim())(newWorkflowName)) return;
    const newW = {
      id: `w_${Date.now()}`,
      name: newWorkflowName,
      trigger: newWorkflowTrigger as any,
      actionType: newWorkflowAction as any,
      actionConfig: { url: 'https://hooks.corporate-gateway.net/callback' },
      isEnabled: true
    };
    automationCenter.addWorkflow(newW);
    setWorkflows([...workflows, newW]);
    setNewWorkflowName('');
    addSecurityLog('WORKFLOW_REGISTER', 'SUCCESS', t('enterprise.workflowRegisterLog', 'Created custom automation workflow: "{{name}}"', { name: newWorkflowName }));
  };

  // Toggle Feature Flag
  const toggleFlag = (flag: string) => {
    featureFlagSystem.toggleFlag(flag);
    setFeatureFlags({ ...featureFlagSystem.getFlags() });
    addSecurityLog('FEATURE_FLAG_TOGGLE', 'SUCCESS', t('enterprise.featureFlagToggleLog', 'Feature flag "{{flag}}" state modified.', { flag }));
  };

  // Generate API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!((val) => (val || '').trim())(newKeyLabel)) return;
    const newK = apiGateway.generateNewKey(newKeyLabel);
    setApiKeys([...apiKeys, newK]);
    setNewKeyLabel('');
    addSecurityLog('API_KEY_CREATE', 'SUCCESS', t('enterprise.apiKeyCreateLog', 'Generated secure system credential: "{{label}}"', { label: newKeyLabel }));
  };

  const addSecurityLog = (action: string, status: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    setSecurityLogs(prev => [
      { timestamp: t('enterprise.logJustNow', 'Just now'), action, status, details, severity },
      ...prev
    ]);
  };

  const copyKeyText = (keyId: string, masked: string) => {
    navigator.clipboard.writeText(masked.replace(/•/g, '0')).catch(() => {});
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white py-2.5 px-4 rounded-xl border border-slate-100 shadow-2xs">
        <button 
          onClick={onBack} 
          className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('common.home', 'Home')}</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-bold">{t('enterprise.gatewayLabel', 'Enterprise Gateway')}</span>
      </nav>

      {/* 1. HEADER SECTION (Aesthetic Pairing & Negatives space) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 py-0.5 px-2 rounded-md">
                  {t('enterprise.gatewayLabel', 'Enterprise Gateway')}
                </span>
                <span className="text-[10px] font-bold font-mono uppercase bg-emerald-50 border border-emerald-200 text-emerald-700 py-0.5 px-2 rounded-md">
                  {t('enterprise.architecturePhase', 'Architecture Phase')}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase mt-0.5">
                {t('enterprise.developerHubTitle', 'Developer Hub & AI Core')}
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-2xl">
            {t('enterprise.developerHubDesc', "Audit, simulate, and configure FreeQRGen.pro's enterprise AI pipeline routing, real-time diagnostic safety centers, automated CRM webhooks, developer api keys, and modular system toggles.")}
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="flex items-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('enterprise.exitHub', 'Exit Developer Hub')}</span>
        </button>
      </div>

      {/* 2. MAIN BENTO DIVISION */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="w-full lg:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 shrink-0 shadow-xl">
          <div className="mb-4 border-b border-slate-800 pb-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
              {t('enterprise.platformNodes', 'Platform Nodes')}
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { id: 'architecture', label: t('enterprise.tabAIServiceLayer', 'AI Service Layer'), icon: Cpu, badge: t('enterprise.badgeStep2', 'Step 2') },
              { id: 'registry', label: t('enterprise.tabAIModuleRegistry', 'AI Module Registry'), icon: Layers, badge: t('enterprise.badgeStep3', 'Step 3') },
              { id: 'health', label: t('enterprise.tabQRHealthCenter', 'QR Health Center'), icon: Activity, badge: t('enterprise.badgeStep4', 'Step 4') },
              { id: 'prompt', label: t('enterprise.tabPromptCRMFlows', 'Prompt & CRM Flows'), icon: Sliders, badge: t('enterprise.badgeSteps5to6', 'Steps 5-6') },
              { id: 'integration', label: t('enterprise.tabIntegrationHub', 'Integration Hub'), icon: Globe, badge: t('enterprise.badgeStep7', 'Step 7') },
              { id: 'gateway', label: t('enterprise.tabAPIKeysGateway', 'API Keys & Gateway'), icon: Key, badge: t('enterprise.badgeStep8', 'Step 8') },
              { id: 'flags', label: t('enterprise.tabFlagsSecurity', 'Flags & Security'), icon: Shield, badge: t('enterprise.badgeSteps9to10', 'Steps 9-10') },
              { id: 'reports', label: t('enterprise.tabArchitecturalReports', 'Architectural Reports'), icon: FileText, badge: t('enterprise.badgeSteps11to13', 'Steps 11-13') },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-left border ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30' 
                      : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Reused Systems Audit Checklist */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono block mb-3">
              {t('enterprise.reusedCoreModules', 'Reused Core Modules')}
            </span>
            <div className="space-y-1.5">
              {[
                t('enterprise.modAuth', 'Authentication'),
                t('enterprise.modRouting', 'Routing Infrastructure'),
                t('enterprise.modSeo', 'Enterprise SEO Configs'),
                t('enterprise.modI18n', 'Internationalization Engine'),
                t('enterprise.modNotifications', 'Active Notification center'),
                t('enterprise.modProfiles', 'User Profiles DB Sync'),
                t('enterprise.modLedger', 'Community Hub Ledger')
              ].map((sys) => (
                <div key={sys} className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-950/50 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="truncate">{sys}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Display Panel Container */}
        <main className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-h-[550px] text-left">
          
          {/* TAB 1: AI SERVICE LAYER */}
          {activeNavTab === 'architecture' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.step2Spec', 'Step 2 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.serviceLayerTitle', 'Enterprise AI Service Layer Routing')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.serviceLayerDesc', 'Decouple AI pipelines from user interfaces. Support direct hot-switching between core global intelligence providers while remaining compliant with strict cloud sandboxing requirements.')}
                </p>
              </div>

              {/* Provider Grid Selector */}
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 font-mono mb-3">
                  {t('enterprise.selectProviderNodes', 'Select Intelligence Provider Nodes')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aiService.getProviders().map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleProviderSwitch(p.id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                        activeProvider === p.id 
                          ? 'border-indigo-600 bg-indigo-50/25 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cpu className={`w-4 h-4 ${activeProvider === p.id ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-800 font-mono uppercase">{p.id}</span>
                        </div>
                        {activeProvider === p.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 block">{p.name}</span>
                      <span className="text-[10px] font-mono font-medium text-slate-400 mt-1 block">
                        {t('enterprise.keyLabel', 'Key')}: {p.apiKeyEnvVar}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playground Simulator */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4.5 h-4.5 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                    {t('enterprise.inferencePlayground', 'AI Service Inference Playground')}
                  </h3>
                </div>

                <form onSubmit={handlePlaygroundGenerate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.diagnosticPromptLabel', 'Interactive Diagnostic Prompt')}
                    </label>
                    <input 
                      type="text" 
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:border-indigo-500 font-sans"
                      placeholder={t('enterprise.testingPromptsPlaceholder', 'Enter testing prompts...')}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t('enterprise.activeLabel', 'Active:')} <strong className="text-indigo-600 uppercase">{activeProvider}</strong> {t('enterprise.noApiCosts', '(No API costs incurred)')}
                    </span>
                    <button 
                      type="submit" 
                      disabled={isGenerating}
                      className="py-2 px-4.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('enterprise.routingQuery', 'Routing Query...')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{t('enterprise.executeInference', 'Execute Inference')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Outputs section */}
                <AnimatePresence>
                  {generationOutput && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 pt-4 border-t border-slate-200 text-left space-y-2"
                    >
                      <span className="text-[9px] font-black font-mono uppercase bg-slate-200 py-0.5 px-2 rounded-sm text-slate-600">
                        {t('enterprise.responsePayload', 'Response Payload')}
                      </span>
                      <p className="text-xs font-mono bg-white p-3 border border-slate-200 rounded-xl leading-relaxed text-slate-700">
                        {generationOutput}
                      </p>
                      
                      {generationStats && (
                        <div className="flex gap-4 text-[10px] text-slate-400 font-mono pt-1">
                          <span>{t('enterprise.latencyLabel', 'Latency:')} <strong>{generationStats.latency}{t('enterprise.latencyUnitMs', 'ms')}</strong></span>
                          <span>{t('enterprise.usageLabel', 'Usage:')} <strong>{generationStats.tokens} {t('enterprise.tokens', 'tokens')}</strong></span>
                          <span>{t('enterprise.modelNodeLabel', 'Model Node:')} <strong>{generationStats.model}</strong></span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODULE REGISTRY */}
          {activeNavTab === 'registry' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.step3Spec', 'Step 3 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.moduleRegistryTitle', 'AI Module Registry Ledger')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.moduleRegistryDesc', 'Decoupled directory configuration maps feature requirements and license tiers, permitting modular on-demand injection of complex cognitive layers.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRegistry.getModules().map((m) => (
                  <div key={m.id} className="p-4 border border-slate-200 bg-white hover:border-slate-300 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-[9px] font-extrabold uppercase font-mono bg-slate-100 text-slate-500 py-0.5 px-2 rounded">
                          {m.category}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase font-mono py-0.5 px-2 rounded ${
                          m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          m.status === 'beta' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          m.status === 'experimental' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {m.status}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase font-mono bg-indigo-50 text-indigo-700 py-0.5 px-2 rounded border border-indigo-100 ml-auto">
                          {m.tierRequired}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{m.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">{m.description}</p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{t('enterprise.injectedEndpoint', 'Injected Endpoint:')}</span>
                      <span className="font-bold text-slate-600">/api/ai/module/{m.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QR HEALTH CENTER */}
          {activeNavTab === 'health' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.step4Spec', 'Step 4 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.healthCenterTitle', 'QR Code Health Center Simulator')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.healthCenterDesc', 'Advanced validation engine running pre-print contrast sweeps, quiet-zone padding audits, and logo-overlay area analysis to guarantee perfect physical scans globally.')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Configuration Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight border-b border-slate-200 pb-2">
                    {t('enterprise.targetParameters', 'Target Parameters')}
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.fgColorLabel', 'Modules Color (Foreground)')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 text-xs border border-slate-200 rounded-xl p-2 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.bgColorLabel', 'Background Color')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 text-xs border border-slate-200 rounded-xl p-2 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.quietZoneLabel', 'Quiet Zone Padding (modules)')}
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={quietZoneSize}
                      onChange={(e) => setQuietZoneSize(Number(e.target.value))}
                      className="w-full accent-indigo-600 mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{t('enterprise.modulesZero', '0 modules')}</span>
                      <span className="font-bold text-indigo-600">
                        {t('enterprise.modulesCount', '{{count}} modules', { count: quietZoneSize })}
                      </span>
                      <span>{t('enterprise.modulesTen', '10 modules')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.logoSizeLabel', 'Center Logo Overlay Size')}
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={logoWidthPercent}
                      onChange={(e) => setLogoWidthPercent(Number(e.target.value))}
                      className="w-full accent-indigo-600 mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{t('enterprise.nonePercent', '0% (None)')}</span>
                      <span className="font-bold text-indigo-600">{logoWidthPercent}%</span>
                      <span>{t('enterprise.fortyPercent', '40%')}</span>
                    </div>
                  </div>

                  <button
                    onClick={triggerHealthAudit}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('enterprise.recalculateDiagnostics', 'Recalculate Diagnostics')}
                  </button>
                </div>

                {/* Report Outputs */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                        {t('enterprise.integrityReportTitle', 'Active Scan Integrity Report')}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">
                          {t('enterprise.overallHealth', 'Overall Health:')}
                        </span>
                        <span className={`text-sm font-black font-mono ${
                          healthReport.overallScore >= 90 ? 'text-emerald-600' :
                          healthReport.overallScore >= 70 ? 'text-amber-500' :
                          'text-red-500'
                        }`}>
                          {healthReport.overallScore}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{healthReport.recommendationSummary}"
                    </p>

                    {/* Progress score bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          healthReport.overallScore >= 90 ? 'bg-emerald-500' :
                          healthReport.overallScore >= 70 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${healthReport.overallScore}%` }}
                      />
                    </div>

                    {/* Safe physical print size advisor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">
                          {t('enterprise.minPrintWidth', 'Min Physical Print Width')}
                        </span>
                        <span className="text-sm font-black text-slate-800 mt-1 block">
                          {Math.max(2, Math.ceil(moduleCount * 0.8))} {t('enterprise.mmDpi', 'mm (DPI 300)')}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">
                          {t('enterprise.recommendedDistance', 'Recommended Distance')}
                        </span>
                        <span className="text-sm font-black text-slate-800 mt-1 block">
                          {((Math.max(2, Math.ceil(moduleCount * 0.8)) * 10) / 100).toFixed(1)} {t('enterprise.cmMaxRangeSuffix', 'cm maximum range')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic ledger lists */}
                  <div className="space-y-2">
                    {healthReport.diagnostics.map((diag, index) => (
                      <div key={index} className="p-3.5 border border-slate-200 bg-white rounded-xl flex gap-3 items-start">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          diag.status === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                          diag.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          <Info className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{diag.category}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-sm ${
                              diag.status === 'pass' ? 'bg-emerald-100 text-emerald-800' :
                              diag.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {diag.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{diag.message}</p>
                          <p className="text-[10px] font-bold text-indigo-600 mt-1">
                            🔧 {t('enterprise.recommendationPrefix', 'Recommendation:')} {diag.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: PROMPT & AUTOMATION */}
          {activeNavTab === 'prompt' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.steps56Spec', 'Steps 5-6 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.promptsCRMTitle', 'AI Prompts & CRM Automation')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.promptsCRMDesc', 'Define corporate system prompt templates with sandbox variable compilers and register asynchronous callback triggers tied directly to core platform activities.')}
                </p>
              </div>

              {/* Sub bento grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Prompt Compiler */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                      {t('enterprise.promptCompilerTitle', 'Prompt Template Compiler')}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.selectSystemBlueprint', 'Select System Blueprint')}
                    </label>
                    <select 
                      value={selectedTemplateId} 
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value);
                        setCompiledPrompt('');
                      }}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-500"
                    >
                      {promptManager.getTemplates().map(t => (
                        <option key={t.id} value={t.id}>{t.name} (v{t.currentVersion})</option>
                      ))}
                    </select>
                  </div>

                  {/* Render Variable Inputs */}
                  {promptManager.getTemplates().filter(t => t.id === selectedTemplateId).map(temp => (
                    <div key={temp.id} className="space-y-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 space-y-1.5 border border-slate-100">
                        <span className="font-extrabold uppercase font-mono text-[9px] text-slate-400 block">
                          {t('enterprise.systemInstruction', 'System Instruction:')}
                        </span>
                        <p>{temp.systemInstruction}</p>
                        <span className="font-extrabold uppercase font-mono text-[9px] text-slate-400 block pt-1">
                          {t('enterprise.userTemplate', 'User Template:')}
                        </span>
                        <p className="font-mono text-[10px] text-indigo-600">{temp.userPromptTemplate}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
                          {t('enterprise.defineVariableOverrides', 'Define Variable Overrides')}
                        </span>
                        {temp.variables.map(v => (
                          <div key={v} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 w-24 shrink-0">{v}:</span>
                            <input 
                              type="text"
                              value={variableValues[v] || ''}
                              onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                              placeholder={t('enterprise.enterVar', 'Enter {{variable}}', { variable: v })}
                              className="flex-1 text-xs border border-slate-200 rounded-xl p-1.5 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCompilePrompt(temp.id)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        {t('enterprise.compilePromptBlueprint', 'Compile Prompt Blueprint')}
                      </button>

                      {compiledPrompt && (
                        <div className="pt-2">
                          <span className="text-[9px] font-black font-mono uppercase text-indigo-600 block mb-1">
                            {t('enterprise.compiledPromptOutput', 'Compiled Prompt Target Output')}
                          </span>
                          <p className="text-xs font-mono bg-indigo-50/30 p-2.5 border border-indigo-100/50 rounded-xl text-slate-700">
                            {compiledPrompt}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CRM Workflows */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Bell className="w-4.5 h-4.5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                      {t('enterprise.crmWorkflowsTitle', 'CRM Automation Workflows')}
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {workflows.map(w => (
                      <div key={w.id} className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{w.name}</span>
                            <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 py-0.2 px-1 rounded-sm">{w.actionType}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            {t('enterprise.triggerLabel', 'Trigger:')} {w.trigger}
                          </p>
                        </div>
                        <span 
                          className={`w-2 h-2 rounded-full shrink-0 ${w.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                          title={w.isEnabled ? t('enterprise.activeWorkflow', 'Active Workflow') : t('enterprise.disabledWorkflow', 'Disabled')} 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Register Workflow */}
                  <form onSubmit={handleAddWorkflow} className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
                      {t('enterprise.registerTriggerCallback', 'Register System Trigger Callback')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase">
                          {t('enterprise.triggerScenario', 'Trigger Scenario')}
                        </label>
                        <select 
                          value={newWorkflowTrigger} 
                          onChange={(e) => setNewWorkflowTrigger(e.target.value)}
                          className="w-full text-[11px] border border-slate-200 rounded-xl p-2 bg-white"
                        >
                          <option value="on_qr_created">{t('enterprise.optAfterQrCreated', 'After QR Created')}</option>
                          <option value="on_qr_downloaded">{t('enterprise.optAfterDownload', 'After Download')}</option>
                          <option value="on_user_registered">{t('enterprise.optAfterRegistration', 'After Registration')}</option>
                          <option value="on_newsletter_signup">{t('enterprise.optNewsletterSignup', 'Newsletter Signup')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase">
                          {t('enterprise.actionNode', 'Action Node')}
                        </label>
                        <select 
                          value={newWorkflowAction} 
                          onChange={(e) => setNewWorkflowAction(e.target.value)}
                          className="w-full text-[11px] border border-slate-200 rounded-xl p-2 bg-white"
                        >
                          <option value="webhook">{t('enterprise.optRestWebhook', 'REST Webhook URL')}</option>
                          <option value="email">{t('enterprise.optSmtpEmail', 'SMTP Email Trigger')}</option>
                          <option value="analytics">{t('enterprise.optGoogleAnalytics', 'Google Analytics')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                        {t('enterprise.workflowName', 'Workflow Name')}
                      </label>
                      <input 
                        type="text" 
                        value={newWorkflowName}
                        onChange={(e) => setNewWorkflowName(e.target.value)}
                        placeholder={t('enterprise.workflowPlaceholder', 'e.g. Sync new registrants to Slack channel')}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('enterprise.registerAutomationBlueprint', 'Register Automation Blueprint (+15 XP)')}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: ENTERPRISE INTEGRATION HUB */}
          {activeNavTab === 'integration' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.step7Spec', 'Step 7 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.integrationHubTitle', 'Enterprise Integration Hub')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.integrationHubDesc', 'Pre-compiled pipelines mapped directly for enterprise hubs, executing live background webhooks with built-in retry schedules.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {integrationHub.getConnectors().map((c) => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{c.name}</span>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full font-mono border ${
                          c.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          c.status === 'disconnected' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {t('enterprise.configParams', 'Config parameters:')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {c.configParams.map(param => (
                            <span key={param} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 rounded py-0.5 px-1.5 font-sans">
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{t('enterprise.statusNode', 'Status Node:')}</span>
                      <span className={c.status === 'connected' ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {c.status === 'connected' ? t('enterprise.activeIntegrationLink', 'Active Integration Link') : t('enterprise.dormant', 'Dormant')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Webhook Delivery Simulator */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="text-xs font-black tracking-widest text-indigo-400 font-mono uppercase">
                      {t('enterprise.webhookSimulatorTitle', 'Webhook Response Payload Simulator')}
                    </span>
                  </div>
                  <span className="text-[9px] bg-indigo-950 border border-indigo-800 text-indigo-300 py-0.5 px-2 rounded font-mono">POST /v1/webhook</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {t('enterprise.simulateEventBody', 'Simulate Event Body:')}
                    </span>
                    <pre className="text-[10px] font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-400 leading-relaxed overflow-x-auto">
{`{
  "event": "qr.created",
  "timestamp": "${new Date().toISOString()}",
  "workspace_id": "ws_9ff96fc3054b",
  "data": {
    "qr_id": "qr_08173491",
    "target_url": "https://www.freeqrbarcodes.com/solutions/retail",
    "fg_color": "#0f172a",
    "accessibility_compliant": true
  }
}`}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {t('enterprise.targetReceiverHeaders', 'Target Receiver Headers:')}
                    </span>
                    <pre className="text-[10px] font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed overflow-x-auto">
{`HTTP/1.1 200 OK
Content-Type: application/json
X-FreeQRGen-Signature: f9a20... [HMAC-SHA256]
X-Webhook-Retry-Attempt: 0
X-Subscription-Tier: Enterprise-High

{
  "status": "delivered",
  "delivered_to": "https://zapier.com/hooks/...",
  "status_code": 200
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: API KEYS & GATEWAY */}
          {activeNavTab === 'gateway' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.step8Spec', 'Step 8 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.apiGatewayTitle', 'Enterprise API Gateway Credentials')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.apiGatewayDesc', 'Establish authorization credentials to allow corporate servers to bypass default rate-limiting mechanisms and interface directly with our high-speed routing services.')}
                </p>
              </div>

              {/* API Key management lists */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight border-b border-slate-200 pb-2 mb-4">
                    {t('enterprise.activeApiCredentials', 'Active System API Credentials')}
                  </h3>
                  
                  <div className="space-y-3">
                    {apiKeys.map(key => (
                      <div key={key.keyId} className="bg-white p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">{key.label}</span>
                            <span className="text-[8px] bg-slate-100 py-0.2 px-1.5 rounded text-slate-400 font-mono font-bold uppercase">{key.rateLimitTier}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {t('enterprise.createdLabel', 'Created:')} {key.created.toLocaleDateString()} • {t('enterprise.maskedLabel', 'Masked:')} {key.maskedKey}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            {t('enterprise.callsLabel', 'Calls:')} <strong>{key.usageCount}</strong>
                          </span>
                          <button
                            onClick={() => copyKeyText(key.keyId, key.maskedKey)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors border border-slate-100 shrink-0"
                            title={t('enterprise.copySimulatedKey', 'Copy Simulated Key')}
                          >
                            {copiedKeyId === key.keyId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate New Credentials */}
                <form onSubmit={handleCreateApiKey} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 text-left w-full">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">
                      {t('enterprise.createSystemCredential', 'Create System Credential Token')}
                    </label>
                    <input 
                      type="text" 
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      placeholder={t('enterprise.apiKeyPlaceholder', 'e.g. AWS Lambda Ingress API Client')}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {t('enterprise.generateApiToken', 'Generate API Token (+10 XP)')}
                  </button>
                </form>
              </div>

              {/* GraphQL / REST specs mapping */}
              <div className="border border-slate-200 bg-slate-50 rounded-2xl p-5 space-y-3 text-left">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-200 py-0.5 px-2 rounded text-slate-600">
                  {t('enterprise.specOutline', 'Enterprise Specification Outline')}
                </span>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  {t('enterprise.endpointSchemas', 'Standardized Endpoint Schemas')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-white p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {t('enterprise.restEndpoints', 'REST Architecture Endpoints')}
                    </span>
                    <ul className="space-y-1 mt-2 text-slate-600">
                      <li>• GET <span className="font-bold">/v1/qr</span> - {t('enterprise.queryMetadataDesc', 'Query metadata list')}</li>
                      <li>• POST <span className="font-bold">/v1/qr</span> - {t('enterprise.createDynamicMatrixDesc', 'Create custom dynamic matrix')}</li>
                      <li>• GET <span className="font-bold">/v1/qr/:id/analytics</span> - {t('enterprise.getCountsDesc', 'Get counts')}</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {t('enterprise.graphqlSchema', 'GraphQL Schema Query Node')}
                    </span>
                    <pre className="text-[9px] text-indigo-600 mt-2 overflow-x-auto whitespace-pre-wrap">
{`type Query {
  qrCode(id: ID!): QrCodeNode
  analytics(qrId: ID!): UsageMetricPayload
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FLAGS & SECURITY */}
          {activeNavTab === 'flags' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.steps910Spec', 'Steps 9-10 Specification')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.flagsSecurityTitle', 'Feature Flags & Security Center')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.flagsSecurityDesc', 'Toggle target environments safely. The security ledger monitors and alerts system operations in real-time, checking validation credentials.')}
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Feature flags board */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                      {t('enterprise.activeFeatureFlags', 'Active System Feature Flags')}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(featureFlags).map(([flag, isEnabled]) => (
                      <div key={flag} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700 font-mono uppercase">{flag.replace(/_/g, ' ')}</span>
                        <button
                          onClick={() => toggleFlag(flag)}
                          className="text-indigo-600 hover:text-indigo-800 transition-transform active:scale-[0.98]"
                        >
                          {isEnabled ? (
                            <ToggleRight className="w-8 h-8 text-indigo-600" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security logs and isolation */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Shield className="w-4.5 h-4.5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
                      {t('enterprise.securityLogTrail', 'Active Security Log Trail')}
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {securityLogs.map((log, index) => (
                      <div key={index} className="p-2.5 border border-slate-150 rounded-lg text-xs flex gap-2 items-start bg-slate-50/50">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                          log.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                          log.severity === 'warning' ? 'bg-amber-500 animate-pulse' :
                          'bg-indigo-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                            <span className="font-bold uppercase">{log.action}</span>
                            <span>{log.timestamp}</span>
                          </div>
                          <p className="text-[11px] font-mono font-medium text-slate-600 mt-0.5 break-words">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: ARCHITECTURAL REPORTS */}
          {activeNavTab === 'reports' && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 py-1 px-2.5 rounded-full text-slate-500">
                  {t('enterprise.steps1113Spec', 'Steps 11-13 Specifications')}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-2">
                  {t('enterprise.auditReportsTitle', 'Enterprise Architectural Audit Reports')}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('enterprise.auditReportsDesc', 'Review complete specifications, performance statistics, and roadmap milestones validated by our Chief AI Architect node.')}
                </p>
              </div>

              {/* Accordion List for Reports */}
              <div className="space-y-4">
                {[
                  {
                    title: t('enterprise.report1Title', 'AI Architecture & Module Routing Report (Step 2 & 3)'),
                    content: t('enterprise.report1Content', 'Core AI service layers are fully decoupled from components. Standard named interfaces guarantee complete vendor portability. The system automatically handles local model fallbacks if remote SaaS pipelines fail. Dynamic module registries resolve and bundle splitting limits initial load metrics, securing Lighthouse scores above 95%.')
                  },
                  {
                    title: t('enterprise.report2Title', 'CRM Automation & Integration Hub Report (Step 5, 6 & 7)'),
                    content: t('enterprise.report2Content', 'Supports asynchronous trigger callback hooks mapping core state activities (on_qr_created, on_qr_downloaded) directly onto corporate webhook systems. Secret sign keys protect delivered webhook frames. Out-of-the-box support for corporate hubs (Zapier, Slack, Make) requires zero manual configuration overrides.')
                  },
                  {
                    title: t('enterprise.report3Title', 'API Gateway & Security Layer Compliance (Step 8 & 10)'),
                    content: t('enterprise.report3Content', 'Establish secure key life cycle controllers. API metrics logs, consumption credits counters, and relative tier limits are enforced programmatically. Sandbox rate checkers protect endpoints from command-injection attempts and abuse anomalies.')
                  },
                  {
                    title: t('enterprise.report4Title', 'Lighthouse & Performance Report (Step 12)'),
                    content: t('enterprise.report4Content', 'No AI intelligence libraries are loaded in the primary browser bundle. All cognitive components, prompt templates, and diagnostics calculations are lazy-loaded on-demand through clean path splits. Bundle-splitting ensures that non-administrative clients load only core layout bundles.')
                  },
                  {
                    title: t('enterprise.report5Title', 'Future AI Roadmap Strategy'),
                    content: t('enterprise.report5Content', 'Milestone 1: Incorporate real-time camera validation feedback matrices. Milestone 2: Establish vector error-correction models optimized for small print tags. Milestone 3: Roll out generative color advisors paired with localized language matrices.')
                  }
                ].map((item, index) => (
                  <div key={index} className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-left">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
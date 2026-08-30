import React, { useEffect, useState } from 'react';

interface DiagnosticReport {
  timestamp: string;
  hasServerFallbackBeforeMount: boolean;
  hasServerFallbackAfterMount: boolean;
  isRootMounted: boolean;
  rootChildCount: number;
  containsQrWorkspace: boolean;
  containsChartsOrCanvas: boolean;
  noscriptNodesCount: number;
  hydrationStatus: 'SUCCESS' | 'MISMATCH_DETECTED' | 'HALTED';
  mountTimeMs: number;
}

export const HydrationDiagnostic: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);

  useEffect(() => {
    const mountStart = performance.now();
    const initialHtml = document.body.innerHTML;
    const hadFallbackAtStart = initialHtml.includes('app-loading-fallback') || initialHtml.includes('Loading QR Studio');

    // Clean up loading fallback element on React mount
    const fallbackNode = document.getElementById('app-loading-fallback');
    if (fallbackNode && fallbackNode.parentNode) {
      fallbackNode.parentNode.removeChild(fallbackNode);
    }

    // Run hydration check after microtask & layout frame to allow initial DOM paint
    const checkTimer = setTimeout(() => {
      const currentHtml = document.body.innerHTML;
      const rootElement = document.getElementById('root');
      const hasFallbackNow = document.getElementById('app-loading-fallback') !== null;
      const rootChildCount = rootElement ? rootElement.children.length : 0;

      const hasQrWorkspace =
        currentHtml.includes('qr-canvas') ||
        currentHtml.includes('QR Code') ||
        currentHtml.includes('generator') ||
        document.querySelector('canvas, svg') !== null;

      const hasCharts =
        document.querySelector('.recharts-wrapper, svg.recharts-surface') !== null ||
        currentHtml.includes('recharts');

      const noscriptNodes = document.querySelectorAll('noscript').length;
      const mountDuration = Math.round(performance.now() - mountStart);

      const status: 'SUCCESS' | 'MISMATCH_DETECTED' | 'HALTED' =
        !hasFallbackNow && rootChildCount > 0
          ? 'SUCCESS'
          : hasFallbackNow
          ? 'HALTED'
          : 'MISMATCH_DETECTED';

      const report: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        hasServerFallbackBeforeMount: hadFallbackAtStart,
        hasServerFallbackAfterMount: hasFallbackNow,
        isRootMounted: !!rootElement && rootChildCount > 0,
        rootChildCount,
        containsQrWorkspace: hasQrWorkspace,
        containsChartsOrCanvas: hasCharts,
        noscriptNodesCount: noscriptNodes,
        hydrationStatus: status,
        mountTimeMs: mountDuration,
      };

      setDiagnosticReport(report);

      console.group('%c[Hydration Diagnostic] Client Render & Hydration Audit', 'color: #4f46e5; font-weight: bold;');
      console.log('Status:', report.hydrationStatus === 'SUCCESS' ? '✅ SUCCESS' : '⚠️ ' + report.hydrationStatus);
      console.log('Mount Duration:', `${report.mountTimeMs}ms`);
      console.log('Server Template Fallback Pre-Mount:', report.hasServerFallbackBeforeMount ? 'Detected' : 'None');
      console.log('Server Template Fallback Post-Mount:', report.hasServerFallbackAfterMount ? 'STILL PRESENT (HALTED)' : 'Cleanly Replaced');
      console.log('Root DOM Container Status:', report.isRootMounted ? `Active (${report.rootChildCount} root node(s))` : 'Empty');
      console.log('QR Generator / Canvas Rendered:', report.containsQrWorkspace ? 'Yes' : 'Pending');
      console.log('Charts / SVG Visualizers Present:', report.containsChartsOrCanvas ? 'Yes' : 'None in current view');
      console.log('Noscript SEO Nodes Count:', report.noscriptNodesCount);
      console.groupEnd();
    }, 50);

    return () => clearTimeout(checkTimer);
  }, []);

  return (
    <>
      {children}
      {/* Hidden diagnostic marker element for automated DOM inspection */}
      {diagnosticReport && (
        <div
          id="hydration-diagnostic-marker"
          data-status={diagnosticReport.hydrationStatus}
          data-mount-time={diagnosticReport.mountTimeMs}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
};

export default HydrationDiagnostic;

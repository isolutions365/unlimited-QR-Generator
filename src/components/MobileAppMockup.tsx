import React, { useState } from 'react';
import { Smartphone, Code, Cpu, SmartphoneIcon } from 'lucide-react';

export default function MobileAppMockup() {
  const [activeTab, setActiveTab] = useState<'rn' | 'flutter'>('rn');

  const rnCode = `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

export default function ScannerApp() {
  const devices = useCameraDevices();
  const device = devices.back;

  if (device == null) return <LoadingView />;
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      codeScanner={{
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
          console.log('Scanned QR:', codes[0].value);
        }
      }}
    />
  );
}`;

  const flutterCode = `import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScannerScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: MobileScanner(
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
          for (final barcode in barcodes) {
            debugPrint('Scanned QR Code: \${barcode.rawValue}');
          }
        },
      ),
    );
  }
}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl flex flex-col lg:flex-row gap-6">
      {/* Smartphone frame */}
      <div className="w-full lg:w-72 bg-black border-[6px] border-slate-800 rounded-[32px] p-4 flex flex-col justify-between h-[450px] relative shrink-0">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full" />

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
          <span>9:41 AM</span>
          <div className="flex gap-1 items-center">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
            <span>Scan App</span>
          </div>
        </div>

        {/* Viewfinder simulation */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 my-4 flex flex-col items-center justify-center gap-3 p-4 relative overflow-hidden">
          {/* Visual camera reticle grid */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500" />

          <SmartphoneIcon className="w-10 h-10 text-indigo-400 animate-pulse" />
          <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-300">Scanning Camera Active</p>
          <span className="text-[9px] text-slate-500 text-center max-w-[160px]">
            Ready to scan and parse customized styled QR vector outputs instantly.
          </span>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 border border-slate-600 rounded-full mx-auto" />
        </div>
      </div>

      {/* Code deliverables */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Native Camera Scanning Boiler
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Download completed Native smartphone wrappers configuring decoders for Android and iOS devices.
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'rn' ? 'border-b-2 border-indigo-400 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('rn')}
          >
            React Native (TS)
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'flutter' ? 'border-b-2 border-indigo-400 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('flutter')}
          >
            Flutter (Dart)
          </button>
        </div>

        {/* Code Block display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-56">
          <pre>{activeTab === 'rn' ? rnCode : flutterCode}</pre>
        </div>
      </div>
    </div>
  );
}

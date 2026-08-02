export interface QRProject {
  id: string;
  userId: string;
  name: string;
  type: 'url' | 'text' | 'wifi' | 'card' | 'email' | 'phone' | 'sms' | 'social' | 'crypto' | 'geo' | 'app' | 'payment';
  content: string;
  design: {
    fgColor: string;
    bgColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    logoUrl?: string; // Data URI, text logo, or emoji
    logoScale?: number; // 0.05 to 0.3
    margin?: number; // 0 to 80 pixel quiet zone whitespace
    logoRotation?: number; // 0 to 360 degrees key logo centering rotation
    colorShift?: boolean; // toggle hue-rotate color shift over time
    eyeColorTopLeft?: string; // independent color for top-left finder eye (optional override)
    eyeColorTopRight?: string; // independent color for top-right finder eye (optional override)
    eyeColorBottomLeft?: string; // independent color for bottom-left finder eye (optional override)
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // error correction density (L=7%, M=15%, Q=25%, H=30%)
    logoAutoCenter?: boolean; // toggle automatic centering or offset
    logoOffsetX?: number; // logo offset adjustment X (-100 to 100)
    logoOffsetY?: number; // logo offset adjustment Y (-100 to 100)
    frameStyle?: 'none' | 'scan-me' | 'visit-website' | 'wifi-password' | 'download-app' | 'follow-us' | 'join-wifi' | 'order-now' | 'pay-here' | 'custom';
    frameText?: string;
    frameColor?: string;
    frameTextColor?: string;
    frameFontSize?: number;
    frameTextPosition?: 'bottom' | 'top';
    smartOptimize?: boolean; // automatically adjust padding & error correction to maintain readability
    modulePadding?: number; // QR module spacing/padding percentage (0 to 40)
  };
  createdAt: string;
  updatedAt?: string;
  scanCount: number;
  trackingEnabled: boolean;
  trackingId: string;
  expiryDate?: string;
  expiryRedirectType?: 'message' | 'url';
  expiryRedirectUrl?: string;
  expiryMessage?: string;
  category?: string;
}

export interface ScanLog {
  id: string;
  projectId: string;
  trackingId: string;
  timestamp: string;
  deviceType: string;
  browser: string;
  approxLocation: string;
  ip: string;
  userId: string;
}

export type AppTab = 'create' | 'templates' | 'analytics' | 'boiler' | 'animations';

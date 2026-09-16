import { useState, useEffect } from 'react';
import { UserSession } from '../lib/api';
import {
  ScanNotificationSettings,
  getDefaultScanNotificationSettings,
  isDNDActiveNow,
} from '../utils/scanNotificationSettings';

export interface LiveToast {
  id: string;
  projectName: string;
  approxLocation: string;
  deviceType: string;
  browser: string;
  timestamp: string;
  ip?: string;
}

export function useScanNotifications(
  user: UserSession | null,
  nPermission: NotificationPermission,
  customSettings?: ScanNotificationSettings
) {
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [suppressedScansCount, setSuppressedScansCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setToasts([]);
      return;
    }

    const token = localStorage.getItem('qr_jwt_token');
    if (!token) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let keepAliveInterval: NodeJS.Timeout | null = null;
    let isClosedOnPurpose = false;

    const establishWS = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        const targetUrl = `${protocol}//${wsHost}/ws?token=${token}`;

        console.log('[WS Socket] Initiating real-time endpoint connection:', targetUrl);
        ws = new WebSocket(targetUrl);

        ws.onopen = () => {
          keepAliveInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'NEW_SCAN') {
              const data = parsed.data;

              // Check DND and notification settings
              const currentSettings = customSettings || getDefaultScanNotificationSettings();
              const isSuppressedByDND = isDNDActiveNow(currentSettings);
              const isToastsEnabled = currentSettings.enabled;

              if (isSuppressedByDND || !isToastsEnabled) {
                console.log(
                  `[WS Socket] Scan logged in background for "${data.projectName}", toast alert suppressed (${
                    isSuppressedByDND ? 'Do Not Disturb active' : 'toasts disabled'
                  }).`
                );
                setSuppressedScansCount((prev) => prev + 1);
                return;
              }

              const uid = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              setToasts((prev) => [
                ...prev,
                {
                  id: uid,
                  projectName: data.projectName,
                  approxLocation: data.approxLocation || 'Unknown Location',
                  deviceType: data.deviceType,
                  browser: data.browser,
                  timestamp: data.timestamp,
                  ip: data.ip || data.ipAddress || ''
                }
              ]);
            }
          } catch (msgErr) {
            console.error('[WS Socket] Message decoding failed:', msgErr);
          }
        };

        ws.onclose = () => {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (!isClosedOnPurpose) {
            reconnectTimeout = setTimeout(establishWS, 4000);
          }
        };
      } catch (e) {
        console.error('[WS Socket] Connection build error:', e);
      }
    };

    establishWS();

    return () => {
      isClosedOnPurpose = true;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    };
  }, [user, customSettings]);

  return { toasts, setToasts, suppressedScansCount };
}

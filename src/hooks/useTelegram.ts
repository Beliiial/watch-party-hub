import { useEffect, useState, useCallback } from 'react';

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
}

interface UseTelegramReturn {
  webApp: any | null;
  user: TelegramUser | null;
  colorScheme: 'light' | 'dark';
  viewportHeight: number;
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showBackButton: () => void;
  hideBackButton: () => void;
  onBackButtonClick: (callback: () => void) => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
}

export const useTelegram = (): UseTelegramReturn => {
  const [webApp, setWebApp] = useState<any | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      setWebApp(tg);
      setColorScheme(tg.colorScheme);
      setViewportHeight(tg.viewportStableHeight || window.innerHeight);
      setIsExpanded(tg.isExpanded);

      if (tg.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        setUser({
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
          isPremium: tgUser.is_premium,
        });
      }

      // Handle viewport changes
      tg.onEvent('viewportChanged', () => {
        setViewportHeight(tg.viewportStableHeight);
        setIsExpanded(tg.isExpanded);
      });

      // Handle theme changes
      tg.onEvent('themeChanged', () => {
        setColorScheme(tg.colorScheme);
      });

      // Auto-expand on load
      tg.expand();
      tg.ready();
    } else {
      // Mock for development outside Telegram
      setUser({
        id: 12345,
        firstName: 'Тест',
        lastName: 'Пользователь',
        username: 'testuser',
      });
    }
  }, []);

  const ready = useCallback(() => {
    webApp?.ready();
  }, [webApp]);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const showBackButton = useCallback(() => {
    webApp?.BackButton?.show();
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    webApp?.BackButton?.hide();
  }, [webApp]);

  const onBackButtonClick = useCallback((callback: () => void) => {
    webApp?.BackButton?.onClick(callback);
  }, [webApp]);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (!webApp?.HapticFeedback) return;
    
    if (['light', 'medium', 'heavy'].includes(type)) {
      webApp.HapticFeedback.impactOccurred(type);
    } else {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  }, [webApp]);

  const showAlert = useCallback((message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  }, [webApp]);

  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    if (webApp) {
      webApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  }, [webApp]);

  return {
    webApp,
    user,
    colorScheme,
    viewportHeight,
    isExpanded,
    ready,
    expand,
    close,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    hapticFeedback,
    showAlert,
    showConfirm,
  };
};

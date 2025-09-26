import { useContext } from 'react';
import { I18nContext } from '@/lib/i18n';

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}

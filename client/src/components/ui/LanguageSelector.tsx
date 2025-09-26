import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  isMobile?: boolean;
}

const LanguageSelector = ({ isMobile = false }: LanguageSelectorProps) => {
  const { language, changeLanguage, t } = useTranslation();
  
  const languages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2">
        <p className="text-sm font-medium">{t('language.select')}</p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className={`flex items-center justify-center ${
                language === lang.code ? 'bg-primary text-white' : 'bg-white text-neutral-600'
              }`}
              onClick={() => changeLanguage(lang.code as 'it' | 'en')}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="px-2 py-1 text-xs border border-neutral-200 rounded flex items-center bg-white mr-2"
        >
          <span className="material-icons text-xs mr-1">translate</span>
          <span>{language.toUpperCase()}</span>
          <span className="material-icons text-xs ml-1">expand_more</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code as 'it' | 'en')}
            className={language === lang.code ? 'bg-neutral-100' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;

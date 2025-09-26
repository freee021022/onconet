import { Link, useLocation } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';

const MobileNavigation = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-40">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/' ? 'text-primary' : 'text-neutral-600'}`}>
            <span className="material-icons">home</span>
            <span className="text-xs">{t('mobileNav.home')}</span>
          </a>
        </Link>
        <Link href="/forum">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/forum' ? 'text-primary' : 'text-neutral-600'}`}>
            <span className="material-icons">forum</span>
            <span className="text-xs">{t('mobileNav.forum')}</span>
          </a>
        </Link>
        <Link href="/second-opinion">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/second-opinion' ? 'text-primary' : 'text-neutral-600'}`}>
            <span className="material-icons">medical_services</span>
            <span className="text-xs">{t('mobileNav.sos')}</span>
          </a>
        </Link>
        <Link href="/pharmacies">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/pharmacies' ? 'text-primary' : 'text-neutral-600'}`}>
            <span className="material-icons">medication</span>
            <span className="text-xs">{t('mobileNav.pharmacies')}</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/profile' ? 'text-primary' : 'text-neutral-600'}`}>
            <span className="material-icons">account_circle</span>
            <span className="text-xs">{t('mobileNav.profile')}</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;

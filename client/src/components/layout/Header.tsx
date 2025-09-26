import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import LanguageSelector from '../ui/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import logoImage from "@assets/ChatGPT Image Jul 24, 2025, 03_25_10 PM_1753363861874.png";


const Header = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  // Safely use auth context with fallback values
  let authContext;
  let user = null;
  let isAuthenticated = false;
  let logout = () => {};
  
  try {
    authContext = useAuth();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
    logout = authContext.logout;
  } catch (error) {
    console.error('Auth context not available');
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center flex-shrink-0 mr-6 hover:opacity-80 transition-opacity">
              <img src={logoImage} alt="Onconet Logo" className="w-16 h-16 mr-3" />
              <div>
                <h1 className="text-2xl font-bold font-secondary text-primary">
                  Onconet
                </h1>
                <p className="text-xs text-neutral-500">{t('header.subtitle')}</p>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/forum" className={`text-neutral-600 hover:text-primary font-medium transition ${location === '/forum' ? 'text-primary' : ''}`}>
                {t('header.nav.forum')}
              </Link>
              <Link href="/second-opinion" className={`text-neutral-600 hover:text-primary font-medium transition ${location === '/second-opinion' ? 'text-primary' : ''}`}>
                {t('header.nav.secondOpinion')}
              </Link>
              <Link href="/pharmacies" className={`text-neutral-600 hover:text-primary font-medium transition ${location === '/pharmacies' ? 'text-primary' : ''}`}>
                {t('header.nav.pharmacies')}
              </Link>
              <Link href="/advanced-features" className={`text-neutral-600 hover:text-primary font-medium transition ${location === '/advanced-features' ? 'text-primary' : ''}`}>
                Funzionalità Avanzate
                <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">NEW</span>
              </Link>
              <Link href="/about" className={`text-neutral-600 hover:text-primary font-medium transition ${location === '/about' ? 'text-primary' : ''}`}>
                {t('header.nav.about')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">

              <LanguageSelector />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-neutral-600">{user?.fullName}</span>
                  {user?.userType === 'patient' && (
                    <Link href="/medical-records">
                      <Button variant="outline" size="sm">
                        Cartella Clinica
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      Profilo
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="text-neutral-600 hover:text-primary"
                  >
                    {t('header.logout')}
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-neutral-600 hover:text-primary mr-4">
                    {t('header.login')}
                  </Link>
                  <Button 
                    className="bg-primary text-white px-4 py-2 hover:bg-primary/90"
                    onClick={() => {
                      // Navigate to home if not already there
                      if (location !== '/') {
                        window.location.href = '/#user-registration';
                      } else {
                        const registrationSection = document.getElementById('user-registration');
                        if (registrationSection) {
                          registrationSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    {t('header.register')}
                  </Button>
                </>
              )}
            </div>
            <button 
              className="md:hidden text-neutral-600" 
              id="mobileMenuButton"
              onClick={toggleMobileMenu}
            >
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white shadow-md fixed inset-0 transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'mobile-menu-open' : 'translate-x-full'
        }`} 
        id="mobileMenu"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-primary">{t('header.menu')}</h2>
          <button id="closeMenu" onClick={closeMobileMenu}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link href="/forum" className="block p-2 hover:bg-neutral-100 rounded" onClick={closeMobileMenu}>
                {t('header.nav.forum')}
              </Link>
            </li>
            <li>
              <Link href="/second-opinion" className="block p-2 hover:bg-neutral-100 rounded" onClick={closeMobileMenu}>
                {t('header.nav.secondOpinion')}
              </Link>
            </li>
            <li>
              <Link href="/pharmacies" className="block p-2 hover:bg-neutral-100 rounded" onClick={closeMobileMenu}>
                {t('header.nav.pharmacies')}
              </Link>
            </li>
            <li>
              <Link href="/about" className="block p-2 hover:bg-neutral-100 rounded" onClick={closeMobileMenu}>
                {t('header.nav.about')}
              </Link>
            </li>
            <li className="border-t my-4 pt-4">
              {isAuthenticated ? (
                <>
                  <span className="block p-2">{user?.fullName}</span>
                  <button 
                    className="block p-2 hover:bg-neutral-100 rounded w-full text-left"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block p-2 hover:bg-neutral-100 rounded" onClick={closeMobileMenu}>
                    {t('header.login')}
                  </Link>
                  <a 
                    href="#user-registration" 
                    className="block bg-primary text-white p-2 rounded text-center mt-2" 
                    onClick={(e) => {
                      e.preventDefault();
                      closeMobileMenu();
                      document.querySelector('#user-registration')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}>
                      {t('header.register')}
                    </a>
                </>
              )}
            </li>
            <li className="border-t my-4 pt-4">
              <LanguageSelector isMobile />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

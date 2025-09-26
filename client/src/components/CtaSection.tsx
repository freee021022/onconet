import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CtaSection = () => {
  const { t } = useTranslation();
  
  // Safely use auth context with fallback values
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.error('Auth context not available in CtaSection');
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-lg text-neutral-600 mb-8">{t('cta.description')}</p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/forum">
                <Button className="bg-primary text-white px-8 py-4 rounded-md font-bold hover:bg-primary/90 transition-colors">
                  <span className="material-icons text-sm mr-1 align-text-bottom">forum</span>
                  {t('cta.exploreForumButton')}
                </Button>
              </Link>
              <Link href="/second-opinion">
                <Button className="bg-[#4c9f70] text-white px-8 py-4 rounded-md font-bold hover:bg-[#3a8a5e] transition-colors">
                  <span className="material-icons text-sm mr-1 align-text-bottom">medical_services</span>
                  {t('cta.exploreServicesButton')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/user-type-selection">
                <Button className="bg-primary text-white px-8 py-4 rounded-md font-bold hover:bg-primary/90 transition-colors">
                  <span className="material-icons text-sm mr-1 align-text-bottom">person_add</span>
                  Inizia Registrazione
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-[#4c9f70] text-white px-8 py-4 rounded-md font-bold hover:bg-[#3a8a5e] transition-colors">
                  <span className="material-icons text-sm mr-1 align-text-bottom">login</span>
                  Accedi
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CtaSection;

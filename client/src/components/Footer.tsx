import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <span className="text-white material-icons text-4xl mr-2">medical_services</span>
              <h2 className="text-2xl font-bold">
                Onco<span className="text-[#4c9f70]">net</span>
              </h2>
            </div>
            <p className="text-neutral-400 mb-6">{t('footer.description')}</p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/onconet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/20"
                title="Seguici su Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/onconet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/20"
                title="Seguici su Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986 6.618 0 11.986-5.368 11.986-11.986C24.003 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.324.876-.807 2.027-1.297 3.324-1.297 1.297 0 2.448.49 3.324 1.297.807.876 1.297 2.027 1.297 3.324 0 1.297-.49 2.448-1.297 3.324-.876.807-2.027 1.297-3.324 1.297zM17.531 18.285h-2.891v-4.533c0-1.109-.022-2.537-1.546-2.537-1.548 0-1.785 1.208-1.785 2.455v4.615H8.418V9.286h2.778v1.297h.04c.387-.732 1.332-1.505 2.744-1.505 2.935 0 3.475 1.932 3.475 4.444v5.263z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/onconet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/20"
                title="Seguici su LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">{t('footer.quickNavigation')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.home')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/forum">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.forum')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/second-opinion">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.secondOpinion')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pharmacies">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.pharmacies')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.about')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.navigation.contact')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">{t('footer.services')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/register?type=patient">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.patientRegistration')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/register?type=doctor">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.doctorRegistration')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/second-opinion">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.onlineConsultations')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.psychologicalSupport')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pharmacies">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.pharmacySearch')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    {t('footer.services.resources')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2 text-neutral-400">location_on</span>
                <span className="text-neutral-400">Via della Salute 123, Milano, Italia</span>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2 text-neutral-400">email</span>
                <a href="mailto:info@onconet24.it" className="text-neutral-400 hover:text-white transition-colors">
                  info@onconet24.it
                </a>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-sm mr-2 text-neutral-400">phone</span>
                <a href="tel:+390123456789" className="text-neutral-400 hover:text-white transition-colors">
                  +39 01 2345 6789
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-3">{t('footer.newsletter')}</h4>
              <form className="flex">
                <Input 
                  type="email" 
                  placeholder={t('footer.yourEmail')} 
                  className="rounded-r-none text-neutral-800 w-full" 
                  required 
                />
                <Button 
                  type="submit" 
                  className="bg-primary text-white px-4 py-2 rounded-l-none hover:bg-primary/90 transition-colors"
                >
                  <span className="material-icons text-sm">send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; 2024 Onconet. {t('footer.allRightsReserved')}
          </p>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-white text-sm transition-colors">
                {t('footer.termsOfService')}
              </a>
            </Link>
            <Link href="/cookies">
              <a className="text-neutral-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </Link>
            <Link href="/gdpr">
              <a className="text-neutral-400 hover:text-white text-sm transition-colors">
                {t('footer.gdprInfo')}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

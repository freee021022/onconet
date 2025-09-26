import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { User } from '@shared/schema';
import DoctorCard from '@/components/secondopinion/DoctorCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';


const SecondOpinion = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Fetch doctors available for second opinion
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['/api/doctors/second-opinion'],
    queryFn: async () => {
      const response = await fetch('/api/doctors/second-opinion');
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      return response.json() as Promise<User[]>;
    }
  });

  // Filter only verified doctors
  const verifiedDoctors = doctors?.filter(doctor => doctor.isVerified) || [];
  
  const steps = [
    {
      number: 1,
      title: t('secondOpinion.steps.request.title'),
      description: t('secondOpinion.steps.request.description'),
    },
    {
      number: 2,
      title: t('secondOpinion.steps.chooseSpecialist.title'),
      description: t('secondOpinion.steps.chooseSpecialist.description'),
    },
    {
      number: 3,
      title: t('secondOpinion.steps.shareDocuments.title'),
      description: t('secondOpinion.steps.shareDocuments.description'),
    },
    {
      number: 4,
      title: t('secondOpinion.steps.receiveConsultation.title'),
      description: t('secondOpinion.steps.receiveConsultation.description'),
    },
  ];

  const benefits = [
    {
      icon: 'verified',
      title: t('secondOpinion.benefits.expertise.title'),
      description: t('secondOpinion.benefits.expertise.description'),
    },
    {
      icon: 'security',
      title: t('secondOpinion.benefits.privacy.title'),
      description: t('secondOpinion.benefits.privacy.description'),
    },
    {
      icon: 'access_time',
      title: t('secondOpinion.benefits.speed.title'),
      description: t('secondOpinion.benefits.speed.description'),
    },
    {
      icon: 'support_agent',
      title: t('secondOpinion.benefits.support.title'),
      description: t('secondOpinion.benefits.support.description'),
    },
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-primary text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/100 to-primary/90 opacity-90"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('secondOpinion.pageTitle')}</h1>
            <p className="text-lg opacity-90 mb-8">{t('secondOpinion.pageDescription')}</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <Link href="/second-opinion/request">
                  <Button className="bg-white text-primary font-bold px-6 py-3 rounded-md hover:bg-neutral-100 transition-colors shadow-lg">
                    {t('secondOpinion.requestButton')}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-primary font-bold px-6 py-3 rounded-md hover:bg-neutral-100 transition-colors shadow-lg">
                    {t('secondOpinion.loginToRequest')}
                  </Button>
                </Link>
              )}
              <Link href="#how-it-works">
                <Button variant="outline" className="border-2 border-white text-white font-bold px-6 py-3 rounded-md hover:bg-white/10 transition-colors">
                  {t('secondOpinion.howItWorksButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('secondOpinion.howItWorks')}
          </h2>
          
          <div className="flex flex-col md:flex-row mb-16">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <img 
                src="https://plus.unsplash.com/premium_photo-1702598537889-ec93d3ff4460?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt={t('secondOpinion.consultationImageAlt')} 
                className="rounded-lg shadow-xl w-full h-auto object-cover" 
              />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-6">{t('secondOpinion.process')}</h3>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div className="flex" key={step.number}>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold">{step.title}</h4>
                      <p className="text-neutral-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link href="/second-opinion/request">
                    <Button className="bg-primary text-white px-6 py-3 rounded-md font-bold hover:bg-primary/90 transition-colors">
                      {t('secondOpinion.requestButton')}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="bg-primary text-white px-6 py-3 rounded-md font-bold hover:bg-primary/90 transition-colors">
                      {t('secondOpinion.loginToRequest')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('secondOpinion.benefitsTitle')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-primary text-2xl">{benefit.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">{benefit.title}</h3>
                <p className="text-neutral-600 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Specialists Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('secondOpinion.ourSpecialists')}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          ) : verifiedDoctors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {verifiedDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
              {verifiedDoctors.length > 8 && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    className="bg-white border border-neutral-200 px-6 py-3 rounded-md text-neutral-700 font-medium hover:bg-neutral-50"
                  >
                    {t('secondOpinion.loadMore')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <span className="material-icons text-neutral-400 text-5xl mb-4">person_search</span>
              <h3 className="text-xl font-bold mb-2">{t('secondOpinion.noDoctorsAvailable')}</h3>
              <p className="text-neutral-600 mb-6">{t('secondOpinion.checkBackLater')}</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('secondOpinion.faqTitle')}
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* FAQ Item 1 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3">{t('secondOpinion.faq.cost.question')}</h3>
                <p className="text-neutral-600">{t('secondOpinion.faq.cost.answer')}</p>
              </div>
              
              {/* FAQ Item 2 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3">{t('secondOpinion.faq.time.question')}</h3>
                <p className="text-neutral-600">{t('secondOpinion.faq.time.answer')}</p>
              </div>
              
              {/* FAQ Item 3 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3">{t('secondOpinion.faq.documents.question')}</h3>
                <p className="text-neutral-600">{t('secondOpinion.faq.documents.answer')}</p>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3">{t('secondOpinion.faq.privacy.question')}</h3>
                <p className="text-neutral-600">{t('secondOpinion.faq.privacy.answer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('secondOpinion.ctaTitle')}</h2>
            <p className="text-lg mb-8 opacity-90">{t('secondOpinion.ctaDescription')}</p>
            <div className="flex gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/second-opinion/request">
                  <Button className="bg-white text-primary px-8 py-4 rounded-md font-bold hover:bg-neutral-100 transition-colors">
                    {t('secondOpinion.requestButton')}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-primary px-8 py-4 rounded-md font-bold hover:bg-neutral-100 transition-colors">
                    {t('secondOpinion.loginToRequest')}
                  </Button>
                </Link>
              )}
              <Link href="/sos-service-detail">
                <Button variant="outline" className="border-white text-white px-8 py-4 rounded-md font-bold hover:bg-white hover:text-primary transition-colors">
                  Scopri di più
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecondOpinion;

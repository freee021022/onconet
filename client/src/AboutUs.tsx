import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const AboutUs = () => {
  const { t } = useTranslation();
  
  const values = [
    {
      icon: 'favorite',
      title: t('about.values.compassion.title'),
      description: t('about.values.compassion.description'),
    },
    {
      icon: 'psychology',
      title: t('about.values.expertise.title'),
      description: t('about.values.expertise.description'),
    },
    {
      icon: 'diversity_3',
      title: t('about.values.community.title'),
      description: t('about.values.community.description'),
    },
    {
      icon: 'verified_user',
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description'),
    },
  ];
  
  const team = [
    {
      name: 'Dr. Alessandra Rossi',
      role: t('about.team.roles.founder'),
      bio: t('about.team.alessandra'),
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      name: 'Dr. Marco Bianchi',
      role: t('about.team.roles.medicalDirector'),
      bio: t('about.team.marco'),
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      name: 'Giulia Verdi',
      role: t('about.team.roles.techLead'),
      bio: t('about.team.giulia'),
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      name: 'Dr. Paolo Marino',
      role: t('about.team.roles.communityManager'),
      bio: t('about.team.paolo'),
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    },
  ];
  
  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-primary text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/100 to-primary/90 opacity-90"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('about.pageTitle')}</h1>
            <p className="text-lg opacity-90 mb-6">{t('about.pageDescription')}</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold mb-6 section-title">{t('about.mission.title')}</h2>
              <p className="text-lg text-neutral-600 mb-6">{t('about.mission.description1')}</p>
              <p className="text-lg text-neutral-600 mb-6">{t('about.mission.description2')}</p>
              <p className="text-lg text-neutral-600">{t('about.mission.description3')}</p>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt={t('about.mission.imageAlt')} 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('about.values.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-primary text-2xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">{value.title}</h3>
                <p className="text-neutral-600 text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('about.team.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-neutral-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt={t('about.history.imageAlt')} 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="md:w-1/2 md:pl-12 order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6 section-title">{t('about.history.title')}</h2>
              <p className="text-lg text-neutral-600 mb-6">{t('about.history.description1')}</p>
              <p className="text-lg text-neutral-600 mb-6">{t('about.history.description2')}</p>
              <p className="text-lg text-neutral-600">{t('about.history.description3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('about.partners.title')}
          </h2>
          
          <p className="text-lg text-neutral-600 text-center max-w-3xl mx-auto mb-10">
            {t('about.partners.description')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-center p-6 bg-neutral-50 rounded-lg">
              <div className="text-center">
                <span className="material-icons text-neutral-400 text-5xl">local_hospital</span>
                <p className="text-neutral-600 font-medium mt-2">Policlinico Gemelli</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-neutral-50 rounded-lg">
              <div className="text-center">
                <span className="material-icons text-neutral-400 text-5xl">local_hospital</span>
                <p className="text-neutral-600 font-medium mt-2">Istituto Nazionale Tumori</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-neutral-50 rounded-lg">
              <div className="text-center">
                <span className="material-icons text-neutral-400 text-5xl">school</span>
                <p className="text-neutral-600 font-medium mt-2">Università La Sapienza</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-neutral-50 rounded-lg">
              <div className="text-center">
                <span className="material-icons text-neutral-400 text-5xl">volunteer_activism</span>
                <p className="text-neutral-600 font-medium mt-2">Fondazione AIRC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('about.cta.title')}</h2>
            <p className="text-lg mb-8 opacity-90">{t('about.cta.description')}</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button className="bg-white text-primary px-8 py-4 rounded-md font-bold hover:bg-neutral-100 transition-colors">
                  {t('about.cta.joinButton')}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-md font-bold hover:bg-white/10 transition-colors">
                  {t('about.cta.contactButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

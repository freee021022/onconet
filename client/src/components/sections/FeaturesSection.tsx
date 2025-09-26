import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';

const FeaturesSection = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: 'forum',
      title: t('features.forum.title'),
      description: t('features.forum.description'),
      link: '/forum',
      linkText: t('features.forum.linkText'),
    },
    {
      icon: 'medical_services',
      title: t('features.secondOpinion.title'),
      description: t('features.secondOpinion.description'),
      link: '/second-opinion',
      linkText: t('features.secondOpinion.linkText'),
    },
    {
      icon: 'medication',
      title: t('features.pharmacies.title'),
      description: t('features.pharmacies.description'),
      link: '/pharmacies',
      linkText: t('features.pharmacies.linkText'),
    },
  ];
  
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 section-title mx-auto centered" style={{ width: 'fit-content' }}>
          {t('features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">{feature.title}</h3>
              <p className="text-neutral-600 text-center">{feature.description}</p>
              <div className="mt-6 text-center">
                <Link href={feature.link}>
                  <a className="text-primary font-bold inline-flex items-center hover:text-primary/80">
                    {feature.linkText}
                    <span className="material-icons text-sm ml-1">arrow_forward</span>
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

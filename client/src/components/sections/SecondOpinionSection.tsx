import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import DoctorCard from '../secondopinion/DoctorCard';
import { User } from '@shared/schema';
import sosImage from "@assets/sos_1753368258648.jpg";

interface SecondOpinionSectionProps {
  doctors: User[];
}

const SecondOpinionSection = ({ doctors }: SecondOpinionSectionProps) => {
  const { t } = useTranslation();
  
  // Filter only verified doctors and take 4
  const featuredDoctors = doctors
    .filter(doctor => doctor.userType === 'professional' && doctor.isVerified)
    .slice(0, 4);
  
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
  
  return (
    <section id="sos" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('secondOpinion.title')}
          </h2>
          <p className="text-lg text-neutral-600">
            {t('secondOpinion.description')}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row mb-16">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <img 
              src={sosImage} 
              alt={t('secondOpinion.consultationImageAlt')} 
              className="rounded-lg shadow-xl w-full h-auto" 
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-6">{t('secondOpinion.howItWorks')}</h3>
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
              <Link href="/second-opinion/request">
                <Button className="bg-primary text-white px-6 py-3 rounded-md font-bold hover:bg-primary/90 transition-colors">
                  {t('secondOpinion.requestButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-6 text-center">{t('secondOpinion.featuredSpecialists')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.length > 0 ? (
            featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4 text-center">
                  <p>{t('secondOpinion.noDoctorsAvailable')}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/second-opinion/specialists">
            <Button
              variant="outline"
              className="bg-white border border-neutral-200 px-6 py-3 rounded-md text-neutral-700 font-medium hover:bg-neutral-50"
            >
              {t('secondOpinion.viewAllSpecialists')}
              <span className="material-icons text-sm ml-1 align-text-bottom">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecondOpinionSection;

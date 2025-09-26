import { useTranslation } from '@/hooks/use-translation';
import TestimonialCard from '../testimonial/TestimonialCard';
import { Testimonial } from '@shared/schema';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 md:py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">{t('testimonials.title')}</h2>
          <p className="text-lg opacity-90">{t('testimonials.description')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

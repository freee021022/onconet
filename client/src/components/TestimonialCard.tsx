import { Testimonial } from '@shared/schema';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-neutral-700">
      <div className="flex text-yellow-400 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="material-icons">
            {star <= testimonial.rating ? 'star' : 'star_border'}
          </span>
        ))}
      </div>
      <p className="italic mb-6">{testimonial.content}</p>
      <div className="flex items-center">
        <img 
          src={testimonial.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"} 
          alt={`Profile of ${testimonial.name}`} 
          className="w-12 h-12 rounded-full mr-4" 
        />
        <div>
          <h4 className="font-bold">{testimonial.name}</h4>
          <p className="text-sm text-neutral-500">{testimonial.role}, {testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;

import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';

interface DoctorCardProps {
  doctor: User;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const { t } = useTranslation();
  
  // Mock data that would normally come from the API
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 50) + 10;
  
  return (
    <div className="bg-neutral-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <img 
        src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"} 
        alt={doctor.fullName} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <div className="flex items-center mb-2">
          <h4 className="font-bold">{doctor.fullName}</h4>
          {doctor.isVerified && (
            <span className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <span className="material-icons text-xs mr-0.5">verified</span>
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mb-2">
          {doctor.isDoctor ? t('doctor.title') : ''} - {doctor.specialization || t('doctor.specialization.general')}
        </p>
        <p className="text-sm text-neutral-600 mb-4">{doctor.hospital}, {doctor.city}</p>
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="material-icons text-sm">
                {star <= Math.floor(rating) 
                  ? 'star' 
                  : star === Math.ceil(rating) && !Number.isInteger(rating)
                    ? 'star_half'
                    : 'star_border'}
              </span>
            ))}
          </div>
          <span className="text-xs text-neutral-500 ml-1">({reviewCount} {t('doctor.ratings')})</span>
        </div>
        <Link href={`/second-opinion/doctors/${doctor.id}`}>
          <Button
            variant="outline"
            className="w-full bg-white border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            {t('doctor.viewProfile')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;

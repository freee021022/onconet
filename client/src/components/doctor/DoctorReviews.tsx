import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DoctorReviewsProps {
  doctorId: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  patientName: string;
  patientAvatar?: string;
  createdAt: string;
}

const DoctorReviews = ({ doctorId }: DoctorReviewsProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: [`/api/doctors/${doctorId}/reviews`],
    queryFn: async () => {
      const response = await fetch(`/api/doctors/${doctorId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json() as Promise<Review[]>;
    }
  });

  const averageRating = reviews?.length ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${sizeClass} ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recensioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recensioni
          </CardTitle>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <Badge variant="outline">
                {reviews.length} recensioni
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione</h3>
            <p className="text-gray-600">Non ci sono ancora recensioni per questo medico.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Media generale</div>
                  {renderStars(Math.round(averageRating))}
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{reviews.length}</div>
                  <div className="text-sm text-gray-600">Recensioni totali</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Recensioni positive</div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              <h4 className="font-medium">Distribuzione valutazioni</h4>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-6">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              <h4 className="font-medium">Recensioni pazienti</h4>
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.patientAvatar} alt={review.patientName} />
                      <AvatarFallback>
                        {review.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{review.patientName}</h5>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating, 'sm')}
                            <span className="text-xs text-gray-500">
                              {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: it })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorReviews;